import type * as Y from 'yjs'
import { SpoolEngine, type SpoolStatus } from './engine'
import { EntryStore, type Entry, type EntryChange, type WindInput } from './entry'
import { buildSpoolLink, generateCode, generateKey, parseSpoolLink } from './link'
import { keyFingerprint } from './crypto'

export class NotImplementedError extends Error {
  constructor(what: string, milestone: string) {
    super(`${what} is not implemented yet (lands in ${milestone})`)
    this.name = 'NotImplementedError'
  }
}

/**
 * The canonical spools-relay (deployed T-041). A true dumb byte relay — it
 * never parses a frame and holds no documents. fosho's relay carried M1–M3;
 * the fosho dependency ended here.
 */
export const DEFAULT_RELAY = 'wss://spools-relay-production.up.railway.app/yjs'

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
  #relay: string
  /** carried from the link / generated fresh; seals storage (T-050) and both transports (T-051) */
  #key: Uint8Array | undefined

  /** @internal use newSpool/openSpool */
  constructor(engine: SpoolEngine, relay: string, key: Uint8Array | undefined, author: string) {
    this.#engine = engine
    this.#relay = relay
    this.#key = key
    this.author = author
    this.code = engine.code
    this.doc = engine.doc
    this.whenReady = engine.whenReady
    this.#store = new EntryStore(engine.doc, author, engine.whenReady)
  }

  get status(): SpoolStatus {
    return this.#engine.status
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

  on(event: 'entry', cb: (change: EntryChange) => void): () => void
  on(event: 'status', cb: (status: SpoolStatus) => void): () => void
  on(event: 'undecryptable', cb: (total: number) => void): () => void
  on(
    event: 'entry' | 'status' | 'undecryptable',
    cb: ((change: EntryChange) => void) | ((status: SpoolStatus) => void) | ((total: number) => void)
  ): () => void {
    if (event === 'entry') return this.#store.onEntry(cb as (change: EntryChange) => void)
    if (event === 'status') return this.#engine.onStatus(cb as (status: SpoolStatus) => void)
    if (event === 'undecryptable') return this.#engine.onUndecryptable(cb as (total: number) => void)
    throw new Error(`unknown event: ${String(event)}`)
  }

  /** view history at an earlier point in time — M6 */
  rewind(_ts: number): never {
    throw new NotImplementedError('rewind()', 'M6')
  }

  /** portable file, yours forever — M8 */
  export(): never {
    throw new NotImplementedError('export()', 'M8')
  }

  /** the shareable link — hand it to someone */
  share(base?: string): string {
    return buildSpoolLink({ code: this.code, relay: this.#relay, key: this.#key, base })
  }

  /** disconnect and release resources; local data is retained (a spool is a keepsake) */
  leave(): Promise<void> {
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
  return new Spool(engine, relay, key, opts.author ?? 'anonymous')
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
