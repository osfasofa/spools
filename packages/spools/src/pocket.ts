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
}

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

  constructor(opts: PocketClientOptions) {
    this.#origin = pocketOrigin(opts.relay)
    this.#code = opts.code
    this.#key = opts.key
    this.#doc = opts.doc
    this.#whenReady = opts.whenReady
    this.token = deriveToken(opts.key)
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

  /** fetch → verify envelope → decrypt → merge after local persistence loads */
  async start(): Promise<void> {
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
      applied++
    }
    this.#fetched = {
      newestAt: typeof raw[0]?.at === 'number' ? (raw[0].at as number) : 0,
      ttlDays: typeof json.ttlDays === 'number' ? json.ttlDays : 60,
      count: raw.length,
    }
    this.#set(applied > 0 ? { phase: 'applied', applied, dropped } : { phase: 'empty', applied, dropped })
  }

  destroy(): void {
    this.#destroyed = true
    this.#abort.abort()
    this.#listeners.clear()
  }
}
