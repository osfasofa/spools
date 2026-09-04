/**
 * The pocket (M10): the relay's optional held-copies capability, client side.
 *
 * A keyed spool derives a namespace token from its key (one-way,
 * domain-separated — no server ever learns the key, and a code-only stranger
 * can't guess where deposits live), then on open collects whatever sealed
 * full-state deposits the relay holds, decrypts them locally, and merges
 * with `Y.applyUpdate` — the same no-clobber CRDT semantics as importSpool.
 * T-102 is this fetch side; the deposit scheduler is T-103.
 *
 * Capability detection is the envelope, not the status code: an old relay
 * answers 200 + health JSON to any GET, so a 200 whose body doesn't say
 * `format: "spool-pocket"` means NO capability — never "empty pocket"
 * (T-100 S5, the 200-trap). Origins that fail the check are remembered for
 * the session so a stash full of spools doesn't re-probe an old relay.
 *
 * Keyless spools derive no token and skip all of this by construction —
 * "the relay stores ciphertext or nothing" is structural, not policed.
 */
import * as Y from 'yjs'
import nacl from 'tweetnacl'
import { decrypt, encrypt } from './crypto'
import { encodeKey } from './link'
import { b64decode } from './bytes'

export const POCKET_VERSION = 1
/** wire prefix marking a sealed deposit (0xE2E3 — the family: E2E1 wire, E2E2 at rest, E2E3 deposited) */
export const DEPOSIT_MAGIC: readonly [number, number] = [0xe2, 0xe3]
const HEADER_LEN = 7 // magic(2) + version(1) + tag(4)
const TOKEN_DOMAIN = 'spool-pocket-v1'
/** transaction origin for pocket-applied updates — remote-origin by construction, so the T-103 `tr.local` gate can never self-feed */
export const POCKET_TX_ORIGIN = 'spool-pocket'

export type PocketPhase = 'checking' | 'applied' | 'empty' | 'unavailable'

export interface PocketState {
  phase: PocketPhase
  /** deposits merged into the doc (present once settled) */
  applied?: number
  /** deposits dropped unapplied — bad envelope, bad base64, or failed authentication */
  dropped?: number
  /**
   * Set when the relay refused a deposit. 'too-big' (413: the sealed doc
   * exceeds the per-deposit cap) and 'budget' (507: the relay is full) are
   * hard limits — depositing stops and the spool degrades, loudly, to
   * live-only sync. 'rate-limited' (429, T-178) is the soft one: the final
   * deposit — leave()'s flush, or a hidden tab's — was refused through the
   * bounded retry, so the pocket lacks the last changes; it clears on the
   * next deposit the relay accepts.
   */
  depositError?: 'too-big' | 'budget' | 'rate-limited'
}

/** @internal timing knobs, overridable only by tests (mirrors HistoryTuning) */
export interface PocketTuning {
  /** idle wait after a local change before depositing */
  debounceMs?: number
  /** minimum spacing between deposits (they're heavier than history moments) */
  minGapMs?: number
  /** retries a flush makes after a 429 before naming the loss; default 2 (three tries) */
  flushRetries?: number
  /** wait before a flush's first retry, doubling per retry; default 1 s (tries at +0, +1 s, +3 s) */
  flushBackoffMs?: number
  /** how long a flush waits for the open-time check to settle before depositing what it has; default 3 s */
  settleWaitMs?: number
}

/**
 * @internal Browsers let a fetch outlive its page only with `keepalive`, and
 * cap such bodies at 64 KiB in flight — above it the option makes the fetch
 * fail outright, so it is set only when the sealed deposit fits (T-178).
 */
export const KEEPALIVE_MAX_BYTES = 64 * 1024

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
/** a sleep that never keeps a process alive on its own (a race's losing side) */
const bounded = (ms: number): Promise<void> =>
  new Promise((r) => {
    const t = setTimeout(r, ms)
    ;(t as { unref?: () => void }).unref?.()
  })

/** the state minus its depositError — the heal after a 'rate-limited' flush (T-178) */
const withoutError = ({ depositError: _cleared, ...rest }: PocketState): PocketState => rest

/** @internal token = base64url(SHA-512("spool-pocket-v1" ‖ key)[0..12)) — derived by clients only */
export const deriveToken = (key: Uint8Array): string => {
  const domain = new TextEncoder().encode(TOKEN_DOMAIN)
  const input = new Uint8Array(domain.length + key.length)
  input.set(domain, 0)
  input.set(key, domain.length)
  return encodeKey(nacl.hash(input).subarray(0, 12))
}

/** @internal deposit envelope: magic ‖ version ‖ tag(4) ‖ nonce ‖ ciphertext */
export const sealDeposit = (update: Uint8Array, key: Uint8Array, tag: Uint8Array): Uint8Array => {
  const sealed = encrypt(update, key)
  const blob = new Uint8Array(HEADER_LEN + sealed.length)
  blob[0] = DEPOSIT_MAGIC[0]
  blob[1] = DEPOSIT_MAGIC[1]
  blob[2] = POCKET_VERSION
  blob.set(tag.subarray(0, 4), 3)
  blob.set(sealed, HEADER_LEN)
  return blob
}

/** @internal null on wrong magic, wrong version, wrong key, or tampering — the drop path */
export const openDeposit = (blob: Uint8Array, key: Uint8Array): Uint8Array | null => {
  if (
    blob.length < HEADER_LEN ||
    blob[0] !== DEPOSIT_MAGIC[0] ||
    blob[1] !== DEPOSIT_MAGIC[1] ||
    blob[2] !== POCKET_VERSION
  ) {
    return null
  }
  return decrypt(blob.subarray(HEADER_LEN), key)
}

/** @internal ws(s) relay URL → the http(s) origin the pocket lives on; null when the URL doesn't parse */
export const pocketOrigin = (relay: string): string | null => {
  try {
    const url = new URL(relay)
    const scheme = url.protocol === 'wss:' ? 'https:' : url.protocol === 'ws:' ? 'http:' : null
    return scheme ? `${scheme}//${url.host}` : null
  } catch {
    return null
  }
}

/** the 200-trap rule: a response is only a pocket if the envelope says so */
const isPocketEnvelope = (json: unknown): json is { version: number; deposits?: unknown; ttlDays?: unknown } =>
  typeof json === 'object' &&
  json !== null &&
  (json as { format?: unknown }).format === 'spool-pocket' &&
  typeof (json as { version?: unknown }).version === 'number'

/** origins that answered like an old relay — skip them for the rest of the session */
const unavailableOrigins = new Set<string>()
/** @internal tests only */
export const _resetPocketCache = (): void => unavailableOrigins.clear()

interface FetchedInfo {
  /** wall-clock ms of the newest deposit the relay returned (0 = none) */
  newestAt: number
  /** the relay's advertised courtesy window */
  ttlDays: number
  /** how many deposits came back */
  count: number
}

export interface PocketClientOptions {
  relay: string
  code: string
  key: Uint8Array
  doc: Y.Doc
  whenReady: Promise<void>
  tuning?: PocketTuning
}

/**
 * @internal Spool owns one when it has both a key and a relay. start() is
 * fire-and-forget: the pocket never blocks open() or whenReady — its worst
 * case is exactly v1 behavior.
 */
export class PocketClient {
  readonly token: string
  #origin: string | null
  #code: string
  #key: Uint8Array
  #doc: Y.Doc
  #whenReady: Promise<void>
  #state: PocketState = { phase: 'checking' }
  #listeners = new Set<(state: PocketState) => void>()
  #abort = new AbortController()
  #destroyed = false
  #fetched: FetchedInfo | null = null

  // deposit side (T-103): a scheduler shaped exactly like HistoryLog's —
  // armed only once the open-time fetch has settled, gated on tr.local so
  // pocket-applied (remote-origin) state can never schedule a re-deposit
  #tag = crypto.getRandomValues(new Uint8Array(4))
  #debounceMs: number
  #minGapMs: number
  #flushRetries: number
  #flushBackoffMs: number
  #settleWaitMs: number
  #started: Promise<void> | null = null
  #armed = false
  #dirty = false
  /** the last PUT was answered 429 — what flush()'s bounded retry reads */
  #rateLimited = false
  #timer: ReturnType<typeof setTimeout> | null = null
  #lastDepositAt = 0
  #inflight: Promise<void> | null = null
  #flushing: Promise<void> | null = null
  #onVisibility: (() => void) | null = null

  constructor(opts: PocketClientOptions) {
    this.#origin = pocketOrigin(opts.relay)
    this.#code = opts.code
    this.#key = opts.key
    this.#doc = opts.doc
    this.#whenReady = opts.whenReady
    this.token = deriveToken(opts.key)
    this.#debounceMs = opts.tuning?.debounceMs ?? 10_000
    this.#minGapMs = opts.tuning?.minGapMs ?? 60_000
    this.#flushRetries = opts.tuning?.flushRetries ?? 2
    this.#flushBackoffMs = opts.tuning?.flushBackoffMs ?? 1_000
    this.#settleWaitMs = opts.tuning?.settleWaitMs ?? 3_000
    this.#doc.on('afterTransaction', this.#onTransaction)
    if (typeof document !== 'undefined') {
      // a hidden tab may never come back — flush what's pending (a real PUT,
      // keepalive when it fits; beacons can't carry a real doc, see the
      // 64 KiB note in the brief)
      this.#onVisibility = () => {
        if (document.visibilityState === 'hidden' && this.#dirty) void this.flush()
      }
      document.addEventListener('visibilitychange', this.#onVisibility)
    }
  }

  get state(): PocketState {
    return this.#state
  }

  /** @internal what the open-time fetch learned; T-103's deposit-if-ahead / refresh-if-stale read this */
  get fetched(): FetchedInfo | null {
    return this.#fetched
  }

  onState(cb: (state: PocketState) => void): () => void {
    this.#listeners.add(cb)
    return () => this.#listeners.delete(cb)
  }

  #set(state: PocketState): void {
    this.#state = state
    for (const cb of this.#listeners) cb(state)
  }

  /** fetch → verify envelope → decrypt → merge after local persistence loads; once */
  start(): Promise<void> {
    return (this.#started ??= this.#start())
  }

  async #start(): Promise<void> {
    if (!this.#origin || unavailableOrigins.has(this.#origin)) {
      this.#set({ phase: 'unavailable' })
      return
    }
    this.#set({ phase: 'checking' })
    let json: unknown
    try {
      const res = await fetch(`${this.#origin}/pocket/${this.#code}/${this.token}`, {
        signal: this.#abort.signal,
      })
      json = await res.json()
    } catch {
      if (this.#destroyed) return // we left mid-check: leave 'checking' as the honest last word
      this.#set({ phase: 'unavailable' })
      return
    }
    if (!isPocketEnvelope(json)) {
      unavailableOrigins.add(this.#origin) // an old relay stays old for the session
      this.#set({ phase: 'unavailable' })
      return
    }
    if (json.version > POCKET_VERSION) {
      // newer than this SDK understands — same rule as export files
      this.#set({ phase: 'unavailable' })
      return
    }
    const raw = Array.isArray(json.deposits) ? (json.deposits as { at?: unknown; blob?: unknown }[]) : []
    await this.#whenReady // merge only after local persistence has loaded
    if (this.#destroyed) return
    let applied = 0
    let dropped = 0
    const appliedUpdates: Uint8Array[] = []
    for (const d of raw) {
      let update: Uint8Array | null = null
      if (typeof d.blob === 'string') {
        try {
          update = openDeposit(b64decode(d.blob), this.#key)
        } catch {
          update = null
        }
      }
      if (!update) {
        dropped++
        continue
      }
      Y.applyUpdate(this.#doc, update, POCKET_TX_ORIGIN)
      appliedUpdates.push(update)
      applied++
    }
    this.#fetched = {
      newestAt: typeof raw[0]?.at === 'number' ? (raw[0].at as number) : 0,
      ttlDays: typeof json.ttlDays === 'number' ? json.ttlDays : 60,
      count: raw.length,
    }
    this.#set(applied > 0 ? { phase: 'applied', applied, dropped } : { phase: 'empty', applied, dropped })

    // the capability is live — arm the deposit scheduler, then settle the
    // open-time obligations: deposit-if-ahead (repopulation after TTL or a
    // relay wipe) and refresh-if-stale (quiet-but-loved spools stay covered)
    this.#armed = true
    const ahead = this.#isAheadOf(appliedUpdates)
    const halfTtl = (this.#fetched.ttlDays * 86_400_000) / 2
    const stale = this.#fetched.newestAt > 0 && Date.now() - this.#fetched.newestAt > halfTtl
    // winds made before now left `dirty` set; the state-vector check is the
    // truth about whether they need carrying (another device may already
    // have deposited them), so it decides, not the flag
    this.#dirty = ahead || (stale && this.#docHasState())
    if (this.#dirty) void this.#deposit()
  }

  /** does the local doc hold anything beyond what the given updates carry? */
  #isAheadOf(updates: Uint8Array[]): boolean {
    if (!this.#docHasState()) return false
    if (updates.length === 0) return true
    const probe = new Y.Doc({ gc: false })
    for (const u of updates) Y.applyUpdate(probe, u)
    const probeSv = Y.decodeStateVector(Y.encodeStateVector(probe))
    probe.destroy()
    const localSv = Y.decodeStateVector(Y.encodeStateVector(this.#doc))
    for (const [client, clock] of localSv) {
      if ((probeSv.get(client) ?? 0) < clock) return true
    }
    return false
  }

  #docHasState(): boolean {
    return Y.decodeStateVector(Y.encodeStateVector(this.#doc)).size > 0
  }

  #onTransaction = (tr: Y.Transaction): void => {
    // tr.local alone is the whole self-feed guard: pocket-applied updates
    // arrive under POCKET_TX_ORIGIN (remote), and depositing itself never
    // writes the doc — unlike HistoryLog there is no in-doc log to exclude
    if (this.#destroyed || !tr.local) return
    // before the open-time check settles nothing is scheduled — but the wind
    // is remembered, so a flush() that comes first still carries it (T-178)
    this.#dirty = true
    if (this.#armed) this.#schedule()
  }

  #schedule(): void {
    if (this.#timer) clearTimeout(this.#timer)
    const wait = Math.max(this.#debounceMs, this.#lastDepositAt + this.#minGapMs - Date.now())
    this.#timer = setTimeout(() => {
      this.#timer = null
      void this.#deposit()
    }, wait)
  }

  /** the hard limits stop depositing for good; 'rate-limited' is transient and does not */
  #stopped(): boolean {
    const e = this.#state.depositError
    return e === 'too-big' || e === 'budget'
  }

  async #deposit(): Promise<void> {
    if (this.#inflight) return this.#inflight
    if (this.#destroyed || !this.#dirty || !this.#origin || this.#stopped()) return
    this.#inflight = this.#put()
    try {
      await this.#inflight
    } finally {
      this.#inflight = null
    }
  }

  /** one PUT of the whole sealed doc; sets the flags the scheduler and flush() read */
  async #put(): Promise<void> {
    const blob = sealDeposit(Y.encodeStateAsUpdate(this.#doc), this.#key, this.#tag)
    this.#dirty = false
    this.#rateLimited = false
    try {
      const res = await fetch(`${this.#origin}/pocket/${this.#code}/${this.token}`, {
        method: 'PUT',
        body: blob as unknown as BodyInit,
        // a small deposit outlives its tab — the visibilitychange flush's
        // whole point; a big one can't carry the option at all (T-178)
        ...(blob.length <= KEEPALIVE_MAX_BYTES ? { keepalive: true } : {}),
      })
      this.#lastDepositAt = Date.now()
      if (res.status === 413) this.#set({ ...this.#state, depositError: 'too-big' })
      else if (res.status === 507) this.#set({ ...this.#state, depositError: 'budget' })
      else if (res.status === 429) {
        // the relay's per-IP budget is a sliding minute and so is the
        // min-gap: stay pending and re-arm, so a quiet spool retries on its
        // own instead of waiting for the next change (T-178)
        this.#dirty = true
        this.#rateLimited = true
        if (!this.#destroyed) this.#schedule()
      } else if (!res.ok) this.#dirty = true // 5xx and friends: pending until the next change
      else if (this.#state.depositError === 'rate-limited') this.#set(withoutError(this.#state))
    } catch {
      this.#dirty = true // relay unreachable = live-only for now; retry on the next change
      this.#lastDepositAt = Date.now()
    }
  }

  /**
   * Capture pending changes right now instead of waiting out the debounce —
   * leave()'s last act before teardown, and the visibilitychange fallback.
   * Resolves once the PUT settles (or fails; failure is not a reason to
   * block leaving — the doc stays safe locally either way). A 429 on the
   * way out is retried inside a bounded wait and then NAMED — never
   * swallowed: that was the syrup/manyhands loss (T-178).
   */
  flush(): Promise<void> {
    if (!this.#flushing) {
      this.#flushing = this.#flushNow().finally(() => {
        this.#flushing = null
      })
    }
    return this.#flushing
  }

  async #flushNow(): Promise<void> {
    if (this.#timer) {
      clearTimeout(this.#timer)
      this.#timer = null
    }
    if (!this.#armed && this.#dirty && this.#started) {
      // leave() before the open-time check settled (T-182's wall): wait a
      // bounded moment so the deposit carries the pocket's state too —
      // past the bound, deposit what we have rather than nothing
      await Promise.race([this.#started, bounded(this.#settleWaitMs)])
      if (this.#state.phase === 'unavailable') return // no pocket to carry it to
    }
    if (this.#inflight) await this.#inflight
    if (!this.#dirty) return
    await this.#deposit()
    // three tries inside a few seconds: the relay's remedy for 429 is waiting
    for (let i = 0; i < this.#flushRetries && this.#rateLimited && !this.#destroyed; i++) {
      await sleep(this.#flushBackoffMs * 2 ** i)
      if (this.#destroyed) return
      await this.#deposit()
    }
    if (this.#rateLimited && !this.#destroyed) this.#set({ ...this.#state, depositError: 'rate-limited' })
  }

  destroy(): void {
    this.#destroyed = true
    if (this.#timer) clearTimeout(this.#timer)
    this.#timer = null
    this.#doc.off('afterTransaction', this.#onTransaction)
    if (this.#onVisibility) document.removeEventListener('visibilitychange', this.#onVisibility)
    this.#abort.abort()
    this.#listeners.clear()
  }
}
