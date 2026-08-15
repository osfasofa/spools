// T-110 spike, part 3: the pocket ring at group cardinality.
//
// Five concurrent seats deposit against a real spools-relay with stock knobs
// (POCKET_K=4); a cold sixth origin opens from the pocket alone and we diff
// its entry set against the union written. Then the brief's mitigation claim
// ("the first merger re-deposits the union") gets checked, not assumed:
// does a *surviving* seat's return heal the ring? does the *evicted* seat's?
//
// Seats run with a dead WebSocket polyfill: the pocket (HTTP) is reachable
// but live sync never happens — the partition shape that produces disjoint
// worldviews (the dangerous case; the converged case is scenario R4).
// Deposits ride the real client path: wind → leave() → PocketClient flush.
//
// Run (repo root): mise x -- node scratch/spike-room/ring.mjs

import { spawn } from 'node:child_process'
import * as Y from '../../packages/spools/node_modules/yjs/dist/yjs.mjs'
import { Spool, SpoolEngine } from '../../packages/spools/dist/index.js'

const RELAY_PORTS = [9451, 9452] // scenario groups get their own relay so the 12 PUTs/min/IP budget never trips
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

const relays = await Promise.all(RELAY_PORTS.map(startRelay))
const findings = []

// ---------- R1: five partitioned seats deposit; a cold sixth collects ----------

const code = 'ring-partitioned'
const key = randomBytes(32)
const savedStates = {}
{
  const seats = Array.from({ length: 5 }, (_, i) => seat(code, key, RELAY_PORTS[0], `s${i + 1}`))
  await Promise.all(seats.map((s) => s.whenReady))
  await Promise.all(seats.map((s, i) => settled(s, `s${i + 1}`))) // all see the pocket empty before anyone writes
  seats.forEach((s, i) => {
    for (let m = 0; m < 5; m++) s.wind({ kind: 'message', body: `hello from seat ${i + 1}, message ${m + 1}`, data: { seat: `s${i + 1}` } })
  })
  for (const [i, s] of seats.entries()) {
    savedStates[i + 1] = Y.encodeStateAsUpdate(s.doc)
    await s.leave() // flushes the deposit — the real client path
    await sleep(30) // distinct ms timestamps → deterministic stalest-tag eviction (s1 first)
  }
  const held = await pocketGet(RELAY_PORTS[0], code, key)
  const sizes = held.deposits.map((d) => Math.round((d.blob.length * 3) / 4))
  findings.push(`R1: 5 seats deposited 5 msgs each; relay holds ${held.deposits.length} deposits (K=4), ~${sizes.join('/')} B sealed`)

  const joiner = seat(code, key, RELAY_PORTS[0], 'cold-6')
  await joiner.whenReady
  const phase = await settled(joiner, 'cold-6')
  const counts = seatCounts(joiner)
  const missing = ['s1', 's2', 's3', 's4', 's5'].filter((s) => !counts.has(s))
  findings.push(`R1: cold joiner phase=${phase}, sees ${joiner.entries.length}/25 entries; missing worldviews: ${missing.join(',') || 'none'}`)
  await sleep(400)
  const after = await pocketGet(RELAY_PORTS[0], code, key)
  findings.push(`R1: joiner re-deposited union? ${after.deposits.length === held.deposits.length && after.deposits[0].at === held.deposits[0].at ? 'NO (not ahead — nothing local beyond the pocket)' : 'YES'}`)
  await joiner.leave()
}

// ---------- R2: a SURVIVING seat returns — does the union get re-deposited? ----------

{
  const before = await pocketGet(RELAY_PORTS[0], code, key)
  const s3b = seat(code, key, RELAY_PORTS[0], 's3-return')
  Y.applyUpdate(s3b.doc, savedStates[3]) // its local keepsake state, applied before the fetch settles
  await s3b.whenReady
  await settled(s3b, 's3-return')
  await sleep(400)
  const after = await pocketGet(RELAY_PORTS[0], code, key)
  const redeposited = after.deposits[0].at !== before.deposits[0].at
  findings.push(`R2: surviving seat s3 returned holding ${s3b.entries.length}/25 after merge; re-deposited? ${redeposited ? 'YES' : 'NO (its own state is already in the pocket → not ahead → s1 stays lost)'}`)
  await s3b.leave()
}

// ---------- R3: the EVICTED seat returns — the only holder of the lost worldview ----------

{
  const s1b = seat(code, key, RELAY_PORTS[0], 's1-return')
  Y.applyUpdate(s1b.doc, savedStates[1])
  await s1b.whenReady
  await settled(s1b, 's1-return')
  await sleep(500) // deposit-if-ahead fires inside start(); give the PUT time
  findings.push(`R3: evicted seat s1 returned holding ${s1b.entries.length}/25 after merge`)
  await s1b.leave()

  const j7 = seat(code, key, RELAY_PORTS[0], 'cold-7')
  await j7.whenReady
  await settled(j7, 'cold-7')
  const counts = seatCounts(j7)
  const missing = ['s1', 's2', 's3', 's4', 's5'].filter((s) => !counts.has(s))
  findings.push(`R3: next cold joiner sees ${j7.entries.length}/25; missing: ${missing.join(',') || 'none'} (evicted writer's return heals the ring)`)
  await j7.leave()
}

// ---------- R4: five CONVERGED seats (the live-room case) — eviction is harmless ----------

{
  const code2 = 'ring-converged'
  const key2 = randomBytes(32)
  const seats = Array.from({ length: 5 }, (_, i) => seat(code2, key2, RELAY_PORTS[1], `c${i + 1}`))
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
  const held = await pocketGet(RELAY_PORTS[1], code2, key2)
  const joiner = seat(code2, key2, RELAY_PORTS[1], 'cold-c6')
  await joiner.whenReady
  await settled(joiner, 'cold-c6')
  findings.push(`R4: converged seats — relay holds ${held.deposits.length} deposits, cold joiner sees ${joiner.entries.length}/25 (every deposit is the union; K=4 eviction loses nothing)`)
  await joiner.leave()
}

console.log('\n== ring verdicts ==')
for (const f of findings) console.log('  ' + f)

for (const r of relays) r.kill('SIGKILL')
process.exit(0)
