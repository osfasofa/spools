/**
 * T-103: the deposit scheduler — the SDK now does the whole midnight loop
 * itself. Tuned spools (small debounce) are constructed directly, the same
 * pattern history tests use; the relay is the real workspace spools-relay.
 */
import 'fake-indexeddb/auto'
import { afterEach, expect, it, vi } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { newSpool, openSpool, Spool, SpoolEngine, generateCode, buildSpoolLink, parseSpoolLink } from './index'
import { deriveToken, sealDeposit, _resetPocketCache, KEEPALIVE_MAX_BYTES, type PocketState } from './pocket'
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

/**
 * a stub relay with an empty pocket whose PUTs answer `statuses` in order, the
 * last one repeating (T-178); `hangGet` never answers the open-time fetch
 */
const startStubRelay = async (statuses: number[], { hangGet = false } = {}) => {
  const port = nextPort++
  const puts: number[] = []
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && hangGet) return // the check that never settles
    if (req.method === 'PUT') {
      const status = statuses[Math.min(puts.length, statuses.length - 1)]
      puts.push(status)
      req.resume()
      req.on('end', () => {
        res.writeHead(status, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ format: 'spool-pocket', version: 1, ...(status === 200 ? { stored: true } : { error: 'rate limited' }) }))
      })
      return
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ format: 'spool-pocket', version: 1, ttlDays: 60, deposits: [] }))
  })
  await new Promise<void>((r) => server.listen(port, '127.0.0.1', r))
  cleanups.push(() => new Promise<void>((r) => server.close(() => r())))
  return { ws: `ws://127.0.0.1:${port}/yjs`, puts }
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

it('a wind before the pocket check settles is still carried out by leave() (T-178, mechanism 5)', async () => {
  // T-182's wall: mint, wind, leave — all before the pocket's GET answered.
  // The scheduler arms only at settle; the flush used to return early unarmed.
  const relay = await startRealRelay()
  const code = generateCode()
  const key = generateKey()
  const token = deriveToken(key)
  const engine = new SpoolEngine({ code, relay: relay.ws, key, persist: false })
  const a = new Spool(engine, relay.ws, key, 'a', { debounceMs: 10, minGapMs: 10 }, { debounceMs: 60_000, minGapMs: 0 })
  a.wind({ kind: 'track', body: 'straight in' }) // no settled(a)
  expect(a.pocket?.phase).toBe('checking')
  const t0 = Date.now()
  await a.leave()
  expect(Date.now() - t0).toBeLessThan(2_000) // the check settled on its own; nobody waited out the bound
  expect(await depositCount(relay.http, code, token)).toBe(1)
})

it('when the check never settles, leave() waits only the bound and deposits what it has (T-178)', async () => {
  const stub = await startStubRelay([200], { hangGet: true })
  const code = generateCode()
  const key = generateKey()
  const engine = new SpoolEngine({ code, relay: stub.ws, key, persist: false })
  const a = new Spool(
    engine,
    stub.ws,
    key,
    'a',
    { debounceMs: 10, minGapMs: 10 },
    { debounceMs: 60_000, minGapMs: 0, settleWaitMs: 100 }
  )
  a.wind({ kind: 'track', body: 'straight in' })
  const t0 = Date.now()
  await a.leave()
  const took = Date.now() - t0
  expect(took).toBeGreaterThanOrEqual(90)
  expect(took).toBeLessThan(1_500)
  expect(stub.puts).toEqual([200]) // deposited blind rather than not at all
  expect(a.pocket?.phase).toBe('checking') // honest: the check never came back before we left
})

it('pagehide flushes too — a tab that was never visible gets no visibilitychange (T-178)', async () => {
  // stand in a document (hidden from the start: the automation-window case)
  // and a window that can dispatch pagehide
  const win = new EventTarget()
  const g = globalThis as unknown as Record<string, unknown>
  const saved = { document: g.document, add: g.addEventListener, remove: g.removeEventListener, dispatch: g.dispatchEvent }
  g.document = Object.assign(new EventTarget(), { visibilityState: 'hidden' })
  g.addEventListener = win.addEventListener.bind(win)
  g.removeEventListener = win.removeEventListener.bind(win)
  g.dispatchEvent = win.dispatchEvent.bind(win)
  try {
    const stub = await startStubRelay([200])
    const code = generateCode()
    const key = generateKey()
    const engine = new SpoolEngine({ code, relay: stub.ws, key, persist: false })
    const a = track(
      new Spool(engine, stub.ws, key, 'a', { debounceMs: 10, minGapMs: 10 }, { debounceMs: 60_000, minGapMs: 0 })
    )
    await settled(a)
    a.wind({ kind: 'track', body: 'about to navigate away' })
    expect(stub.puts).toEqual([])
    win.dispatchEvent(new Event('pagehide'))
    expect(await until(() => stub.puts.length === 1)).toBe(true)
    expect(stub.puts).toEqual([200])
  } finally {
    g.document = saved.document
    g.addEventListener = saved.add
    g.removeEventListener = saved.remove
    g.dispatchEvent = saved.dispatch
  }
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

// ---- T-178: a deposit never fails silently at leave ----

/** deposits debounce beyond the test's life; the flush's retries are fast (tries at +0, +20 ms, +60 ms) */
const rateLimitedSpool = (relayWs: string, key: Uint8Array, flushRetries = 2) =>
  new Spool(
    new SpoolEngine({ code: generateCode(), relay: relayWs, key, persist: false }),
    relayWs,
    key,
    'a',
    { debounceMs: 10, minGapMs: 10 },
    { debounceMs: 60_000, minGapMs: 0, flushRetries, flushBackoffMs: 20 }
  )

it('a 429 on the way out is retried with backoff and lands (T-178)', async () => {
  const stub = await startStubRelay([429, 429, 200])
  const a = rateLimitedSpool(stub.ws, generateKey())
  await settled(a)
  a.wind({ kind: 'note', body: 'going out under a rate limit' })
  const t0 = Date.now()
  await a.leave()
  expect(stub.puts).toEqual([429, 429, 200]) // three tries, the third admitted
  expect(Date.now() - t0).toBeGreaterThanOrEqual(60) // 20 ms then 40 ms: backoff, not a hot loop
  expect(a.pocket?.depositError).toBeUndefined()
})

it('a 429 that outlasts the bounded retry is named, never swallowed (T-178)', async () => {
  const stub = await startStubRelay([429])
  const a = rateLimitedSpool(stub.ws, generateKey())
  await settled(a)
  const seen: PocketState[] = []
  a.on('pocket', (s) => seen.push(s))
  a.wind({ kind: 'note', body: 'refused three times' })
  await a.leave() // resolves: a refused deposit is no reason to block leaving
  expect(stub.puts).toEqual([429, 429, 429])
  expect(a.pocket?.depositError).toBe('rate-limited') // readable after leave(), the moment an app would ask
  expect(seen[seen.length - 1]?.depositError).toBe('rate-limited') // and the event carried it before teardown
})

it("a hidden tab's flush that gives up says 'rate-limited'; the next accepted deposit clears it (T-178)", async () => {
  const stub = await startStubRelay([429, 200])
  const listeners: (() => void)[] = []
  const fakeDocument = {
    visibilityState: 'visible',
    addEventListener: (_type: string, cb: () => void) => listeners.push(cb),
    removeEventListener: () => {},
  }
  vi.stubGlobal('document', fakeDocument) // the pocket client wires visibilitychange only when a document exists
  try {
    const key = generateKey()
    const relayWs = stub.ws
    // no flush retries: the hidden tab's one try meets the 429 and names it;
    // the scheduler's own re-arm after a 429 then lands the deposit and heals
    const a = new Spool(
      new SpoolEngine({ code: generateCode(), relay: relayWs, key, persist: false }),
      relayWs,
      key,
      'a',
      { debounceMs: 10, minGapMs: 10 },
      { debounceMs: 100, minGapMs: 0, flushRetries: 0 }
    )
    await settled(a)
    const seen: (string | undefined)[] = []
    a.on('pocket', (s) => seen.push(s.depositError))
    a.wind({ kind: 'note', body: 'tab going dark' })
    fakeDocument.visibilityState = 'hidden'
    for (const cb of listeners) cb() // visibilitychange → the best-effort flush
    expect(await until(() => stub.puts.length === 2 && a.pocket?.depositError === undefined)).toBe(true)
    expect(stub.puts).toEqual([429, 200])
    expect(seen).toEqual(['rate-limited', undefined]) // named, then healed — both said out loud
    await a.leave()
  } finally {
    vi.unstubAllGlobals()
  }
})

it('small deposits ride keepalive so a closing tab cannot cancel them; past 64 KiB sealed they cannot (T-178)', async () => {
  const relay = await startRealRelay()
  const code = generateCode()
  const key = generateKey()
  const seen: { bytes: number; keepalive: unknown }[] = []
  const realFetch = globalThis.fetch
  const spy = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
    if (init?.method === 'PUT') seen.push({ bytes: (init.body as Uint8Array).byteLength, keepalive: init.keepalive })
    return realFetch(input, init)
  })
  try {
    const a = track(tunedSpool(code, relay.ws, key))
    await settled(a)
    a.wind({ kind: 'note', body: 'small' })
    expect(await until(() => seen.length === 1)).toBe(true)
    a.wind({ kind: 'note', body: 'x'.repeat(70_000) }) // sealed, this no longer fits the keepalive budget
    expect(await until(() => seen.length === 2)).toBe(true)
    expect(seen[0].bytes).toBeLessThanOrEqual(KEEPALIVE_MAX_BYTES)
    expect(seen[0].keepalive).toBe(true)
    expect(seen[1].bytes).toBeGreaterThan(KEEPALIVE_MAX_BYTES)
    expect(seen[1].keepalive).toBeUndefined()
    expect(await depositCount(relay.http, code, deriveToken(key))).toBe(1) // one tag, newest wins: both were admitted
  } finally {
    spy.mockRestore()
  }
})
