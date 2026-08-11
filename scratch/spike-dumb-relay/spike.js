// T-003 spike harness. Node clients use the real y-websocket provider through
// the dumb relay. Incoming frames are decoded *client-side* for stats only —
// the relay itself stays byte-blind.
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import * as decoding from 'lib0/decoding'
import WS from 'ws'
import { startRelay } from './relay.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const waitUntil = async (fn, ms = 5000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (fn()) return true
    await sleep(25)
  }
  return fn()
}

// frame kinds, per y-protocols: messageType 0 = sync (subtype 0/1/2 =
// step1/step2/update), 1 = awareness
const classify = (buf) => {
  const d = decoding.createDecoder(new Uint8Array(buf))
  const type = decoding.readVarUint(d)
  if (type === 0) return ['step1', 'step2', 'update'][decoding.readVarUint(d)] ?? 'sync?'
  return { 1: 'awareness', 2: 'auth', 3: 'queryAwareness' }[type] ?? `type${type}`
}

const mkClient = (port, room, name, opts = {}) => {
  const doc = new Y.Doc()
  const provider = new WebsocketProvider(`ws://127.0.0.1:${port}`, room, doc, {
    WebSocketPolyfill: WS,
    disableBc: true,
    ...opts,
  })
  const rx = {}
  const errors = []
  // tap received frames for stats: intercept the provider's ws assignment so
  // the listener is attached before the socket can deliver anything
  let _ws = provider.ws
  const tapSocket = (ws) => {
    if (ws && typeof ws.on === 'function' && !ws._tapped) {
      ws._tapped = true
      ws.on('message', (data) => {
        const kind = classify(data)
        rx[kind] = (rx[kind] ?? 0) + 1
      })
    }
  }
  tapSocket(_ws)
  Object.defineProperty(provider, 'ws', {
    get: () => _ws,
    set: (v) => { _ws = v; tapSocket(v) },
  })
  provider.on('connection-error', (e) => errors.push(`${name}: ${e?.message ?? e}`))
  return {
    doc,
    provider,
    name,
    rx,
    errors,
    map: doc.getMap('m'),
    stop: () => provider.destroy(),
  }
}

// order-insensitive doc equality: concurrent writers converge to the same map
// but not the same key insertion order
const same = (...clients) => {
  const canon = clients.map((c) => JSON.stringify(Object.entries(c.map.toJSON()).sort()))
  return canon.every((j) => j === canon[0])
}

const results = []
const record = (id, pass, detail) => {
  results.push({ id, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${id} — ${detail}`)
}

let port = 7801

// ─── S1: two clients, live sync both directions + awareness ───
{
  const relay = await startRelay({ port: ++port })
  const room = 's1'
  const a = mkClient(port, room, 'A')
  const b = mkClient(port, room, 'B')
  a.provider.awareness.setLocalStateField('user', { name: 'A' })
  b.provider.awareness.setLocalStateField('user', { name: 'B' })
  await waitUntil(() => a.provider.wsconnected && b.provider.wsconnected)
  a.map.set('from-a', 1)
  await waitUntil(() => b.map.get('from-a') === 1)
  b.map.set('from-b', 2)
  const ok = await waitUntil(() => a.map.get('from-b') === 2 && same(a, b))
  const awarenessOk = await waitUntil(
    () =>
      [...a.provider.awareness.getStates().values()].some((s) => s.user?.name === 'B') &&
      [...b.provider.awareness.getStates().values()].some((s) => s.user?.name === 'A')
  )
  record('S1 live two-way sync', ok, `docs equal: ${same(a, b)}; A rx ${JSON.stringify(a.rx)}`)
  record('S1 awareness fan-out', awarenessOk, 'both peers see the other\'s awareness state')
  a.stop(); b.stop(); relay.close()
}

// ─── S2: late join — A holds 100 prior updates, B joins fresh ───
{
  const relay = await startRelay({ port: ++port })
  const room = 's2'
  const a = mkClient(port, room, 'A')
  await waitUntil(() => a.provider.wsconnected)
  for (let i = 0; i < 100; i++) a.map.set(`k${i}`, i)
  await sleep(200)
  const b = mkClient(port, room, 'B')
  const ok = await waitUntil(() => b.map.size === 100 && same(a, b))
  record('S2 late join, peer online', ok, `B has ${b.map.size}/100 keys; B rx ${JSON.stringify(b.rx)}`)
  a.stop(); b.stop(); relay.close()
}

// ─── S3: offline gap — A writes & leaves; B joins alone; A returns ───
// S3a: stock provider options (no resync)
{
  const relay = await startRelay({ port: ++port })
  const room = 's3a'
  const docA = new Y.Doc()
  {
    const a = mkClient(port, room, 'A')
    // reuse A's doc so state survives the disconnect
    a.doc.getMap('m').set('old', 'news')
    Y.applyUpdate(docA, Y.encodeStateAsUpdate(a.doc))
    await waitUntil(() => a.provider.wsconnected)
    a.stop()
  }
  const b = mkClient(port, room, 'B')
  await waitUntil(() => b.provider.wsconnected)
  await sleep(2000)
  const aloneOk = b.map.size === 0 && b.errors.length === 0
  record('S3 join with nobody home', aloneOk, `B sees ${b.map.size} keys, ${b.errors.length} errors (graceful wait)`)
  // A returns, same doc state, fresh provider
  const providerA2 = new WebsocketProvider(`ws://127.0.0.1:${port}`, room, docA, {
    WebSocketPolyfill: WS,
    disableBc: true,
  })
  const bConverged = await waitUntil(() => b.map.get('old') === 'news', 4000)
  record(
    'S3a rejoin heals waiting peer (stock options)',
    bConverged,
    bConverged ? 'B caught up' : 'B still empty — waiting peer never re-asks; nobody pushes old state to it'
  )
  providerA2.destroy(); b.stop(); relay.close()
}

// S3b: same shape, but clients run resyncInterval (client-side fix candidate)
{
  const relay = await startRelay({ port: ++port })
  const room = 's3b'
  const docA = new Y.Doc()
  docA.getMap('m').set('old', 'news')
  const b = mkClient(port, room, 'B', { resyncInterval: 300 })
  await waitUntil(() => b.provider.wsconnected)
  await sleep(500)
  const providerA2 = new WebsocketProvider(`ws://127.0.0.1:${port}`, room, docA, {
    WebSocketPolyfill: WS,
    disableBc: true,
    resyncInterval: 300,
  })
  const healed = await waitUntil(() => b.map.get('old') === 'news', 4000)
  record('S3b rejoin heals with resyncInterval', healed, healed ? 'B converged via periodic step1' : 'still stale')
  providerA2.destroy(); b.stop(); relay.close()
}

// ─── S4: three clients, concurrent writes ───
{
  const relay = await startRelay({ port: ++port })
  const room = 's4'
  const clients = ['A', 'B', 'C'].map((n) => mkClient(port, room, n))
  await waitUntil(() => clients.every((c) => c.provider.wsconnected))
  for (const c of clients) for (let i = 0; i < 20; i++) c.map.set(`${c.name}${i}`, i)
  const ok = await waitUntil(() => clients.every((c) => c.map.size === 60) && same(...clients))
  const rxTotals = clients.map((c) => `${c.name}:${JSON.stringify(c.rx)}`).join(' ')
  record('S4 three-way concurrent converge', ok, `all at 60 keys; relay ${relay.stats.framesIn}→${relay.stats.framesOut} frames; ${rxTotals}`)
  clients.forEach((c) => c.stop()); relay.close()
}

// ─── S5: echo probe — relay includes sender in fan-out ───
{
  const relay = await startRelay({ port: ++port, echo: true })
  const room = 's5'
  const a = mkClient(port, room, 'A')
  const b = mkClient(port, room, 'B')
  await waitUntil(() => a.provider.wsconnected && b.provider.wsconnected)
  a.map.set('x', 1)
  b.map.set('y', 2)
  const ok = await waitUntil(() => same(a, b) && a.map.size === 2)
  record('S5 echo relay still converges', ok, `A rx ${JSON.stringify(a.rx)} (self-frames answered by self — pure waste)`)
  a.stop(); b.stop(); relay.close()
}

console.log('\n--- summary ---')
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id}`)
process.exit(results.every((r) => r.pass || r.id.startsWith('S3a')) ? 0 : 1)
