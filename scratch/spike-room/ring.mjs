// T-110/T-124: the pocket ring at group cardinality, against the CURRENT
// stock knobs (POCKET_K=8 since T-124; the K=4 evidence that drove the
// change lives in T-110's Notes).
//
//  R1: 5 partitioned seats — the M11 target scale — deposit divergent
//      worldviews; a cold joiner must reconstruct the FULL union (this was
//      the K=4 failure; K=8 is the fix being verified).
//  R2: 9 partitioned seats — past the new bound — lose exactly the stalest
//      unmerged worldview (the bound moved, it didn't vanish; README says so).
//  R3: the evicted writer returns → deposit-if-ahead re-deposits the union →
//      the next cold joiner is whole (the only self-heal path, measured).
//  R4: converged seats (the live-room case) — eviction is harmless at any K.
//
// Seats run the real Spool/PocketClient path with a dead WebSocket polyfill:
// pocket reachable over HTTP, live sync never happens — the partition shape.
//
// Run (repo root): mise x -- node scratch/spike-room/ring.mjs

import { spawn } from 'node:child_process'
import * as Y from '../../packages/spools/node_modules/yjs/dist/yjs.mjs'
import { Spool, SpoolEngine } from '../../packages/spools/dist/index.js'

const RELAY_PORTS = [9451, 9452] // scenario groups get their own relay so the PUTs/min/IP budget never trips
const here = new URL('.', import.meta.url)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** looks like a WebSocket, never connects: pocket reachable, live sync absent */
class DeadWS {
  constructor() {
    this.readyState = 0
    this.binaryType = 'arraybuffer'
  }
  addEventListener() {}
  removeEventListener() {}
  close() {}
  send() {}
}

const startRelay = (port) => {
  const proc = spawn(process.execPath, [new URL('../../packages/spools-relay/server.js', here).pathname], {
    stdio: ['ignore', 'pipe', 'inherit'],
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' },
  })
  return new Promise((resolve) => proc.stdout.once('data', () => resolve(proc)))
}

const seat = (code, key, port, author) => {
  const relay = `ws://127.0.0.1:${port}/yjs`
  const engine = new SpoolEngine({
    code,
    relay,
    persist: false,
    key,
    webrtc: false,
    disableBc: true, // Node has BroadcastChannel — same-process seats must not fake convergence (brief §4)
    WebSocketPolyfill: DeadWS,
  })
  // history silenced so deposits are purely entries; pocket debounce huge so
  // only leave()/deposit-if-ahead ever PUT — deterministic tag order
  return new Spool(engine, relay, key, author, { debounceMs: 1e9 }, { debounceMs: 1e9, minGapMs: 0 })
}

const settled = async (spool, label) => {
  for (let i = 0; i < 100; i++) {
    const phase = spool.pocket?.phase
    if (phase && phase !== 'checking') return phase
    await sleep(50)
  }
  throw new Error(`${label}: pocket never settled`)
}

// token derivation mirrored from pocket.ts (deriveToken isn't exported from the index)
import { createHash, randomBytes } from 'node:crypto'
const tokenFor = (key) =>
  createHash('sha512')
    .update(Buffer.concat([Buffer.from('spool-pocket-v1'), Buffer.from(key)]))
    .digest()
    .subarray(0, 12)
    .toString('base64url')
const pocketGet = async (port, code, key) => {
  const res = await fetch(`http://127.0.0.1:${port}/pocket/${code}/${tokenFor(key)}`)
  return res.json()
}

const seatCounts = (spool) => {
  const bySeat = new Map()
  for (const e of spool.entries) {
    const s = e.data?.seat ?? '?'
    bySeat.set(s, (bySeat.get(s) ?? 0) + 1)
  }
  return bySeat
}

/** N partitioned seats, 5 msgs each, serial leave() deposits; returns saved states */
const partitionedDeposit = async (code, key, port, n) => {
  const seats = Array.from({ length: n }, (_, i) => seat(code, key, port, `s${i + 1}`))
  await Promise.all(seats.map((s) => s.whenReady))
  await Promise.all(seats.map((s, i) => settled(s, `s${i + 1}`))) // all see the pocket empty before anyone writes
  seats.forEach((s, i) => {
    for (let m = 0; m < 5; m++) s.wind({ kind: 'message', body: `seat ${i + 1} message ${m + 1}`, data: { seat: `s${i + 1}` } })
  })
  const saved = {}
  for (const [i, s] of seats.entries()) {
    saved[i + 1] = Y.encodeStateAsUpdate(s.doc)
    await s.leave() // flushes the deposit — the real client path
    await sleep(30) // distinct ms timestamps → deterministic stalest-tag eviction
  }
  return saved
}

const coldJoin = async (code, key, port, label) => {
  const j = await Promise.resolve(seat(code, key, port, label))
  await j.whenReady
  await settled(j, label)
  return j
}

const relays = await Promise.all(RELAY_PORTS.map(startRelay))
const findings = []

// ---------- R1: 5 partitioned seats — the target scale — nothing lost ----------

{
  const code = 'ring-five'
  const key = randomBytes(32)
  await partitionedDeposit(code, key, RELAY_PORTS[0], 5)
  const held = await pocketGet(RELAY_PORTS[0], code, key)
  const joiner = await coldJoin(code, key, RELAY_PORTS[0], 'cold-6')
  const missing = ['s1', 's2', 's3', 's4', 's5'].filter((s) => !seatCounts(joiner).has(s))
  const ok = held.deposits.length === 5 && joiner.entries.length === 25 && missing.length === 0
  findings.push(`R1 (K=8, 5 divergent seats): relay holds ${held.deposits.length}/5 deposits; cold joiner ${joiner.entries.length}/25 — ${ok ? 'FULL union, nothing evicted' : `LOSS: missing ${missing.join(',')}`}`)
  await joiner.leave()
}

// ---------- R2: 9 partitioned seats — past the bound — stalest lost ----------

const code9 = 'ring-nine'
const key9 = randomBytes(32)
let saved9
{
  saved9 = await partitionedDeposit(code9, key9, RELAY_PORTS[1], 9)
  const held = await pocketGet(RELAY_PORTS[1], code9, key9)
  const joiner = await coldJoin(code9, key9, RELAY_PORTS[1], 'cold-10')
  const missing = Array.from({ length: 9 }, (_, i) => `s${i + 1}`).filter((s) => !seatCounts(joiner).has(s))
  findings.push(`R2 (9 divergent seats): relay holds ${held.deposits.length} deposits (K=8); cold joiner ${joiner.entries.length}/45; evicted: ${missing.join(',') || 'none'} — the bound moved, it didn't vanish`)
  await joiner.leave()
}

// ---------- R3: the evicted writer returns and heals the ring ----------

{
  const s1b = seat(code9, key9, RELAY_PORTS[1], 's1-return')
  Y.applyUpdate(s1b.doc, saved9[1]) // its local keepsake, applied before the fetch settles
  await s1b.whenReady
  await settled(s1b, 's1-return')
  await sleep(500) // deposit-if-ahead fires inside start(); give the PUT time
  await s1b.leave()
  const j = await coldJoin(code9, key9, RELAY_PORTS[1], 'cold-11')
  const missing = Array.from({ length: 9 }, (_, i) => `s${i + 1}`).filter((s) => !seatCounts(j).has(s))
  findings.push(`R3: evicted s1 returned → next cold joiner ${j.entries.length}/45; missing: ${missing.join(',') || 'none'} (the writer's own return is the heal path)`)
  await j.leave()
}

// ---------- R4: converged seats (the live-room case) — eviction harmless ----------

{
  const code2 = 'ring-converged'
  const key2 = randomBytes(32)
  const seats = Array.from({ length: 5 }, (_, i) => seat(code2, key2, RELAY_PORTS[0], `c${i + 1}`))
  await Promise.all(seats.map((s) => s.whenReady))
  await Promise.all(seats.map((s, i) => settled(s, `c${i + 1}`)))
  seats.forEach((s, i) => {
    for (let m = 0; m < 5; m++) s.wind({ kind: 'message', body: `converged seat ${i + 1} message ${m + 1}`, data: { seat: `c${i + 1}` } })
  })
  const updates = seats.map((s) => Y.encodeStateAsUpdate(s.doc))
  seats.forEach((s, i) => updates.forEach((u, j) => i !== j && Y.applyUpdate(s.doc, u))) // what live sync would have done
  for (const s of seats) {
    await s.leave()
    await sleep(30)
  }
  const joiner = await coldJoin(code2, key2, RELAY_PORTS[0], 'cold-c6')
  findings.push(`R4: converged seats — cold joiner sees ${joiner.entries.length}/25 (every deposit is the union; eviction loses nothing)`)
  await joiner.leave()
}

console.log('\n== ring verdicts (stock knobs) ==')
for (const f of findings) console.log('  ' + f)

for (const r of relays) r.kill('SIGKILL')
process.exit(0)
