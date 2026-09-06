import * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'
import { SpoolEngine, type SpoolStatus } from './engine'
import { EntryStore, type Entry, type EntryChange, type WindInput } from './entry'
import { HistoryLog, type EntrySnapshot, type HistoryTuning } from './history'
import { buildExport, parseExport } from './export'
import { touch } from './stash'
import { buildSpoolLink, generateCode, generateKey, parseSpoolLink } from './link'
import { keyFingerprint } from './crypto'
import { PocketClient, type PocketState, type PocketTuning } from './pocket'

/**
 * The canonical spools-relay (deployed T-041), at a hostname we own since
 * T-160 (3 Sep 2026): links pin the relay they name, so the name had to be
 * ours before more links went out. The Railway-generated hostname the first
 * links carry (`spools-relay-production.up.railway.app`) stays enabled on
 * the same service indefinitely — same process, same rooms, same pocket. A
 * true dumb byte relay — it never parses a frame and holds no documents.
 * fosho's relay carried M1–M3; the fosho dependency ended here.
 */
export const DEFAULT_RELAY = 'wss://relay.spools.lol/yjs'

/**
 * The one-URL convention (T-040): a relay URL ending in /yjs implies
 * y-webrtc signaling at the same host's root — one link param, both jobs.
 * spools-relay and fosho's deployed relay both fit the shape; a relay URL
 * that doesn't match syncs over websocket alone.
 */
export const deriveSignaling = (relay: string): string[] | undefined => {
  try {
    const url = new URL(relay)
    if (url.pathname === '/yjs' || url.pathname === '/yjs/') {
      return [`${url.protocol}//${url.host}/`]
    }
  } catch {
    // engine validates the relay URL; here an unparseable one just means no signaling
  }
  return undefined
}

export interface NewSpoolOptions {
  /** wss relay URL; default: the SDK's default relay */
  relay?: string
  /** self-declared display name stamped on entries you wind (T-012) */
  author?: string
  /** default true in browsers; false = memory-only (tests, previews) */
  persist?: boolean
  /**
   * default true: newSpool generates a key, carried in the link's k= and
   * used to encrypt local storage (M5). false = keyless spool, plaintext
   * at rest, link without k=. openSpool ignores this — the link decides.
   */
  encrypted?: boolean
}

export type OpenSpoolOptions = Omit<NewSpoolOptions, 'relay' | 'encrypted'>

/**
 * The spool handle: one spool = one Y.Doc = one sync boundary = one link.
 * This ticket (T-011) gives it identity + lifecycle; the entry layer
 * (wind/entries/events) lands in T-012.
 */
export class Spool {
  readonly code: string
  readonly whenReady: Promise<void>
  /** escape hatch for power users binding editors */
  readonly doc: Y.Doc
  /** self-declared author for entries wound here (T-012) */
  readonly author: string

  #engine: SpoolEngine
  #store: EntryStore
  #history: HistoryLog
  #pocket: PocketClient | null
  #relay: string
  /** carried from the link / generated fresh; seals storage (T-050) and both transports (T-051) */
  #key: Uint8Array | undefined

  /** @internal use newSpool/openSpool; historyTuning/pocketTuning are for tests only */
  constructor(
    engine: SpoolEngine,
    relay: string,
    key: Uint8Array | undefined,
    author: string,
    historyTuning?: HistoryTuning,
    pocketTuning?: PocketTuning
  ) {
    this.#engine = engine
    this.#relay = relay
    this.#key = key
    this.author = author
    this.code = engine.code
    this.doc = engine.doc
    this.whenReady = engine.whenReady
    this.#store = new EntryStore(engine.doc, author, engine.whenReady)
    this.#history = new HistoryLog(engine.doc, engine.whenReady, historyTuning)
    // the pocket needs both a key (to derive the namespace and unseal) and a
    // relay (to fetch from) — keyless or offline spools skip it structurally.
    // start() is fire-and-forget: worst case is exactly v1 behavior, and
    // whenReady stays purely local either way.
    this.#pocket =
      key && relay
        ? new PocketClient({
            relay,
            code: engine.code,
            key,
            doc: engine.doc,
            whenReady: engine.whenReady,
            tuning: pocketTuning,
          })
        : null
    void this.#pocket?.start()
  }

  get status(): SpoolStatus {
    return this.#engine.status
  }

  /**
   * The engine's awareness instance, shared across both transports (M11,
   * T-112) — the one SDK change of the milestone. App-defined payload,
   * best-effort, ephemeral by design: state expires ~30 s after its writer
   * goes quiet and must never be persisted (ghost presence is a named
   * refusal). Sealed on keyed spools by construction — awareness frames ride
   * the same encrypted transport as sync frames. null when relayless.
   */
  get awareness(): Awareness | null {
    return this.#engine.awareness
  }

  /** short key fingerprint for "are we on the same key?" UX; null for keyless spools */
  get keyFingerprint(): string | null {
    return this.#key ? keyFingerprint(this.#key) : null
  }

  /**
   * Relay frames dropped because they weren't sealed with this spool's key —
   * nonzero means someone in the room is on the wrong key or no key (T-051).
   * Always 0 for keyless spools.
   */
  get undecryptableFrames(): number {
    return this.#engine.undecryptableFrames
  }

  /**
   * The relay refused the last connection with 1013 "room full" (T-169):
   * the room is at the relay's per-room cap. The SDK stands back (~30 s)
   * between attempts instead of spinning, and `status` reads 'offline'
   * meanwhile; clears the moment a connection is accepted. Watch refusals
   * via on('full'). The status union stays closed — this is beside it.
   */
  get roomFull(): boolean {
    return this.#engine.roomFull
  }

  /**
   * What the pocket did on open: `checking` → `applied` / `empty` /
   * `unavailable` (old relay, no relay, dead relay — all degrade to v1
   * behavior). null for keyless or relayless spools, which have no pocket
   * by construction. Watch transitions via on('pocket').
   */
  get pocket(): PocketState | null {
    return this.#pocket?.state ?? null
  }

  /** live truth: sorted by createdAt (id tie-break), soft-deleted excluded */
  get entries(): Entry[] {
    return this.#store.list()
  }

  /** soft-deleted entries — same live handles and sort as entries; entry.restore() brings one back */
  get deleted(): Entry[] {
    return this.#store.listDeleted()
  }

  /** add an entry; synchronous — local-first means there's nothing to await */
  wind(input: WindInput): Entry {
    return this.#store.wind(input)
  }

  /**
   * Write complete entry records — identity, time, author, parent, data,
   * body — into this spool exactly as given, in one transaction (T-186).
   * Idempotent: an id already here is skipped. Refuses the batch, before
   * any write, if a record's parent is neither in the batch nor in this
   * spool (SpoolSpliceError). The primitive under the cut; policy-free —
   * what crosses, what's flattened, and the new key are the caller's.
   */
  splice(records: readonly EntrySnapshot[]): Entry[] {
    return this.#store.splice(records)
  }

  on(event: 'entry', cb: (change: EntryChange) => void): () => void
  on(event: 'status', cb: (status: SpoolStatus) => void): () => void
  on(event: 'undecryptable', cb: (total: number) => void): () => void
  on(event: 'pocket', cb: (state: PocketState) => void): () => void
  on(event: 'full', cb: (reason: string) => void): () => void
  on(
    event: 'entry' | 'status' | 'undecryptable' | 'pocket' | 'full',
    cb:
      | ((change: EntryChange) => void)
      | ((status: SpoolStatus) => void)
      | ((total: number) => void)
      | ((state: PocketState) => void)
      | ((reason: string) => void)
  ): () => void {
    if (event === 'entry') return this.#store.onEntry(cb as (change: EntryChange) => void)
    if (event === 'status') return this.#engine.onStatus(cb as (status: SpoolStatus) => void)
    if (event === 'undecryptable') return this.#engine.onUndecryptable(cb as (total: number) => void)
    // additive event (the status union stays closed); keyless spools have no
    // pocket, so the subscription is a valid no-op that never fires
    if (event === 'pocket') return this.#pocket?.onState(cb as (state: PocketState) => void) ?? (() => {})
    // additive too (T-169): fires with the relay's close reason on every
    // refused attempt while the room is full
    if (event === 'full') return this.#engine.onFull(cb as (reason: string) => void)
    throw new Error(`unknown event: ${String(event)}`)
  }

  /**
   * Recorded moment timestamps (ms), ascending — what rewind() can target;
   * the history scrubber's tick marks. Moments are logged debounced-on-idle
   * by whichever peer wrote, and merge like everything else.
   */
  get history(): number[] {
    return this.#history.moments
  }

  /**
   * The spool as it was at the latest recorded moment ≤ ts: plain frozen
   * EntrySnapshots (soft-deleted-then entries included, with deletedAt set).
   * Read-only time travel — the present is never touched. Throws
   * SpoolHistoryError before the first recorded moment.
   */
  rewind(ts: number): EntrySnapshot[] {
    return this.#history.rewind(ts)
  }

  /**
   * The portable file, yours forever (M8): pretty-printed JSON with a
   * readable `entries` half and the full doc as a base64 `doc` half —
   * re-importable via importSpool(), still syncable, rewind moments
   * included. Encrypted spools export decrypted; the key is never in the
   * file. Synchronous — it's all local.
   */
  export(): string {
    const all = [...this.entries, ...this.deleted]
      .sort((a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1))
      .map((e) => e.snapshot())
    return buildExport(this.code, all, this.doc)
  }

  /** the shareable link — hand it to someone */
  share(base?: string): string {
    return buildSpoolLink({ code: this.code, relay: this.#relay, key: this.#key, base })
  }

  /**
   * Disconnect and release resources; local data is retained (a spool is a
   * keepsake). The final pocket deposit goes out first — a 429 is retried
   * inside a few seconds and then named on `pocket` as
   * `depositError: 'rate-limited'` (T-178) — so `leave()` may take ~3 s
   * under a rate limit; it never blocks on a refused deposit for longer.
   */
  async leave(): Promise<void> {
    this.#history.flush() // stamp the final moment first, so the final deposit carries it
    await this.#pocket?.flush().catch(() => {}) // the last deposit goes out while the doc is still alive
    this.#pocket?.destroy()
    this.#history.destroy()
    this.#store.destroy()
    return this.#engine.leave()
  }
}

const connect = (
  code: string,
  relay: string,
  key: Uint8Array | undefined,
  opts: NewSpoolOptions
): Spool => {
  const engine = new SpoolEngine({
    code,
    relay,
    signaling: deriveSignaling(relay),
    persist: opts.persist,
    key,
  })
  const spool = new Spool(engine, relay, key, opts.author ?? 'anonymous')
  // a persisted spool is a keepsake — stamp it into the stash registry.
  // Only record a link that carries something (relay and/or key): a bare
  // import must never overwrite a stored sealed link with '#spool=code'
  if (opts.persist !== false) touch(code, relay || key ? spool.share('') : undefined)
  return spool
}

/** Start a fresh spool: new code, new key (unless `encrypted: false`), connected, resolved when local persistence is ready. */
export const newSpool = async (opts: NewSpoolOptions = {}): Promise<Spool> => {
  const key = opts.encrypted === false ? undefined : generateKey()
  const spool = connect(generateCode(), opts.relay ?? DEFAULT_RELAY, key, opts)
  await spool.whenReady
  return spool
}

/**
 * Open a spool someone handed you. Resolves when local persistence has
 * loaded — not when the network syncs; a spool opens instantly offline and
 * catches up when peers appear. Unreachable relays surface via status.
 */
export const openSpool = async (link: string, opts: OpenSpoolOptions = {}): Promise<Spool> => {
  const parsed = parseSpoolLink(link)
  const spool = connect(parsed.code, parsed.relay ?? DEFAULT_RELAY, parsed.key, opts)
  await spool.whenReady
  return spool
}

export interface ImportSpoolOptions {
  /** reconnect the imported spool to a relay; default: none — an import works offline-forever */
  relay?: string
  /** the spool's key, if you still have the link: seals storage + transport again */
  key?: Uint8Array
  author?: string
  /** default true in browsers — an import is a keepsake by definition */
  persist?: boolean
}

/**
 * Bring an exported file back to life. The embedded doc is APPLIED, not
 * copied — Yjs merge semantics — so importing into an empty browser restores
 * the spool, and importing over existing local state for the same code
 * reunifies histories; there is no clobber path. No relay is contacted
 * unless you pass one: an export must open even when the relay is long gone.
 * Throws SpoolExportError on files that aren't spool exports.
 */
export const importSpool = async (
  file: string | unknown,
  opts: ImportSpoolOptions = {}
): Promise<Spool> => {
  const { code, update } = parseExport(file)
  const spool = connect(code, opts.relay ?? '', opts.key, opts)
  await spool.whenReady
  Y.applyUpdate(spool.doc, update)
  return spool
}
