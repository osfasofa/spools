import { afterEach, expect, it } from 'vitest'
import { WebSocketServer, WebSocket as NodeWebSocket } from 'ws'
import { SpoolEngine } from './engine'
import { Spool } from './spool'
import { generateKey } from './link'

// the T-003 dumb relay, inlined: fan out frames to the room, exclude sender,
// never parse
const startRelay = () =>
  new Promise<{ port: number; close: () => void }>((resolve) => {
    const rooms = new Map<string, Set<import('ws').WebSocket>>()
    const close = () => {
      for (const conn of wss.clients) conn.terminate()
      wss.close()
    }
    const wss = new WebSocketServer({ port: 0 }, () =>
      resolve({ port: (wss.address() as { port: number }).port, close })
    )
    wss.on('connection', (conn, req) => {
      const room = req.url ?? '/'
      if (!rooms.has(room)) rooms.set(room, new Set())
      const members = rooms.get(room)!
      members.add(conn)
      conn.on('message', (data) => {
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

const engines: SpoolEngine[] = []
const cleanups: Array<() => void> = []

const mkEngine = (opts: ConstructorParameters<typeof SpoolEngine>[0]) => {
  const e = new SpoolEngine({
    persist: false,
    WebSocketPolyfill: NodeWebSocket as unknown as typeof WebSocket,
    disableBc: true,
    ...opts,
  })
  engines.push(e)
  return e
}

afterEach(async () => {
  await Promise.all(engines.splice(0).map((e) => e.leave()))
  cleanups.splice(0).forEach((c) => c())
})

it('imports and runs local-only in Node: ready immediately, offline, usable doc', async () => {
  const e = mkEngine({ code: 'test-local-1' })
  await e.whenReady
  expect(e.status).toBe('offline')
  e.doc.getMap('m').set('k', 'v')
  expect(e.doc.getMap('m').get('k')).toBe('v')
})

it('two engines converge through a dumb byte relay', async () => {
  const relay = await startRelay()
  cleanups.push(relay.close)
  const url = `ws://127.0.0.1:${relay.port}`
  const a = mkEngine({ code: 'test-sync-1', relay: url })
  const b = mkEngine({ code: 'test-sync-1', relay: url })
  await waitUntil(() => a.status === 'connected' && b.status === 'connected')

  a.doc.getMap('m').set('from-a', 1)
  expect(await waitUntil(() => b.doc.getMap('m').get('from-a') === 1)).toBe(true)
  b.doc.getMap('m').set('from-b', 2)
  expect(await waitUntil(() => a.doc.getMap('m').get('from-b') === 2)).toBe(true)
})

it('status reflects relay connection and emits transitions', async () => {
  const relay = await startRelay()
  const url = `ws://127.0.0.1:${relay.port}`
  const seen: string[] = []
  const e = mkEngine({ code: 'test-status-1', relay: url })
  e.onStatus((s) => seen.push(s))
  expect(await waitUntil(() => e.status === 'connected')).toBe(true)
  relay.close()
  expect(await waitUntil(() => e.status !== 'connected')).toBe(true)
  expect(seen).toContain('connected')
})

it('leave() is clean and idempotent', async () => {
  const relay = await startRelay()
  cleanups.push(relay.close)
  const e = mkEngine({ code: 'test-leave-1', relay: `ws://127.0.0.1:${relay.port}` })
  await waitUntil(() => e.status === 'connected')
  await e.leave()
  await e.leave()
  expect(e.status).toBe('offline')
})

it('persist defaults to off-limits outside browsers', () => {
  expect(() => new SpoolEngine({ code: 'test-persist-1', persist: true })).toThrow(/IndexedDB/)
})

// ---- T-169: a full room says so ----

/** spools-relay's MAX_CONNS_PER_ROOM refusal, distilled: accept the upgrade, close 1013 at once — until a seat frees */
const startFullRoom = () =>
  new Promise<{ port: number; attempts: () => number; admit: () => void; close: () => void }>((resolve) => {
    let full = true
    let attempts = 0
    const close = (): void => {
      for (const conn of wss.clients) conn.terminate()
      wss.close()
    }
    const wss: WebSocketServer = new WebSocketServer({ port: 0 }, () =>
      resolve({
        port: (wss.address() as { port: number }).port,
        attempts: () => attempts,
        admit: () => {
          full = false
        },
        close,
      })
    )
    wss.on('connection', (conn: import('ws').WebSocket) => {
      attempts++
      if (full) conn.close(1013, 'room full')
    })
  })

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

it('a 1013 "room full" close backs off and says so instead of hot-looping (T-169)', async () => {
  const room = await startFullRoom()
  cleanups.push(room.close)
  const reasons: string[] = []
  const e = mkEngine({ code: 'full-room-169', relay: `ws://127.0.0.1:${room.port}`, roomFullBackoffMs: 400 })
  e.onFull((reason) => reasons.push(reason))
  expect(e.roomFull).toBe(false)

  expect(await waitUntil(() => e.roomFull)).toBe(true)
  expect(reasons).toEqual(['room full'])
  expect(e.status).toBe('offline') // standing back, not 'connecting' forever
  await sleep(250)
  expect(room.attempts()).toBe(1) // y-websocket alone would have retried at 100 ms and 200 ms by now

  // still full when the backoff expires: refused again, said again
  expect(await waitUntil(() => room.attempts() === 2)).toBe(true)
  expect(await waitUntil(() => reasons.length === 2)).toBe(true)
  expect(e.roomFull).toBe(true)

  room.admit() // a seat frees; the next try gets in
  expect(await waitUntil(() => e.status === 'connected')).toBe(true)
  expect(e.roomFull).toBe(false)
  expect(room.attempts()).toBe(3)
})

it('the refusal reaches a keyed engine unchanged through the encrypted transport, and the Spool surface carries it', async () => {
  const room = await startFullRoom()
  cleanups.push(room.close)
  const url = `ws://127.0.0.1:${room.port}`
  const key = generateKey()
  const e = mkEngine({ code: 'full-sealed-169', relay: url, key, roomFullBackoffMs: 60_000 })
  const spool = new Spool(e, url, key, 'tester')
  const reasons: string[] = []
  spool.on('full', (reason) => reasons.push(reason))
  expect(await waitUntil(() => spool.roomFull)).toBe(true)
  expect(reasons).toEqual(['room full'])
  expect(spool.status).toBe('offline')
  await spool.leave()
})

it('leave() during the backoff cancels the retry', async () => {
  const room = await startFullRoom()
  cleanups.push(room.close)
  const e = mkEngine({ code: 'full-leave-169', relay: `ws://127.0.0.1:${room.port}`, roomFullBackoffMs: 150 })
  expect(await waitUntil(() => e.roomFull)).toBe(true)
  await e.leave()
  await sleep(400)
  expect(room.attempts()).toBe(1) // no timer outlived the engine
})
