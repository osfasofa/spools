/**
 * T-103: the deposit scheduler — the SDK now does the whole midnight loop
 * itself. Tuned spools (small debounce) are constructed directly, the same
 * pattern history tests use; the relay is the real workspace spools-relay.
 */
import 'fake-indexeddb/auto'
import { afterEach, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { newSpool, openSpool, Spool, SpoolEngine, generateCode, buildSpoolLink, parseSpoolLink } from './index'
import { deriveToken, sealDeposit, _resetPocketCache, type PocketState } from './pocket'
import { generateKey } from './link'

const RELAY_SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'spools-relay', 'server.js')
let nextPort = 15500
const cleanups: (() => void | Promise<void>)[] = []
const spools: Spool[] = []
afterEach(async () => {
  for (const s of spools.splice(0)) await s.leave().catch(() => {})
  for (const c of cleanups.splice(0)) await c()
  _resetPocketCache()
})
const track = (s: Spool) => (spools.push(s), s)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const until = async (fn: () => boolean | Promise<boolean>, ms = 5000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (await fn()) return true
    await sleep(50)
  }
  return fn()
}

const startRealRelay = async (env: Record<string, string> = {}, port = nextPort++) => {
  const child: ChildProcess = spawn(process.execPath, [RELAY_SERVER], {
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', ...env },
    stdio: 'ignore',
  })
  const kill = () => child.kill()
  cleanups.push(kill)
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break
    } catch {
      await sleep(50)
    }
  }
  return { port, ws: `ws://127.0.0.1:${port}/yjs`, http: `http://127.0.0.1:${port}`, kill }
}

const depositCount = async (relayHttp: string, code: string, token: string) => {
  const json = await (await fetch(`${relayHttp}/pocket/${code}/${token}`)).json()
  return (json.deposits ?? []).length as number
}

/** a spool with test-speed pocket timing, constructed the way history tests do it */
const tunedSpool = (code: string, relayWs: string, key: Uint8Array, author = 'a') => {
  const engine = new SpoolEngine({ code, relay: relayWs, key, persist: false })
  return new Spool(
    engine,
    relayWs,
    key,
    author,
    { debounceMs: 50, minGapMs: 50 },
    { debounceMs: 100, minGapMs: 100 }
  )
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

it('the whole midnight loop through the SDK alone: wind → scheduled deposit → leave → cold open', async () => {
  const relay = await startRealRelay()
  const code = generateCode()
  const key = generateKey()
  const token = deriveToken(key)
  const a = tunedSpool(code, relay.ws, key)
  await settled(a)
  for (let i = 1; i <= 6; i++) a.wind({ kind: 'track', body: `Track ${i}` })
  // the scheduler deposits on its own — no manual PUT anywhere in this test
  expect(await until(async () => (await depositCount(relay.http, code, token)) > 0)).toBe(true)
  await a.leave()

  const b = track(await openSpool(buildSpoolLink({ code, relay: relay.ws, key }), { persist: false, author: 'b' }))
  const state = await settled(b)
  expect(state.phase).toBe('applied')
  expect(b.entries.map((e) => e.body).sort()).toEqual([1, 2, 3, 4, 5, 6].map((i) => `Track ${i}`).sort())
  expect(b.history.length).toBeGreaterThanOrEqual(1) // leave() stamped the moment before the final flush
})

it('applying deposits never schedules one: remote-origin state cannot self-feed', async () => {
  const relay = await startRealRelay()
  const code = generateCode()
  const key = generateKey()
  const token = deriveToken(key)
  const a = tunedSpool(code, relay.ws, key)
  await settled(a)
  a.wind({ kind: 'note', body: 'from a' })
  await until(async () => (await depositCount(relay.http, code, token)) === 1)
  await a.leave()

  const b = track(tunedSpool(code, relay.ws, key, 'b'))
  const state = await settled(b)
  expect(state.phase).toBe('applied')
  await sleep(600) // six debounce periods — a self-feeding scheduler would have deposited by now
  expect(await depositCount(relay.http, code, token)).toBe(1) // still only a's deposit; b was not ahead
})

it("deposit-if-ahead repopulates an emptied pocket from a device's local state", async () => {
  const port = nextPort++
  const first = await startRealRelay({}, port)
  const code = generateCode()
  const key = generateKey()
  const token = deriveToken(key)
  const a = tunedSpool(code, first.ws, key)
  await settled(a)
  a.wind({ kind: 'track', body: 'the keepsake' })
  await until(async () => (await depositCount(first.http, code, token)) === 1)
  await a.leave()

  const link = buildSpoolLink({ code, relay: first.ws, key })
  const b1 = await openSpool(link, { persist: true })
  await settled(b1)
  expect(b1.entries).toHaveLength(1)
  await b1.leave()

  first.kill() // memory-mode relay dies: the pocket is gone
  await sleep(150)
  await startRealRelay({}, port) // same port, empty pocket — the TTL-expiry stand-in

  const b2 = track(await openSpool(link, { persist: true }))
  const state = await settled(b2)
  expect(state.phase).toBe('empty') // fetch found nothing…
  expect(await until(async () => (await depositCount(`http://127.0.0.1:${port}`, code, token)) === 1)).toBe(true)
  // …and the device put its worldview back without a single new wind
})

it('refresh-if-stale re-deposits when the newest deposit has crossed half the TTL', async () => {
  // an offline writer makes the state the stub relay will serve
  const w = await newSpool({ relay: '', persist: false })
  w.wind({ kind: 'note', body: 'old but loved' })
  const key = parseSpoolLink(w.share(''))!.key!
  const update = Uint8Array.from(atob(JSON.parse(w.export()).doc as string), (c) => c.charCodeAt(0))
  const code = w.code
  await w.leave()

  const puts: number[] = []
  const port = nextPort++
  const blob = sealDeposit(update, key, new Uint8Array([5, 5, 5, 5]))
  const server = http.createServer((req, res) => {
    if (req.method === 'PUT') {
      puts.push(Date.now())
      req.resume()
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ format: 'spool-pocket', version: 1, stored: true }))
      })
      return
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        format: 'spool-pocket',
        version: 1,
        ttlDays: 60,
        // 40 days old: past the 30-day refresh line of a 60-day TTL
        deposits: [{ at: Date.now() - 40 * 86_400_000, blob: Buffer.from(blob).toString('base64') }],
      })
    )
  })
  await new Promise<void>((r) => server.listen(port, '127.0.0.1', r))
  cleanups.push(() => new Promise<void>((r) => server.close(() => r())))

  const b = track(await openSpool(buildSpoolLink({ code, relay: `ws://127.0.0.1:${port}/yjs`, key }), { persist: false }))
  const state = await settled(b)
  expect(state.phase).toBe('applied') // not ahead — staleness alone triggers the refresh
  expect(await until(() => puts.length === 1)).toBe(true)
})

it("leave() flushes the last debounce window — the tab-close story's honest half", async () => {
  const relay = await startRealRelay()
  const code = generateCode()
  const key = generateKey()
  const token = deriveToken(key)
  const engine = new SpoolEngine({ code, relay: relay.ws, key, persist: false })
  // deposits debounce far beyond this test's lifetime: only flush can save them
  const a = new Spool(engine, relay.ws, key, 'a', { debounceMs: 10, minGapMs: 10 }, { debounceMs: 60_000, minGapMs: 0 })
  await settled(a)
  a.wind({ kind: 'track', body: 'last second' })
  expect(await depositCount(relay.http, code, token)).toBe(0) // debounce hasn't elapsed
  await a.leave()
  expect(await depositCount(relay.http, code, token)).toBe(1) // the flush carried it out
})

it('a deposit the relay refuses as too big degrades loudly to live-only', async () => {
  const relay = await startRealRelay({ POCKET_MAX_BYTES: '60' })
  const code = generateCode()
  const key = generateKey()
  const a = track(tunedSpool(code, relay.ws, key))
  await settled(a)
  const errored = new Promise<PocketState>((resolve) => {
    a.on('pocket', (s) => {
      if (s.depositError) resolve(s)
    })
  })
  a.wind({ kind: 'note', body: 'x'.repeat(500) })
  const state = await errored
  expect(state.depositError).toBe('too-big')
  expect(a.entries).toHaveLength(1) // the spool itself is fine — live-only, stated loudly
  expect(await depositCount(relay.http, code, deriveToken(key))).toBe(0)
})
