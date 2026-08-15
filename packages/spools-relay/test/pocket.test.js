// T-101: the pocket capability, tested against the real server as a child
// process — the relay has no build step and its tests have no framework,
// just node:test. Each test spawns its own instance with the knobs it needs.
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocket } from 'ws'

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', 'server.js')
let nextPort = 15100
const children = []
after(() => children.forEach((c) => c.kill()))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const startRelay = async (env = {}) => {
  const port = nextPort++
  const child = spawn(process.execPath, [SERVER], {
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', ...env },
    stdio: 'ignore',
  })
  children.push(child)
  const base = `http://127.0.0.1:${port}`
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base)).ok) return { base, port, child }
    } catch {
      await sleep(50)
    }
  }
  throw new Error('relay did not come up')
}

/** a minimal valid deposit: magic ‖ version ‖ tag(4) ‖ opaque payload */
const deposit = (tag = [1, 2, 3, 4], payloadBytes = 40) =>
  Buffer.concat([Buffer.from([0xe2, 0xe3, 1, ...tag]), Buffer.alloc(payloadBytes, 7)])

const put = async (base, ns, blob) =>
  fetch(`${base}/pocket/${ns}`, { method: 'PUT', body: blob }).then(async (r) => ({ status: r.status, json: await r.json() }))
const get = async (base, ns) =>
  fetch(`${base}/pocket/${ns}`).then(async (r) => ({ status: r.status, json: await r.json() }))

test('health JSON keeps its old shape and gains the pocket block (counts only)', async () => {
  const { base } = await startRelay()
  const health = await (await fetch(base)).json()
  assert.equal(health.status, 'ok')
  assert.ok(health.relay && health.signaling, 'v1 fields intact')
  assert.deepEqual(Object.keys(health.pocket).sort(), ['deposits', 'maxBytes', 'rooms', 'ttlDays'])
  assert.equal(health.pocket.deposits, 0)
})

test('the broadcast half is untouched: frames fan out, sender excluded', async () => {
  const { port } = await startRelay()
  const a = new WebSocket(`ws://127.0.0.1:${port}/yjs/room-one-001`)
  const b = new WebSocket(`ws://127.0.0.1:${port}/yjs/room-one-001`)
  const got = { a: [], b: [] }
  a.on('message', (d) => got.a.push(Buffer.from(d)))
  b.on('message', (d) => got.b.push(Buffer.from(d)))
  await Promise.all([new Promise((r) => a.on('open', r)), new Promise((r) => b.on('open', r))])
  a.send(Buffer.from([9, 9, 9]))
  await sleep(200)
  assert.equal(got.b.length, 1, 'peer receives the frame')
  assert.equal(got.a.length, 0, 'sender excluded')
  a.close()
  b.close()
})

test('PUT/GET roundtrip speaks the envelope; deposits come back newest-first per tag', async () => {
  const { base } = await startRelay()
  const p = await put(base, 'amber-cassette-042/tokenAAAA', deposit([1, 1, 1, 1]))
  assert.equal(p.status, 200)
  assert.equal(p.json.format, 'spool-pocket')
  assert.equal(p.json.stored, true)
  await put(base, 'amber-cassette-042/tokenAAAA', deposit([2, 2, 2, 2]))
  const g = await get(base, 'amber-cassette-042/tokenAAAA')
  assert.equal(g.json.format, 'spool-pocket')
  assert.equal(typeof g.json.ttlDays, 'number')
  assert.equal(g.json.deposits.length, 2)
  assert.ok(g.json.deposits[0].at >= g.json.deposits[1].at)
})

test('garbage is refused at the envelope; oversize at the cap', async () => {
  const { base } = await startRelay({ POCKET_MAX_BYTES: '100' })
  assert.equal((await put(base, 'r/t', Buffer.from('not a deposit'))).status, 400)
  assert.equal((await put(base, 'r/t', deposit([1, 1, 1, 1], 200))).status, 413)
  assert.equal((await get(base, 'r/t')).json.deposits.length, 0)
})

test('per-tag ring: same tag replaces its own slot; K+1th distinct tag evicts the stalest', async () => {
  const { base } = await startRelay({ POCKET_K: '2' })
  await put(base, 'r/t', deposit([1, 1, 1, 1]))
  await sleep(20)
  await put(base, 'r/t', deposit([1, 1, 1, 1])) // same writer re-deposits: still one slot
  assert.equal((await get(base, 'r/t')).json.deposits.length, 1)
  await sleep(20)
  await put(base, 'r/t', deposit([2, 2, 2, 2]))
  assert.equal((await get(base, 'r/t')).json.deposits.length, 2)
  await sleep(20)
  await put(base, 'r/t', deposit([3, 3, 3, 3])) // third tag with K=2: tag 1 (stalest) goes
  const g = await get(base, 'r/t')
  assert.equal(g.json.deposits.length, 2)
})

test('namespaces are fully isolated: a guessed token never touches the real ring', async () => {
  const { base } = await startRelay()
  await put(base, 'r/realtoken', deposit([1, 1, 1, 1]))
  for (let i = 0; i < 5; i++) await put(base, 'r/guessedtoken', deposit([9, 9, 9, i]))
  assert.equal((await get(base, 'r/realtoken')).json.deposits.length, 1)
})

test('per-IP rate limit answers 429', async () => {
  const { base } = await startRelay({ POCKET_PUTS_PER_MIN: '3' })
  for (let i = 0; i < 3; i++) assert.equal((await put(base, 'r/t', deposit([1, 1, 1, i]))).status, 200)
  assert.equal((await put(base, 'r/t', deposit([1, 1, 1, 9]))).status, 429)
})

test('relay-wide budget: stalest namespace evicted first; an unfittable blob gets 507', async () => {
  const { base } = await startRelay({ POCKET_MAX_TOTAL_BYTES: '150' })
  await put(base, 'r/first', deposit([1, 1, 1, 1], 60)) // 67 bytes
  await sleep(20)
  await put(base, 'r/second', deposit([2, 2, 2, 2], 60)) // 134 total
  await sleep(20)
  const p3 = await put(base, 'r/third', deposit([3, 3, 3, 3], 60)) // evicts r/first
  assert.equal(p3.status, 200)
  assert.equal((await get(base, 'r/first')).json.deposits.length, 0, 'stalest namespace evicted')
  assert.equal((await get(base, 'r/second')).json.deposits.length, 1)
  assert.equal((await put(base, 'r/huge', deposit([4, 4, 4, 4], 400))).status, 507)
})

test('TTL sweeps unread namespaces; touch-on-read keeps opened spools covered', async () => {
  // TTL ≈ 2.6 s, swept every 150 ms
  const { base } = await startRelay({ POCKET_TTL_DAYS: '0.00003', POCKET_SWEEP_MS: '150' })
  await put(base, 'r/touched', deposit([1, 1, 1, 1]))
  await put(base, 'r/forgotten', deposit([2, 2, 2, 2]))
  for (let i = 0; i < 5; i++) {
    await sleep(800)
    await get(base, 'r/touched') // reads refresh expiry
  }
  assert.equal((await get(base, 'r/touched')).json.deposits.length, 1, 'read-refreshed namespace survives 4 s > TTL')
  assert.equal((await get(base, 'r/forgotten')).json.deposits.length, 0, 'unread namespace swept')
})

test('POCKET_DIR: deposits are plain files and survive a relay restart', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pocket-'))
  const first = await startRelay({ POCKET_DIR: dir })
  await put(first.base, 'amber-cassette-042/tok', deposit([1, 1, 1, 1]))
  await put(first.base, 'amber-cassette-042/tok', deposit([2, 2, 2, 2]))
  const files = await readdir(join(dir, 'amber-cassette-042', 'tok'))
  assert.equal(files.length, 2, 'one plain file per tag')
  first.child.kill()
  await sleep(100)
  const second = await startRelay({ POCKET_DIR: dir })
  const g = await get(second.base, 'amber-cassette-042/tok')
  assert.equal(g.json.deposits.length, 2, 'index rebuilt from files at boot')
})

test('method and path discipline: 405 beyond GET/PUT, 400 on unsafe segments', async () => {
  const { base } = await startRelay()
  const post = await fetch(`${base}/pocket/r/t`, { method: 'POST', body: 'x' })
  assert.equal(post.status, 405)
  assert.equal((await (await fetch(`${base}/pocket/r/..%2Fescape`, { method: 'PUT', body: deposit() })).json()).error, 'bad namespace')
})

test('the absence proof holds: server.js imports neither yjs nor y-websocket', async () => {
  const src = await (await import('node:fs/promises')).readFile(SERVER, 'utf8')
  assert.ok(!/from 'y(js|-websocket)'/.test(src))
  assert.ok(!/require\(.y(js|-websocket)/.test(src))
})
