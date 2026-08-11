import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import type { WebrtcProvider } from 'y-webrtc'
import type { Awareness } from 'y-protocols/awareness'

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
}

const inBrowser = typeof indexedDB !== 'undefined'
const hasWebRTC = typeof RTCPeerConnection !== 'undefined'

/**
 * The sync core: one Y.Doc, persisted locally, synced over websocket relay +
 * webrtc. Instance-based — many spools coexist. No entry model, no encryption
 * (M5), no identity/permissions/subdocs (deliberately stripped from fosho).
 * @internal
 */
export class SpoolEngine {
  readonly code: string
  readonly doc: Y.Doc
  readonly whenReady: Promise<void>

  #idb: IndexeddbPersistence | null = null
  #websocket: WebsocketProvider | null = null
  #webrtc: WebrtcProvider | null = null
  #webrtcPending: Promise<void> = Promise.resolve()
  #wsStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected'
  #rtcConnected = false
  #status: SpoolStatus = 'offline'
  #statusListeners = new Set<(status: SpoolStatus) => void>()
  #left = false

  constructor(opts: SpoolEngineOptions) {
    this.code = opts.code
    this.doc = new Y.Doc()

    const persist = opts.persist ?? inBrowser
    if (persist) {
      if (!inBrowser) throw new Error('persist requires IndexedDB; pass persist: false outside browsers')
      this.#idb = new IndexeddbPersistence(opts.code, this.doc)
      const idb = this.#idb
      this.whenReady = idb.synced
        ? Promise.resolve()
        : new Promise((resolve) => idb.once('synced', () => resolve()))
    } else {
      this.whenReady = Promise.resolve()
    }

    if (opts.relay) {
      this.#websocket = new WebsocketProvider(opts.relay, opts.code, this.doc, {
        resyncInterval: opts.resyncIntervalMs ?? 20_000,
        disableBc: opts.disableBc ?? false,
        ...(opts.WebSocketPolyfill ? { WebSocketPolyfill: opts.WebSocketPolyfill } : {}),
      })
      this.#websocket.on('status', ({ status }) => {
        this.#wsStatus = status === 'connected' ? 'connected' : status === 'connecting' ? 'connecting' : 'disconnected'
        this.#deriveStatus()
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
    await this.#webrtcPending
    this.#webrtc?.destroy()
    this.#websocket?.destroy()
    await this.#idb?.destroy()
    this.doc.destroy()
    this.#statusListeners.clear()
    if (this.#status !== 'offline') {
      this.#status = 'offline'
    }
  }
}
