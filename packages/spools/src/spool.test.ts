import { afterEach, expect, it, vi } from 'vitest'
import { WebSocketServer, WebSocket as NodeWebSocket } from 'ws'
import { newSpool, openSpool, Spool } from './spool'
import { isValidCode } from './link'

// Node has no browser WebSocket wired into the engine path, so point the
// global at ws for these tests
vi.stubGlobal('WebSocket', NodeWebSocket)

const startRelay = () =>
  new Promise<{ url: string; close: () => void }>((resolve) => {
    const rooms = new Map<string, Set<import('ws').WebSocket>>()
    const close = () => {
      for (const conn of wss.clients) conn.terminate()
      wss.close()
    }
    const wss = new WebSocketServer({ port: 0 }, () =>
      resolve({ url: `ws://127.0.0.1:${(wss.address() as { port: number }).port}`, close })
    )
    wss.on('connection', (conn, req) => {
      const room = req.url ?? '/'
      if (!rooms.has(room)) rooms.set(room, new Set())
      const members = rooms.get(room)!
      members.add(conn)
      conn.on('message', (data) => {
        for (const peer of members) if (peer !== conn && peer.readyState === peer.OPEN) peer.send(data)
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

const spools: Spool[] = []
const cleanups: Array<() => void> = []
const track = (s: Spool) => (spools.push(s), s)

afterEach(async () => {
  await Promise.all(spools.splice(0).map((s) => s.leave()))
  cleanups.splice(0).forEach((c) => c())
})

it('newSpool generates a valid code and a shareable link that parses back', async () => {
  const relay = await startRelay()
  cleanups.push(relay.close)
  const spool = track(await newSpool({ relay: relay.url, persist: false }))
  expect(isValidCode(spool.code)).toBe(true)
  const link = spool.share('')
  expect(link).toContain(`spool=${spool.code}`)
  expect(link).toContain('k=')
})

it('openSpool(share()) lands in the same room: two handles converge', async () => {
  const relay = await startRelay()
  cleanups.push(relay.close)
  const a = track(await newSpool({ relay: relay.url, persist: false }))
  const b = track(await openSpool(a.share(''), { persist: false }))
  expect(b.code).toBe(a.code)
  await waitUntil(() => a.status === 'connected' && b.status === 'connected')
  a.doc.getMap('m').set('hello', 'b')
  expect(await waitUntil(() => b.doc.getMap('m').get('hello') === 'b')).toBe(true)
})

it('openSpool with a bare code uses the default relay (constructed, not connected)', async () => {
  const spool = track(await openSpool('quiet-harbor-042', { persist: false }))
  expect(spool.code).toBe('quiet-harbor-042')
  expect(spool.share('')).toContain('relay=wss%3A%2F%2Frelay.spools.lol')
})

it('resolves offline: whenReady does not wait for the network', async () => {
  const spool = track(await newSpool({ relay: 'ws://127.0.0.1:1', persist: false }))
  expect(spool.status).not.toBe('connected')
  spool.doc.getMap('m').set('works', 'offline')
  expect(spool.doc.getMap('m').get('works')).toBe('offline')
})

it('author defaults to anonymous and is carried when given', async () => {
  const a = track(await newSpool({ relay: 'ws://127.0.0.1:1', persist: false }))
  expect(a.author).toBe('anonymous')
  const b = track(await newSpool({ relay: 'ws://127.0.0.1:1', persist: false, author: 'jules' }))
  expect(b.author).toBe('jules')
})

it('one-URL convention: /yjs relay implies signaling at the host root (T-040)', async () => {
  const { deriveSignaling } = await import('./spool')
  expect(deriveSignaling('wss://relay.example/yjs')).toEqual(['wss://relay.example/'])
  expect(deriveSignaling('ws://localhost:9401/yjs')).toEqual(['ws://localhost:9401/'])
  expect(deriveSignaling('wss://relay.spools.lol/yjs')).toEqual([
    'wss://relay.spools.lol/',
  ]) // the default relay needs no special case
  expect(deriveSignaling('wss://relay.example/other')).toBeUndefined()
  expect(deriveSignaling('wss://relay.example/')).toBeUndefined()
  expect(deriveSignaling('not a url')).toBeUndefined()
})
