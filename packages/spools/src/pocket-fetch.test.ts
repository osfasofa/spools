/**
 * T-102: the pocket's fetch side, tested against the REAL spools-relay from
 * this workspace (spawned as a child process — cross-package integration is
 * the point), plus stub relays for the 200-trap and version-gate rules.
 */
import 'fake-indexeddb/auto'
import { afterEach, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { newSpool, openSpool, type Spool } from './index'
import { deriveToken, sealDeposit, _resetPocketCache, type PocketState } from './pocket'

const RELAY_SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'spools-relay', 'server.js')
let nextPort = 15300
const cleanups: (() => void | Promise<void>)[] = []
const spools: Spool[] = []
afterEach(async () => {
  for (const s of spools.splice(0)) await s.leave().catch(() => {})
  for (const c of cleanups.splice(0)) await c()
  _resetPocketCache()
})
const track = (s: Spool) => (spools.push(s), s)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** the real relay, from packages/spools-relay */
const startRealRelay = async (env: Record<string, string> = {}) => {
  const port = nextPort++
  const child: ChildProcess = spawn(process.execPath, [RELAY_SERVER], {
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', ...env },
    stdio: 'ignore',
  })
  cleanups.push(() => child.kill())
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break
    } catch {
      await sleep(50)
    }
  }
  return { port, ws: `ws://127.0.0.1:${port}/yjs`, http: `http://127.0.0.1:${port}` }
}

/** a pre-M10 relay: 200 + health JSON to every request, no pocket block (the 200-trap) */
const startOldRelay = async () => {
  const port = nextPort++
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', service: 'spools-relay', relay: {}, signaling: {} }))
  })
  await new Promise<void>((r) => server.listen(port, '127.0.0.1', r))
  cleanups.push(() => new Promise<void>((r) => server.close(() => r())))
  return { ws: `ws://127.0.0.1:${port}/yjs` }
}

/** a relay from the future: speaks the envelope at a version this SDK doesn't know */
const startFutureRelay = async () => {
  const port = nextPort++
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ format: 'spool-pocket', version: 99, deposits: [{ at: 1, blob: 'AAAA' }] }))
  })
  await new Promise<void>((r) => server.listen(port, '127.0.0.1', r))
  cleanups.push(() => new Promise<void>((r) => server.close(() => r())))
  return { ws: `ws://127.0.0.1:${port}/yjs` }
}

const settled = (spool: Spool): Promise<PocketState> =>
  new Promise((resolve) => {
    const check = (s: PocketState | null) => {
      if (s && s.phase !== 'checking') {
        off()
        resolve(s)
        return true
      }
      return false
    }
    const off = spool.on('pocket', (s) => check(s))
    check(spool.pocket)
  })

/** what T-103 will do on a schedule: seal the writer's full state and PUT it */
const depositNow = async (writer: Spool, relayHttp: string, tag = new Uint8Array([1, 2, 3, 4])) => {
  const link = writer.share('')
  const k = new URLSearchParams(link.slice(1)).get('k')!
  const key = Uint8Array.from(atob(k.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (k.length % 4)) % 4)), (c) =>
    c.charCodeAt(0)
  )
  const doc = JSON.parse(writer.export()).doc as string
  const update = Uint8Array.from(atob(doc), (c) => c.charCodeAt(0))
  const blob = sealDeposit(update, key, tag)
  const res = await fetch(`${relayHttp}/pocket/${writer.code}/${deriveToken(key)}`, { method: 'PUT', body: blob })
  expect(res.status).toBe(200)
  return { key, token: deriveToken(key) }
}

it('the midnight loop: writer deposits and leaves; a cold reader renders everything', async () => {
  const relay = await startRealRelay()
  const a = await newSpool({ relay: relay.ws, persist: false, author: 'a' })
  const link = a.share()
  for (let i = 1; i <= 8; i++) a.wind({ kind: 'track', body: `Track ${i}` })
  await depositNow(a, relay.http)
  await a.leave() // the room is now empty

  const b = track(await openSpool(link, { persist: false, author: 'b' }))
  const state = await settled(b)
  expect(state.phase).toBe('applied')
  expect(state.applied).toBe(1)
  // same-millisecond winds tie on createdAt and break by id, so compare as a set
  expect(b.entries.map((e) => e.body).sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8].map((i) => `Track ${i}`).sort())
  expect(b.pocket?.phase).toBe('applied')
})

it('an empty pocket settles as empty and shows nothing — exactly v1', async () => {
  const relay = await startRealRelay()
  const a = await newSpool({ relay: relay.ws, persist: false })
  const link = a.share()
  await a.leave()
  const b = track(await openSpool(link, { persist: false }))
  const state = await settled(b)
  expect(state).toEqual({ phase: 'empty', applied: 0, dropped: 0 })
  expect(b.entries).toEqual([])
})

it('the 200-trap: an old relay reads as unavailable, never as an empty pocket', async () => {
  const old = await startOldRelay()
  const a = track(await newSpool({ relay: old.ws, persist: false }))
  const state = await settled(a)
  expect(state.phase).toBe('unavailable')
  a.wind({ kind: 'note', body: 'still works' })
  expect(a.entries).toHaveLength(1) // v1 behavior intact around it
})

it('a version from the future reads as unavailable — same rule as export files', async () => {
  const future = await startFutureRelay()
  const a = track(await newSpool({ relay: future.ws, persist: false }))
  expect((await settled(a)).phase).toBe('unavailable')
})

it('a dead relay reads as unavailable without blocking open()', async () => {
  const a = track(await newSpool({ relay: 'ws://127.0.0.1:1', persist: false }))
  expect(a.entries).toEqual([]) // open resolved fine
  expect((await settled(a)).phase).toBe('unavailable')
})

it('deposits that fail authentication are dropped, counted, and never touch the doc', async () => {
  const relay = await startRealRelay()
  const a = await newSpool({ relay: relay.ws, persist: false })
  const link = a.share()
  a.wind({ kind: 'track', body: 'Real' })
  const { token } = await depositNow(a, relay.http)
  await a.leave()

  // a key-holder gone weird: right namespace, garbage ciphertext under a valid envelope
  const garbage = sealDeposit(crypto.getRandomValues(new Uint8Array(64)), crypto.getRandomValues(new Uint8Array(32)), new Uint8Array([9, 9, 9, 9]))
  await fetch(`${relay.http}/pocket/${a.code}/${token}`, { method: 'PUT', body: garbage })

  const b = track(await openSpool(link, { persist: false }))
  const state = await settled(b)
  expect(state.phase).toBe('applied')
  expect(state.applied).toBe(1)
  expect(state.dropped).toBe(1)
  expect(b.entries.map((e) => e.body)).toEqual(['Real'])
})

it('keyless spools have no pocket at all — ciphertext or nothing is structural', async () => {
  const relay = await startRealRelay()
  const a = track(await newSpool({ relay: relay.ws, persist: false, encrypted: false }))
  expect(a.pocket).toBeNull()
  const off = a.on('pocket', () => {
    throw new Error('must never fire for a keyless spool')
  })
  await sleep(300)
  off()
})

it('pocket-applied state persists sealed at rest: close, reopen offline-equivalent, still there', async () => {
  const relay = await startRealRelay()
  const a = await newSpool({ relay: relay.ws, persist: false })
  const link = a.share()
  for (let i = 1; i <= 5; i++) a.wind({ kind: 'note', body: `Note ${i}` })
  await depositNow(a, relay.http)
  await a.leave()

  const b1 = await openSpool(link, { persist: true })
  await settled(b1)
  expect(b1.entries).toHaveLength(5)
  await b1.leave()

  // reopen: the room is empty and the pocket already merged — entries must come from IndexedDB
  const b2 = track(await openSpool(link, { persist: true }))
  expect(b2.entries).toHaveLength(5)
})

it('two divergent worldviews in the pocket union on a cold open (the per-tag ring paying rent)', async () => {
  const relay = await startRealRelay()
  const a = await newSpool({ relay: relay.ws, persist: false, author: 'a' })
  const link = a.share()
  a.wind({ kind: 'track', body: 'A-side' })
  await depositNow(a, relay.http, new Uint8Array([1, 1, 1, 1]))
  await a.leave()

  // B diverges: opens from the link but never overlaps with A's session…
  const b = await openSpool(link, { persist: false, author: 'b' })
  await settled(b) // merges A's deposit
  b.wind({ kind: 'track', body: 'B-side' })
  await depositNow(b, relay.http, new Uint8Array([2, 2, 2, 2]))
  await b.leave()

  const c = track(await openSpool(link, { persist: false, author: 'c' }))
  const state = await settled(c)
  expect(state.applied).toBe(2)
  expect(c.entries.map((e) => e.body).sort()).toEqual(['A-side', 'B-side'])
})
