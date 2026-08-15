/**
 * T-051: encrypted transport over the dumb relay.
 *
 * The relay here is instrumented — it records every frame it forwards — so
 * relay-blindness is an assertion, not a claim: sealed rooms show only
 * magic-prefixed ciphertext and never the plaintext marker; a keyless control
 * room shows the marker verbatim, proving the instrument would catch a leak.
 */
import { afterEach, expect, it } from 'vitest'
import { WebSocketServer, WebSocket as NodeWebSocket } from 'ws'
import { SpoolEngine } from './engine'
import { Spool } from './spool'
import { generateKey } from './link'
import { TRANSPORT_MAGIC } from './encrypted-ws'

// the dumb relay, inlined as in engine.test.ts, plus per-room frame capture
const startRelay = () =>
  new Promise<{ port: number; close: () => void; frames: Uint8Array[] }>((resolve) => {
    const rooms = new Map<string, Set<import('ws').WebSocket>>()
    const frames: Uint8Array[] = []
    const close = () => {
      for (const conn of wss.clients) conn.terminate()
      wss.close()
    }
    const wss = new WebSocketServer({ port: 0 }, () =>
      resolve({ port: (wss.address() as { port: number }).port, close, frames })
    )
    wss.on('connection', (conn, req) => {
      const room = req.url ?? '/'
      if (!rooms.has(room)) rooms.set(room, new Set())
      const members = rooms.get(room)!
      members.add(conn)
      conn.on('message', (data: Buffer) => {
        frames.push(new Uint8Array(data))
        for (const peer of members) {
          if (peer !== conn && peer.readyState === peer.OPEN) peer.send(data)
        }
      })
      conn.on('close', () => {
        members.delete(conn)
        if (members.size === 0) rooms.delete(room)
      })
    })
  })

const waitUntil = async (fn: () => boolean, ms = 5000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (fn()) return true
    await new Promise((r) => setTimeout(r, 25))
  }
  return fn()
}

/** byte-subsequence search: does any captured frame carry `needle` verbatim? */
const anyFrameContains = (frames: Uint8Array[], needle: Uint8Array): boolean =>
  frames.some((frame) => {
    outer: for (let i = 0; i + needle.length <= frame.length; i++) {
      for (let j = 0; j < needle.length; j++) {
        if (frame[i + j] !== needle[j]) continue outer
      }
      return true
    }
    return false
  })

const isSealed = (frame: Uint8Array): boolean =>
  frame.length >= 2 && frame[0] === TRANSPORT_MAGIC[0] && frame[1] === TRANSPORT_MAGIC[1]

// browsers don't kill anything when an onmessage handler throws; Node's event
// emitter would crash the test. The keyless peer in the mixed-room test feeds
// ciphertext to stock y-websocket parsing, so give it browser semantics.
class TolerantWS extends NodeWebSocket {
  constructor(url: string | URL, protocols?: string | string[]) {
    super(url, protocols)
    // shadow the prototype accessor with a wrapping one on the instance
    let handler: ((event: unknown) => void) | null = null
    const proto = Object.getPrototypeOf(Object.getPrototypeOf(this)) as object
    const inherited = Object.getOwnPropertyDescriptor(proto, 'onmessage')!
    Object.defineProperty(this, 'onmessage', {
      get: () => handler,
      set: (next: ((event: unknown) => void) | null) => {
        handler = next
        const wrapped =
          next &&
          ((event: unknown) => {
            try {
              next(event)
            } catch {
              // a browser page would log and carry on
            }
          })
        inherited.set!.call(this, wrapped)
      },
    })
  }
}

const engines: SpoolEngine[] = []
const spools: Spool[] = []
const cleanups: Array<() => void> = []

const mkEngine = (opts: Partial<ConstructorParameters<typeof SpoolEngine>[0]> & { code: string; relay: string }) => {
  const e = new SpoolEngine({
    persist: false,
    WebSocketPolyfill: NodeWebSocket as unknown as typeof WebSocket,
    disableBc: true,
    webrtc: false,
    ...opts,
  })
  engines.push(e)
  return e
}

afterEach(async () => {
  await Promise.all(spools.splice(0).map((s) => s.leave()))
  await Promise.all(engines.splice(0).map((e) => e.leave()))
  cleanups.splice(0).forEach((c) => c())
})

const MARKER = 'the relay must never see this text'
const markerBytes = new TextEncoder().encode(MARKER)

it('two keyed engines converge through the dumb relay, which sees only sealed frames', async () => {
  const relay = await startRelay()
  cleanups.push(relay.close)
  const url = `ws://127.0.0.1:${relay.port}`
  const key = generateKey()
  const a = mkEngine({ code: 'sealed-room-101', relay: url, key })
  const b = mkEngine({ code: 'sealed-room-101', relay: url, key })
  await waitUntil(() => a.status === 'connected' && b.status === 'connected')

  a.doc.getMap('m').set('secret', MARKER)
  expect(await waitUntil(() => b.doc.getMap('m').get('secret') === MARKER)).toBe(true)
  b.doc.getMap('m').set('reply', 'sealed both ways')
  expect(await waitUntil(() => a.doc.getMap('m').get('reply') === 'sealed both ways')).toBe(true)

  // relay-blindness: every forwarded frame is magic-prefixed ciphertext —
  // no Yjs opcodes on the wire, and the marker plaintext appears nowhere
  expect(relay.frames.length).toBeGreaterThan(0)
  expect(relay.frames.every(isSealed)).toBe(true)
  expect(anyFrameContains(relay.frames, markerBytes)).toBe(false)
  expect(a.undecryptableFrames).toBe(0)
  expect(b.undecryptableFrames).toBe(0)
})

it('control: a keyless room leaks the marker to the relay (the instrument works)', async () => {
  const relay = await startRelay()
  cleanups.push(relay.close)
  const url = `ws://127.0.0.1:${relay.port}`
  const a = mkEngine({ code: 'plaintext-room-101', relay: url })
  const b = mkEngine({ code: 'plaintext-room-101', relay: url })
  await waitUntil(() => a.status === 'connected' && b.status === 'connected')

  a.doc.getMap('m').set('secret', MARKER)
  expect(await waitUntil(() => b.doc.getMap('m').get('secret') === MARKER)).toBe(true)

  expect(relay.frames.some(isSealed)).toBe(false)
  expect(anyFrameContains(relay.frames, markerBytes)).toBe(true)
})

it('mixed room: a keyless peer cannot corrupt an encrypted spool — frames dropped and counted', async () => {
  const relay = await startRelay()
  cleanups.push(relay.close)
  const url = `ws://127.0.0.1:${relay.port}`
  const key = generateKey()
  const sealed = mkEngine({ code: 'mixed-room-101', relay: url, key, resyncIntervalMs: 300 })
  const totals: number[] = []
  sealed.onUndecryptable((total) => totals.push(total))
  const bare = mkEngine({
    code: 'mixed-room-101',
    relay: url,
    resyncIntervalMs: 300,
    WebSocketPolyfill: TolerantWS as unknown as typeof WebSocket,
  })
  await waitUntil(() => sealed.status === 'connected' && bare.status === 'connected')

  sealed.doc.getMap('m').set('sealed-data', MARKER)
  bare.doc.getMap('m').set('bare-data', 'plaintext peer talking')

  // the keyless peer's frames arrive unsealed → dropped + counted
  expect(await waitUntil(() => sealed.undecryptableFrames > 0)).toBe(true)
  expect(totals.length).toBeGreaterThan(0)
  expect(totals[totals.length - 1]).toBe(sealed.undecryptableFrames)

  // let resyncs churn, then confirm neither side absorbed the other
  await new Promise((r) => setTimeout(r, 800))
  expect(sealed.doc.getMap('m').get('bare-data')).toBeUndefined()
  expect(sealed.doc.getMap('m').get('sealed-data')).toBe(MARKER)
  expect(bare.doc.getMap('m').get('sealed-data')).toBeUndefined()
  expect(bare.doc.getMap('m').get('bare-data')).toBe('plaintext peer talking')
})

it('wrong key: both sides drop and count, neither converges, neither corrupts', async () => {
  const relay = await startRelay()
  cleanups.push(relay.close)
  const url = `ws://127.0.0.1:${relay.port}`
  const a = mkEngine({ code: 'wrong-key-101', relay: url, key: generateKey(), resyncIntervalMs: 300 })
  const b = mkEngine({ code: 'wrong-key-101', relay: url, key: generateKey(), resyncIntervalMs: 300 })
  await waitUntil(() => a.status === 'connected' && b.status === 'connected')

  a.doc.getMap('m').set('a-data', 'from a')
  b.doc.getMap('m').set('b-data', 'from b')

  expect(await waitUntil(() => a.undecryptableFrames > 0 && b.undecryptableFrames > 0)).toBe(true)
  await new Promise((r) => setTimeout(r, 800))
  expect(a.doc.getMap('m').get('b-data')).toBeUndefined()
  expect(b.doc.getMap('m').get('a-data')).toBeUndefined()
  expect(a.doc.getMap('m').get('a-data')).toBe('from a')
  expect(b.doc.getMap('m').get('b-data')).toBe('from b')
})

it('spool.awareness is the shared engine instance; presence propagates sealed (T-112)', async () => {
  const relay = await startRelay()
  cleanups.push(relay.close)
  const url = `ws://127.0.0.1:${relay.port}`
  const key = generateKey()
  const PRESENCE_MARKER = 'presence the relay must never see'
  const ea = mkEngine({ code: 'aware-room-112', relay: url, key })
  const a = new Spool(ea, url, key, 'a')
  spools.push(a)
  const eb = mkEngine({ code: 'aware-room-112', relay: url, key })
  const b = new Spool(eb, url, key, 'b')
  spools.push(b)

  // the passthrough, not a new object — both transports share this instance
  expect(a.awareness).toBe(ea.awareness)
  expect(a.awareness).not.toBeNull()

  await waitUntil(() => a.status === 'connected' && b.status === 'connected')
  a.awareness!.setLocalStateField('room', { seat: 'seat-a', note: PRESENCE_MARKER })
  const seen = () =>
    [...b.awareness!.getStates().values()].some(
      (state) => (state as { room?: { seat?: string } }).room?.seat === 'seat-a'
    )
  expect(await waitUntil(seen)).toBe(true)

  // awareness frames are sync-frame-indistinguishable on the wire (brief §2)
  expect(relay.frames.every(isSealed)).toBe(true)
  expect(anyFrameContains(relay.frames, new TextEncoder().encode(PRESENCE_MARKER))).toBe(false)
})

it('spool.awareness is null on a relayless spool', () => {
  const offline = new Spool(mkEngine({ code: 'aware-offline-112', relay: '' }), '', undefined, 'x')
  spools.push(offline)
  expect(offline.awareness).toBeNull()
})

it("Spool surfaces the counter and on('undecryptable')", async () => {
  const relay = await startRelay()
  cleanups.push(relay.close)
  const url = `ws://127.0.0.1:${relay.port}`
  const key = generateKey()
  const keyed = new Spool(
    mkEngine({ code: 'spool-surface-101', relay: url, key, resyncIntervalMs: 300 }),
    url,
    key,
    'tester'
  )
  spools.push(keyed)
  const seen: number[] = []
  keyed.on('undecryptable', (total) => seen.push(total))
  mkEngine({
    code: 'spool-surface-101',
    relay: url,
    resyncIntervalMs: 300,
    WebSocketPolyfill: TolerantWS as unknown as typeof WebSocket,
  })

  expect(await waitUntil(() => keyed.undecryptableFrames > 0)).toBe(true)
  expect(seen.length).toBeGreaterThan(0)
  expect(seen[seen.length - 1]).toBe(keyed.undecryptableFrames)
})
