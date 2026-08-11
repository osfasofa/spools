import type * as Y from 'yjs'
import { SpoolEngine, type SpoolStatus } from './engine'
import { buildSpoolLink, generateCode, generateKey, parseSpoolLink } from './link'

/**
 * fosho's deployed relay — zero new infrastructure for M1. Flips to our own
 * deployed spools-relay after T-041.
 */
export const DEFAULT_RELAY = 'wss://foshoio-production.up.railway.app/yjs'
const DEFAULT_SIGNALING = ['wss://foshoio-production.up.railway.app/']

export interface NewSpoolOptions {
  /** wss relay URL; default: the SDK's default relay */
  relay?: string
  /** self-declared display name stamped on entries you wind (T-012) */
  author?: string
  /** default true in browsers; false = memory-only (tests, previews) */
  persist?: boolean
}

export type OpenSpoolOptions = Omit<NewSpoolOptions, 'relay'>

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
  #relay: string
  /** carried from the link / generated fresh; cryptographically live in M5 */
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
  }

  get status(): SpoolStatus {
    return this.#engine.status
  }

  on(event: 'status', cb: (status: SpoolStatus) => void): () => void {
    if (event !== 'status') throw new Error(`unknown event: ${event}`)
    return this.#engine.onStatus(cb)
  }

  /** the shareable link — hand it to someone */
  share(base?: string): string {
    return buildSpoolLink({ code: this.code, relay: this.#relay, key: this.#key, base })
  }

  /** disconnect and release resources; local data is retained (a spool is a keepsake) */
  leave(): Promise<void> {
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
    // signaling endpoints are only known for the default relay; a custom
    // relay syncs over websocket alone until T-040 defines the one-URL
    // convention for both jobs
    signaling: relay === DEFAULT_RELAY ? DEFAULT_SIGNALING : undefined,
    persist: opts.persist,
  })
  return new Spool(engine, relay, key, opts.author ?? 'anonymous')
}

/** Start a fresh spool: new code, new key, connected, resolved when local persistence is ready. */
export const newSpool = async (opts: NewSpoolOptions = {}): Promise<Spool> => {
  const spool = connect(generateCode(), opts.relay ?? DEFAULT_RELAY, generateKey(), opts)
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
