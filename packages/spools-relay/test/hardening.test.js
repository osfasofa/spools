// M15 hardening (the ship review's relay rail), tested against real spawned
// instances like pocket.test.js: T-161 the proxy-aware client address,
// T-170 backpressure and the frame budget on the broadcast path, T-169 the
// per-address room cap, T-168 pocket eviction order and admission.
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { WebSocket } from 'ws'
import { relayPool, sleep, deposit, put, get } from './helpers.js'

const pool = relayPool(15300)
const startRelay = pool.start
after(pool.stop)

/** resolves { code, reason } when the socket closes */
const closedWith = (ws) => new Promise((r) => ws.once('close', (code, reason) => r({ code, reason: reason.toString() })))
/** resolves once open; `ws.closed` is armed before that, so a refusal right after the handshake can't be missed */
const openSocket = (port, room, headers = {}) =>
  new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/yjs/${room}`, { headers })
    ws.closed = closedWith(ws)
    ws.once('open', () => resolve(ws))
    ws.once('error', reject)
  })
const withTimeout = (promise, ms, what) =>
  Promise.race([promise, sleep(ms).then(() => Promise.reject(new Error(`timed out waiting for ${what}`)))])
const health = async (base) => (await fetch(base)).json()

// ---------- T-161: which address does a per-IP limit key on? ----------

test('TRUST_PROXY: the rightmost X-Forwarded-For hop is the client, each with its own deposit budget', async () => {
  const { base } = await startRelay({ TRUST_PROXY: '1', POCKET_PUTS_PER_MIN: '2' })
  const putAs = (xff, i) => put(base, 'r/t', deposit([1, 1, 1, i]), { 'x-forwarded-for': xff })
  assert.equal((await putAs('203.0.113.1', 1)).status, 200)
  assert.equal((await putAs('203.0.113.1', 2)).status, 200)
  assert.equal((await putAs('203.0.113.1', 3)).status, 429, 'first address has spent its 2/min')
  assert.equal((await putAs('203.0.113.2', 4)).status, 200, 'second address has an independent budget')
  // the proxy appends the real client LAST; a client-supplied leftmost value buys nothing
  assert.equal((await putAs('198.51.100.9, 203.0.113.1', 5)).status, 429, 'spoofed leftmost hop, same bucket')
  assert.equal((await putAs('203.0.113.1, 203.0.113.3', 6)).status, 200, 'a chain whose rightmost hop is new is a new client')
})

test('without TRUST_PROXY the header is ignored: everyone is the socket address', async () => {
  const { base } = await startRelay({ POCKET_PUTS_PER_MIN: '2' })
  const putAs = (xff, i) => put(base, 'r/t', deposit([1, 1, 1, i]), { 'x-forwarded-for': xff })
  assert.equal((await putAs('203.0.113.1', 1)).status, 200)
  assert.equal((await putAs('203.0.113.2', 2)).status, 200)
  assert.equal((await putAs('203.0.113.3', 3)).status, 429, 'three "addresses", one bucket: the header bought nothing')
})

// ---------- T-170: backpressure and the frame budget ----------

test('slow consumer: a peer that stops reading is skipped and closed 1008 "slow consumer"; the others lose nothing', async () => {
  // 4 MiB cap; the budget guards off so the sender can blast
  const { base, port } = await startRelay({
    RELAY_MAX_BUFFERED_BYTES: String(4 * 1024 * 1024),
    RELAY_MAX_FRAMES_PER_SEC: '0',
    RELAY_MAX_BYTES_PER_MIN: '0',
  })
  const [sender, healthy, slow] = await Promise.all([openSocket(port, 'r'), openSocket(port, 'r'), openSocket(port, 'r')])
  let healthyGot = 0
  let slowGot = 0
  healthy.on('message', () => healthyGot++)
  slow.on('message', () => slowGot++)
  const slowClosed = closedWith(slow)
  slow.pause() // stops reading its socket: the kernel window fills, then the relay's write queue for it grows

  // 48 MiB in 64 KiB frames — loopback holds ≤ ~8 MiB in-kernel, so the
  // relay's queue for `slow` must cross 4 MiB long before the end. Paced on
  // `healthy` so a busy test process never makes IT look slow.
  const frame = Buffer.alloc(64 * 1024, 1)
  let sent = 0
  while (sent < 768) {
    sender.send(frame)
    sent++
    while (healthyGot < sent - 16) await sleep(1)
  }
  while (healthyGot < sent) await sleep(5)

  slow.resume() // drains what was queued for it — then finds the close frame
  const { code, reason } = await withTimeout(slowClosed, 10_000, 'the slow consumer to be closed')
  assert.equal(code, 1008)
  assert.equal(reason, 'slow consumer')
  assert.equal(healthyGot, sent, 'the healthy peer received every frame')
  assert.ok(slowGot < sent, `the relay stopped feeding the slow peer (got ${slowGot} of ${sent})`)
  assert.ok(slowGot * frame.length < 4 * 1024 * 1024 + 8 * 1024 * 1024 + frame.length, 'what it did get is bounded by cap + kernel buffers')
  await sleep(100)
  assert.equal((await health(base)).relay.connections, 2, 'slow peer gone from the room; the room lives on')
  sender.close()
  healthy.close()
})

test('flooder: over RELAY_MAX_FRAMES_PER_SEC → closed 1008 with a reason; the room keeps working for everyone else', async () => {
  const { port } = await startRelay({ RELAY_MAX_FRAMES_PER_SEC: '20' })
  const [flooder, a, b] = await Promise.all([openSocket(port, 'r'), openSocket(port, 'r'), openSocket(port, 'r')])
  let aGot = 0
  let bGot = 0
  a.on('message', () => aGot++)
  b.on('message', () => bGot++)
  const flooderClosed = closedWith(flooder)
  for (let i = 0; i < 100; i++) flooder.send(Buffer.from([i]))
  const { code, reason } = await withTimeout(flooderClosed, 5_000, 'the flooder to be closed')
  assert.equal(code, 1008)
  assert.equal(reason, 'frame budget exceeded')
  await sleep(100)
  assert.equal(aGot, 20, 'exactly the budget got through')
  assert.equal(bGot, 20)
  const bNext = new Promise((r) => b.once('message', (d) => r(Buffer.from(d))))
  a.send(Buffer.from([7, 7]))
  assert.deepEqual(await withTimeout(bNext, 2_000, 'the room to still relay'), Buffer.from([7, 7]))
  a.close()
  b.close()
})

test('byte budget: over RELAY_MAX_BYTES_PER_MIN → closed 1008 "frame budget exceeded"', async () => {
  const { port } = await startRelay({ RELAY_MAX_BYTES_PER_MIN: '1000' })
  const [f, a] = await Promise.all([openSocket(port, 'r'), openSocket(port, 'r')])
  let aGot = 0
  a.on('message', () => aGot++)
  const fClosed = closedWith(f)
  for (let i = 0; i < 4; i++) f.send(Buffer.alloc(300, i)) // 300, 600, 900 fit; 1200 does not
  const { code, reason } = await withTimeout(fClosed, 5_000, 'the byte flooder to be closed')
  assert.equal(code, 1008)
  assert.equal(reason, 'frame budget exceeded')
  await sleep(100)
  assert.equal(aGot, 3)
  a.close()
})

test('ordinary traffic is untouched on the stock knobs: three seats at 30 frames/s each, nothing dropped, nobody closed', async () => {
  const { port } = await startRelay()
  const seats = await Promise.all([openSocket(port, 'r'), openSocket(port, 'r'), openSocket(port, 'r')])
  const got = [0, 0, 0]
  let anyClosed = false
  seats.forEach((s, i) => {
    s.on('message', () => got[i]++)
    s.once('close', () => (anyClosed = true))
  })
  for (let i = 0; i < 30; i++) {
    for (const s of seats) s.send(Buffer.alloc(1024, i))
    await sleep(10)
  }
  await sleep(300)
  assert.equal(anyClosed, false)
  assert.deepEqual(got, [60, 60, 60], 'each seat heard the other two, every frame')
  seats.forEach((s) => s.close())
})

// ---------- T-169 (relay half): per-address cap per room ----------

test('per-IP-per-room cap with TRUST_PROXY: a third socket from one forwarded address gets 1013 with its own reason; another address still gets in', async () => {
  const { base, port } = await startRelay({ TRUST_PROXY: '1', RELAY_CONNS_PER_IP_PER_ROOM: '2' })
  const from = (xff) => ({ 'x-forwarded-for': xff })
  const a1 = await openSocket(port, 'r', from('203.0.113.1'))
  const a2 = await openSocket(port, 'r', from('203.0.113.1'))
  const a3 = await openSocket(port, 'r', from('203.0.113.1'))
  const { code, reason } = await withTimeout(a3.closed, 5_000, 'the third socket to be refused')
  assert.equal(code, 1013, 'the SDK reads 1013 as "full"')
  assert.equal(reason, 'too many connections from this address')
  const b1 = await openSocket(port, 'r', from('203.0.113.2'))
  await sleep(50)
  assert.equal((await health(base)).relay.connections, 3, 'two from the first address, one from the second')
  // the cap is per room: the same address opens another room freely
  const elsewhere = await openSocket(port, 'other', from('203.0.113.1'))
  await sleep(50)
  assert.equal((await health(base)).relay.connections, 4)
  // and a slot frees when one leaves
  a1.close()
  await sleep(100)
  const a4 = await openSocket(port, 'r', from('203.0.113.1'))
  await sleep(100)
  assert.equal(a4.readyState, WebSocket.OPEN, 'a freed slot is a slot again')
  for (const s of [a2, a4, b1, elsewhere]) s.close()
})

test('per-IP-per-room cap is off by default, and without TRUST_PROXY the header cannot buy a fresh address', async () => {
  const stock = await startRelay()
  const three = await Promise.all([openSocket(stock.port, 'r'), openSocket(stock.port, 'r'), openSocket(stock.port, 'r')])
  await sleep(50)
  assert.equal((await health(stock.base)).relay.connections, 3, 'stock knobs: no per-address cap at all')
  three.forEach((s) => s.close())

  const capped = await startRelay({ RELAY_CONNS_PER_IP_PER_ROOM: '2' })
  const from = (xff) => ({ 'x-forwarded-for': xff })
  const c1 = await openSocket(capped.port, 'r', from('203.0.113.1'))
  const c2 = await openSocket(capped.port, 'r', from('203.0.113.2'))
  const c3 = await openSocket(capped.port, 'r', from('203.0.113.3'))
  const { code, reason } = await withTimeout(c3.closed, 5_000, 'the third socket to be refused')
  assert.equal(code, 1013)
  assert.equal(reason, 'too many connections from this address')
  c1.close()
  c2.close()
})

// ---------- T-168: eviction order, namespace creation cap, first-deposit cap ----------

test('eviction order: a tiny budget, twenty junk namespaces, and the one namespace somebody collected survives', async () => {
  const { base } = await startRelay({ POCKET_MAX_TOTAL_BYTES: '340' }) // 67-byte deposits (7 + 60): five fit
  assert.equal((await put(base, 'r/real', deposit([1, 1, 1, 1], 60))).status, 200)
  assert.equal((await get(base, 'r/real')).json.deposits.length, 1, 'collected once — that is what makes it worth keeping')
  for (let i = 0; i < 20; i++) {
    await sleep(5)
    assert.equal((await put(base, `r/junk${i}`, deposit([9, 9, 9, i], 60))).status, 200)
  }
  assert.equal((await get(base, 'r/real')).json.deposits.length, 1, 'the stalest-touched namespace of all, and it survived: never-read ones went first')
  assert.equal((await get(base, 'r/junk0')).json.deposits.length, 0, 'the oldest never-read namespace went first')
  assert.equal((await get(base, 'r/junk19')).json.deposits.length, 1, 'the newest junk is still there')
  assert.equal((await (await fetch(base)).json()).pocket.deposits, 5, 'the budget still holds')
})

test('POCKET_DIR: the read count is a .reads sidecar beside the deposits, restored at boot, and still ranks eviction after a restart', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pocket-reads-'))
  const first = await startRelay({ POCKET_DIR: dir })
  await put(first.base, 'r/read', deposit([1, 1, 1, 1], 60)) // 67 B each
  await get(first.base, 'r/read')
  await get(first.base, 'r/read')
  await sleep(20)
  await put(first.base, 'r/unread', deposit([2, 2, 2, 2], 60))
  await sleep(50)
  assert.equal(await readFile(join(dir, 'r', 'read', '.reads'), 'utf8'), '2', 'the sidecar is a plain count')
  assert.equal(existsSync(join(dir, 'r', 'unread', '.reads')), false, 'never read, no sidecar')
  first.child.kill()
  await sleep(100)
  // budget fits exactly two 67-byte deposits: the next namespace forces one eviction, before any read could re-rank
  const second = await startRelay({ POCKET_DIR: dir, POCKET_MAX_TOTAL_BYTES: '150' })
  assert.equal((await put(second.base, 'r/third', deposit([3, 3, 3, 3], 60))).status, 200)
  assert.equal((await get(second.base, 'r/unread')).json.deposits.length, 0, 'the never-read namespace went, though it was touched later')
  assert.equal((await get(second.base, 'r/read')).json.deposits.length, 1, 'the collected one survived — its count came back at boot, and the sidecar was not mistaken for a deposit')
})

test('POCKET_NEW_NAMESPACES_PER_HOUR (with TRUST_PROXY): a third new namespace from one address is refused; re-deposits, refusals and other addresses do not count', async () => {
  const { base } = await startRelay({ TRUST_PROXY: '1', POCKET_NEW_NAMESPACES_PER_HOUR: '2' })
  const from = (xff) => ({ 'x-forwarded-for': xff })
  assert.equal((await put(base, 'r/one', deposit([1, 1, 1, 1]), from('203.0.113.1'))).status, 200)
  assert.equal((await put(base, 'r/two', deposit([1, 1, 1, 2]), from('203.0.113.1'))).status, 200)
  const third = await put(base, 'r/three', deposit([1, 1, 1, 3]), from('203.0.113.1'))
  assert.equal(third.status, 429)
  assert.equal(third.json.error, 'too many new namespaces')
  assert.equal((await put(base, 'r/one', deposit([1, 1, 1, 4]), from('203.0.113.1'))).status, 200, 'an existing namespace is not a creation')
  assert.equal((await put(base, 'r/three', deposit([1, 1, 1, 5]), from('203.0.113.2'))).status, 200, 'another address has its own hour')
  assert.equal((await put(base, 'r/garbage', Buffer.from('not a deposit'), from('203.0.113.3'))).status, 400)
  assert.equal((await put(base, 'r/four', deposit([1, 1, 1, 6]), from('203.0.113.3'))).status, 200, 'a refused PUT burned no slot')
  assert.equal((await put(base, 'r/five', deposit([1, 1, 1, 7]), from('203.0.113.3'))).status, 200)
  assert.equal((await get(base, 'r/three')).json.deposits.length, 1)
})

test('POCKET_FIRST_MAX_BYTES: a namespace nobody has collected takes only small deposits; one read lifts it to POCKET_MAX_BYTES — and the default changes nothing', async () => {
  const { base } = await startRelay({ POCKET_FIRST_MAX_BYTES: '100', POCKET_MAX_BYTES: '1000' })
  const big = await put(base, 'r/t', deposit([1, 1, 1, 1], 200)) // 207 B
  assert.equal(big.status, 413)
  assert.equal(big.json.maxBytes, 100, 'the cap in force is the first-deposit cap')
  assert.equal((await put(base, 'r/t', deposit([1, 1, 1, 1], 50))).status, 200)
  assert.equal((await get(base, 'r/t')).json.deposits.length, 1) // collected once
  assert.equal((await put(base, 'r/t', deposit([1, 1, 1, 1], 200))).status, 200, 'read once: the full cap applies')
  const stock = await startRelay()
  assert.equal((await put(stock.base, 'r/fresh', deposit([2, 2, 2, 2], 2 * 1024 * 1024))).status, 200, 'stock knobs: a 2 MiB first deposit into a fresh namespace is accepted, as before')
})
