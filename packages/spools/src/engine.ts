import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import type { WebrtcProvider } from 'y-webrtc'
import type { Awareness } from 'y-protocols/awareness'
import { EncryptedIndexeddbPersistence } from './encrypted-idb'
import { createEncryptedWebSocketClass } from './encrypted-ws'
import { encodeKey } from './link'

export type SpoolStatus = 'offline' | 'connecting' | 'connected'

export interface SpoolEngineOptions {
  /** spool code: sync boundary, room name, and IndexedDB database name */
  code: string
  /** websocket relay URL — the reliable path; omit for a local-only spool */
  relay?: string
  /** webrtc signaling URLs — the low-latency bonus */
  signaling?: string[]
  /** persist to IndexedDB; false = memory-only (tests, previews). Default true in browsers */
  persist?: boolean
  /**
   * 32-byte key (M5): seals local persistence at rest AND both transports —
   * secretbox on every websocket frame, y-webrtc's password on rtc (T-051).
   * Absent = plaintext storage and plaintext sync.
   */
  key?: Uint8Array
  /** create the webrtc provider. Default: only where WebRTC exists (browsers) */
  webrtc?: boolean
  /**
   * Periodic SyncStep1 re-ask. A dumb relay can't answer a waiting peer, so
   * peers must re-ask each other (DESIGN_DOC §5, proven in T-003). 0 disables.
   */
  resyncIntervalMs?: number
  /** disable cross-tab BroadcastChannel sync (forces traffic through the relay) */
  disableBc?: boolean
  /** WebSocket implementation for non-browser environments */
  WebSocketPolyfill?: typeof WebSocket
  /**
   * How long to stand back after the relay closes with 1013 ("room full")
   * before trying again, instead of y-websocket's reconnect-at-once loop
   * (T-169). Default 30 s; tests shrink it.
   */
  roomFullBackoffMs?: number
}

/** RFC 6455 "try again later" — what spools-relay sends past MAX_CONNS_PER_ROOM */
export const ROOM_FULL_CLOSE_CODE = 1013

const inBrowser = typeof indexedDB !== 'undefined'
const hasWebRTC = typeof RTCPeerConnection !== 'undefined'

/**
 * The sync core: one Y.Doc, persisted locally, synced over websocket relay +
 * webrtc; a keyed spool is sealed at rest and on both wires (M5). Instance-
 * based — many spools coexist. No identity/permissions/subdocs (deliberately
 * stripped from fosho).
 * @internal
 */
export class SpoolEngine {
  readonly code: string
  readonly doc: Y.Doc
  readonly whenReady: Promise<void>

  #idb: IndexeddbPersistence | EncryptedIndexeddbPersistence | null = null
  #websocket: WebsocketProvider | null = null
  #webrtc: WebrtcProvider | null = null
  #webrtcPending: Promise<void> = Promise.resolve()
  #wsStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected'
  #rtcConnected = false
  #status: SpoolStatus = 'offline'
  #statusListeners = new Set<(status: SpoolStatus) => void>()
  #undecryptable = 0
  #undecryptableListeners = new Set<(total: number) => void>()
  #roomFull = false
  #fullListeners = new Set<(reason: string) => void>()
  #fullTimer: ReturnType<typeof setTimeout> | null = null
  #roomFullBackoffMs: number
  #left = false

  constructor(opts: SpoolEngineOptions) {
    this.code = opts.code
    this.#roomFullBackoffMs = opts.roomFullBackoffMs ?? 30_000
    // gc:false universally (§5, T-060): rewind() needs deleted content to
    // survive as tombstones, and mixed-gc rooms would give peers different
    // recoverable pasts. Cost measured at +34% doc size on a realistic spool.
    this.doc = new Y.Doc({ gc: false })

    const persist = opts.persist ?? inBrowser
    if (persist) {
      if (!inBrowser) throw new Error('persist requires IndexedDB; pass persist: false outside browsers')
      // a keyed spool is sealed at rest; a keyless one stores plaintext
      this.#idb = opts.key
        ? new EncryptedIndexeddbPersistence(opts.code, this.doc, opts.key)
        : new IndexeddbPersistence(opts.code, this.doc)
      // rejects on SpoolKeyError (wrong key for existing local data) — loud, not silent
      this.whenReady = this.#idb.whenSynced.then(() => undefined)
    } else {
      this.whenReady = Promise.resolve()
    }

    if (opts.relay) {
      // keyed spool → every ws frame leaves sealed (magic‖nonce‖ciphertext);
      // inbound frames that don't decrypt are dropped + counted (T-051)
      const Base = opts.WebSocketPolyfill ?? (typeof WebSocket !== 'undefined' ? WebSocket : undefined)
      const Transport =
        opts.key && Base
          ? createEncryptedWebSocketClass(opts.key, Base, () => this.#countUndecryptable())
          : Base
      this.#websocket = new WebsocketProvider(opts.relay, opts.code, this.doc, {
        resyncInterval: opts.resyncIntervalMs ?? 20_000,
        disableBc: opts.disableBc ?? false,
        // 1013 is the relay saying "room full". y-websocket's default would
        // reconnect at once and forever — the endless spinner of T-169 — so
        // treat it as terminal for one backoff, then resume below. The
        // 4400–4499 rule is the provider's own default, kept as is.
        shouldReconnect: (event) =>
          event.code !== ROOM_FULL_CLOSE_CODE && !(event.code >= 4400 && event.code < 4500),
        ...(Transport ? { WebSocketPolyfill: Transport } : {}),
      })
      this.#websocket.on('status', ({ status }) => {
        this.#wsStatus = status === 'connected' ? 'connected' : status === 'connecting' ? 'connecting' : 'disconnected'
        if (status === 'connected') this.#roomFull = false // a seat was there after all
        this.#deriveStatus()
      })
      // the close event reaches the provider unchanged through the encrypted
      // subclass (it overrides send/onmessage only), so this is one path
      this.#websocket.on('closed', ({ code, reason }) => {
        if (code !== ROOM_FULL_CLOSE_CODE || this.#left) return
        this.#roomFull = true
        for (const cb of this.#fullListeners) cb(reason)
        // stand back, then let the provider try once more — another 1013
        // lands right back here
        this.#fullTimer = setTimeout(() => {
          this.#fullTimer = null
          if (!this.#left) this.#websocket?.connect()
        }, this.#roomFullBackoffMs)
      })
    }

    const webrtc = opts.webrtc ?? hasWebRTC
    if (webrtc && opts.signaling?.length) {
      // dynamic import: y-webrtc assumes a WebRTC runtime, and the module must
      // import cleanly in Node
      this.#webrtcPending = import('y-webrtc').then(({ WebrtcProvider }) => {
        if (this.#left) return
        this.#webrtc = new WebrtcProvider(opts.code, this.doc, {
          signaling: opts.signaling,
          // rtc crypto is y-webrtc's own scheme, keyed on the same k= string
          // as the link carries (§5 two-transport decision, T-051)
          ...(opts.key ? { password: encodeKey(opts.key) } : {}),
          // one awareness across both transports (fosho sync.ts:1032)
          ...(this.#websocket ? { awareness: this.#websocket.awareness } : {}),
        })
        this.#webrtc.on('status', ({ connected }) => {
          this.#rtcConnected = connected
          this.#deriveStatus()
        })
      })
    }
  }

  get status(): SpoolStatus {
    return this.#status
  }

  get awareness(): Awareness | null {
    return this.#websocket?.awareness ?? this.#webrtc?.awareness ?? null
  }

  onStatus(cb: (status: SpoolStatus) => void): () => void {
    this.#statusListeners.add(cb)
    return () => this.#statusListeners.delete(cb)
  }

  /** ws frames dropped because they weren't sealed with this spool's key — a wrong-key or keyless peer is in the room */
  get undecryptableFrames(): number {
    return this.#undecryptable
  }

  onUndecryptable(cb: (total: number) => void): () => void {
    this.#undecryptableListeners.add(cb)
    return () => this.#undecryptableListeners.delete(cb)
  }

  #countUndecryptable() {
    this.#undecryptable++
    for (const cb of this.#undecryptableListeners) cb(this.#undecryptable)
  }

  /**
   * The relay refused the last connection with 1013 "room full" (T-169).
   * The SDK stands back (~30 s) between attempts instead of spinning;
   * status reads 'offline' meanwhile. Clears when a connection is accepted.
   */
  get roomFull(): boolean {
    return this.#roomFull
  }

  /** fires with the close reason on every refused attempt */
  onFull(cb: (reason: string) => void): () => void {
    this.#fullListeners.add(cb)
    return () => this.#fullListeners.delete(cb)
  }

  #deriveStatus() {
    const next: SpoolStatus =
      this.#wsStatus === 'connected' || this.#rtcConnected
        ? 'connected'
        : this.#wsStatus === 'connecting'
          ? 'connecting'
          : 'offline'
    if (next !== this.#status) {
      this.#status = next
      for (const cb of this.#statusListeners) cb(next)
    }
  }

  /**
   * Disconnect and release resources. Local IndexedDB data is retained — a
   * spool is a keepsake. Teardown order per fosho disconnectFromNote:
   * webrtc → websocket → idb → doc.
   */
  async leave(): Promise<void> {
    if (this.#left) return
    this.#left = true
    if (this.#fullTimer) clearTimeout(this.#fullTimer)
    this.#fullTimer = null
    await this.#webrtcPending
    this.#webrtc?.destroy()
    this.#websocket?.destroy()
    await this.#idb?.destroy()
    this.doc.destroy()
    this.#statusListeners.clear()
    this.#undecryptableListeners.clear()
    this.#fullListeners.clear()
    if (this.#status !== 'offline') {
      this.#status = 'offline'
    }
  }
}
