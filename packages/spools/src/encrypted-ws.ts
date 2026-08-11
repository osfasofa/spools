/**
 * Encrypted websocket transport (T-051, lifted from fosho encrypted-sync.ts
 * and trimmed).
 *
 * A WebSocket subclass handed to y-websocket as `WebSocketPolyfill`: every
 * outgoing frame is sealed with secretbox and prefixed with the magic bytes
 * `0xE2 0xE1` ("E2E v1"); every incoming frame must carry the magic and
 * decrypt with this spool's key, or it is dropped and counted — never handed
 * to Yjs, so a peer on the wrong key (or no key) cannot corrupt the doc.
 * Works against a dumb byte relay by construction: the relay forwards frames
 * it never parses.
 *
 * Deliberately trimmed from fosho: the global `unauthorized_peer` handler and
 * the pass-through of unrecognized frames are gone. On an encrypted socket
 * every message is `magic‖nonce‖ciphertext` — anything else is not speaking
 * the protocol and gets dropped + reported via the per-instance callback.
 */
import { decrypt, encrypt } from './crypto'

/** wire prefix marking a sealed frame (0xE2E1 = "E2E v1") */
export const TRANSPORT_MAGIC: readonly [number, number] = [0xe2, 0xe1]

const hasMagic = (bytes: Uint8Array): boolean =>
  bytes.length >= 2 && bytes[0] === TRANSPORT_MAGIC[0] && bytes[1] === TRANSPORT_MAGIC[1]

/** `magic‖nonce‖ciphertext` */
const seal = (plain: Uint8Array, key: Uint8Array): Uint8Array => {
  const ciphertext = encrypt(plain, key)
  const framed = new Uint8Array(2 + ciphertext.length)
  framed[0] = TRANSPORT_MAGIC[0]
  framed[1] = TRANSPORT_MAGIC[1]
  framed.set(ciphertext, 2)
  return framed
}

/** exact-size ArrayBuffer for a MessageEvent's data */
const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  if (
    bytes.buffer instanceof ArrayBuffer &&
    bytes.byteOffset === 0 &&
    bytes.byteLength === bytes.buffer.byteLength
  ) {
    return bytes.buffer
  }
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer as ArrayBuffer
}

/**
 * Build the WebSocket class the engine passes to y-websocket when the spool
 * has a key. `Base` is whatever WebSocket implementation the environment
 * provides (browser global, Node's, or a test polyfill).
 */
export const createEncryptedWebSocketClass = (
  key: Uint8Array,
  Base: typeof WebSocket,
  onUndecryptable?: () => void
): typeof WebSocket =>
  class EncryptedWebSocket extends Base {
    #userOnMessage: ((event: MessageEvent) => void) | null = null

    constructor(url: string | URL, protocols?: string | string[]) {
      super(url, protocols)
      this.binaryType = 'arraybuffer'
      super.addEventListener('message', (event: MessageEvent) => {
        if (!this.#userOnMessage) return
        const data: unknown = event.data
        const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : null
        const plain = bytes && hasMagic(bytes) ? decrypt(bytes.subarray(2), key) : null
        if (!plain) {
          // wrong key, no key, or not even binary — drop, never hand to Yjs
          onUndecryptable?.()
          return
        }
        this.#userOnMessage({ data: toArrayBuffer(plain) } as MessageEvent)
      })
    }

    override send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
      const bytes =
        data instanceof ArrayBuffer
          ? new Uint8Array(data)
          : ArrayBuffer.isView(data)
            ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
            : null
      // y-websocket only ever sends binary; refusing the rest guarantees no
      // plaintext frame can leave an encrypted socket
      if (!bytes) throw new Error('encrypted spool transport sends only binary frames')
      super.send(toArrayBuffer(seal(bytes, key)))
    }

    // y-websocket assigns onmessage directly; capture it so decryption sits
    // between the wire and the provider
    override set onmessage(handler: ((event: MessageEvent) => void) | null) {
      this.#userOnMessage = handler
    }

    override get onmessage(): ((event: MessageEvent) => void) | null {
      return this.#userOnMessage
    }
  }
