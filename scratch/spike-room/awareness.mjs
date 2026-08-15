// T-111 spike: awareness at group scale, headless.
//
//  A. 7 seats on one keyed spool see each other's app-defined presence.
//  B. Sealing proof (milestone acceptance #6, done cheaply first): every
//     frame captured at the relay starts with the sealed-transport magic
//     0xE2E1 and no presence string is grep-able in the raw bytes; a keyless
//     control room proves the capture would catch a leak.
//  C. Ghosts: a killed tab (socket dies, no awareness-removal message, no
//     reconnect) vs a clean leave() — how long until peers drop the state?
//  D. Traffic: keystroke-rate typing vs transitions-only, frames/min + sizes
//     → the T-119 debounce recommendation and the typing go/no-go.
//  E. The 64-conn ceiling on the REAL relay: what does #65 actually see?
//
// The capture relay here is a dumb broadcaster — protocol-identical to
// spools-relay's broadcast half (the relay never parses frames; clients sync
// peer-to-peer through it, proven in T-003) — except it records every frame.
// The ghost victim connects through its own port into the same rooms so
// "kill" = stop that listener: the socket drops, reconnects are refused, and
// no awareness removal is ever sent — a faithful killed tab.
//
// Run (repo root): mise x -- node scratch/spike-room/awareness.mjs

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { SpoolEngine } from '../../packages/spools/dist/index.js'

const require = createRequire(new URL('../../packages/spools-relay/', import.meta.url))
const { WebSocketServer } = require('ws')

const CAP_PORT = 9461
const VICTIM_PORT = 9462
const REAL_PORT = 9463
const here = new URL('.', import.meta.url)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const key = crypto.getRandomValues(new Uint8Array(32))

// ---------- capture relay: dumb broadcast + frame log ----------

const rooms = new Map() // room path -> Set<conn>
const frames = [] // { room, connId, bytes, at }
const connOrder = new Map() // room path -> [connId,...] in connect order
let nextConn = 1
const attach = (wss) => {
  wss.on('connection', (conn, req) => {
    const room = req.url
    const id = nextConn++
    if (!rooms.has(room)) rooms.set(room, new Set())
    if (!connOrder.has(room)) connOrder.set(room, [])
    connOrder.get(room).push(id)
    const members = rooms.get(room)
    members.add(conn)
    conn.on('message', (data, isBinary) => {
      frames.push({ room, connId: id, bytes: Buffer.from(data), at: Date.now() })
      for (const peer of members) if (peer !== conn && peer.readyState === 1) peer.send(data, { binary: isBinary })
    })
    conn.on('close', () => members.delete(conn))
  })
}
const capWss = new WebSocketServer({ port: CAP_PORT })
let victimWss = new WebSocketServer({ port: VICTIM_PORT })
attach(capWss)
attach(victimWss)

const seat = (code, port, opts = {}) =>
  new SpoolEngine({
    code,
    relay: `ws://127.0.0.1:${port}/yjs`,
    persist: false,
    webrtc: false,
    disableBc: true, // Node has BroadcastChannel — presence must ride the wire, not same-process shortcuts
    key,
    ...opts,
  })

const connected = async (engine, label) => {
  for (let i = 0; i < 100; i++) {
    if (engine.status === 'connected') return
    await sleep(50)
  }
  throw new Error(`${label} never connected`)
}

/** peers (clientIDs ≠ own) whose state carries our app field */
const peersSeen = (engine) => {
  const out = []
  for (const [clientID, state] of engine.awareness.getStates()) {
    if (clientID !== engine.doc.clientID && state?.room) out.push(clientID)
  }
  return out
}

const findings = []

// ---------- A. seven seats, everyone sees everyone ----------

const CODE = 'aware-group'
const seats = []
{
  const t0 = Date.now()
  for (let i = 0; i < 7; i++) {
    const s = seat(CODE, CAP_PORT)
    await connected(s, `seat ${i + 1}`)
    s.awareness.setLocalStateField('room', { seat: `s${i + 1}`, sentinel: `SENTINEL_PRESENCE_S${i + 1}` })
    seats.push(s)
  }
  // a dumb relay stores nothing, so a late joiner learns existing seats only
  // from their next 15 s awareness heartbeat — give convergence a full cycle
  let ok = false
  for (let i = 0; i < 250 && !ok; i++) {
    ok = seats.every((s) => peersSeen(s).length === 6)
    if (!ok) await sleep(100)
  }
  findings.push(`A: 7 seats ${ok ? 'all see all 6 others' : 'FAILED to converge'} in ${((Date.now() - t0) / 1000).toFixed(1)} s from first connect (dumb relay: latecomers wait on the 15 s heartbeat)`)
}

// ---------- B. sealing proof + keyless control ----------

{
  await sleep(500)
  const groupFrames = frames.filter((f) => f.room === `/yjs/${CODE}`)
  const unsealed = groupFrames.filter((f) => !(f.bytes[0] === 0xe2 && f.bytes[1] === 0xe1))
  const blob = Buffer.concat(groupFrames.map((f) => f.bytes))
  const leak = blob.includes('SENTINEL_PRESENCE') || blob.includes('"seat"')
  findings.push(`B: ${groupFrames.length} frames captured at the relay; ${unsealed.length} without the 0xE2E1 magic; presence strings grep-able: ${leak ? 'LEAK' : 'no'}`)

  // control: a keyless room MUST show the sentinel, or the capture proves nothing
  const k1 = seat('aware-plain', CAP_PORT, { key: undefined })
  const k2 = seat('aware-plain', CAP_PORT, { key: undefined })
  await connected(k1, 'plain 1')
  await connected(k2, 'plain 2')
  k1.awareness.setLocalStateField('room', { sentinel: 'SENTINEL_KEYLESS_PLAINTEXT' })
  await sleep(800)
  const plainBlob = Buffer.concat(frames.filter((f) => f.room === '/yjs/aware-plain').map((f) => f.bytes))
  findings.push(`B: keyless control room ${plainBlob.includes('SENTINEL_KEYLESS_PLAINTEXT') ? 'shows the sentinel in plaintext (capture verified)' : 'FAILED — capture is blind, sealing proof void'}`)
  await k1.leave()
  await k2.leave()
}

// ---------- C. ghosts: killed tab vs clean leave ----------

{
  const victim = seat(CODE, VICTIM_PORT)
  await connected(victim, 'victim')
  victim.awareness.setLocalStateField('room', { seat: 'victim', typing: true })
  const victimId = victim.doc.clientID
  const observer = seats[0]
  for (let i = 0; i < 50 && !observer.awareness.getStates().has(victimId); i++) await sleep(100)
  if (!observer.awareness.getStates().has(victimId)) throw new Error('observer never saw the victim')

  // kill: drop the socket AND the listener — no removal message, reconnects refused
  const killedAt = Date.now()
  for (const c of victimWss.clients) c.terminate()
  await new Promise((r) => victimWss.close(r))
  let ghostMs = null
  for (let i = 0; i < 500; i++) {
    if (!observer.awareness.getStates().has(victimId)) {
      ghostMs = Date.now() - killedAt
      break
    }
    await sleep(100)
  }
  findings.push(`C: killed tab's typing state haunted peers for ${ghostMs === null ? '>50 s (NEVER pruned!)' : `${(ghostMs / 1000).toFixed(1)} s`} (awareness timeout is 30 s)`)

  // clean leave(): does the SDK path clear presence instantly, or does it
  // also lean on the 30 s timeout? Measured, not assumed.
  const leaver = seats[6]
  const leaverId = leaver.doc.clientID
  const leftAt = Date.now()
  await leaver.leave()
  let clearMs = null
  for (let i = 0; i < 500; i++) {
    if (!observer.awareness.getStates().has(leaverId)) {
      clearMs = Date.now() - leftAt
      break
    }
    await sleep(50)
  }
  findings.push(`C: clean leave() cleared presence on peers in ${clearMs === null ? '>25 s (NOT clean — relies on timeout)' : `${clearMs} ms`}`)
  seats.pop()
}

// ---------- D. typing traffic: keystroke-rate vs transitions-only ----------

{
  const typer = seats[1]
  const typerConnId = connOrder.get(`/yjs/${CODE}`)[1]
  const countWindow = async (fn, ms) => {
    const t0 = Date.now()
    await fn()
    await sleep(ms - (Date.now() - t0))
    const mine = frames.filter((f) => f.room === `/yjs/${CODE}` && f.connId === typerConnId && f.at >= t0 && f.at < t0 + ms)
    return { count: mine.length, avg: mine.length ? Math.round(mine.reduce((n, f) => n + f.bytes.length, 0) / mine.length) : 0 }
  }

  // naive: one awareness set per keystroke, 5 keys/s for 15 s
  const naive = await countWindow(async () => {
    for (let i = 0; i < 75; i++) {
      typer.awareness.setLocalStateField('room', { seat: 's2', typing: true })
      await sleep(200)
    }
  }, 16_000)
  // transitions-only: true at start, false at end, otherwise silence
  const debounced = await countWindow(async () => {
    typer.awareness.setLocalStateField('room', { seat: 's2', typing: true })
    await sleep(15_000)
    typer.awareness.setLocalStateField('room', { seat: 's2', typing: false })
  }, 16_000)
  // idle baseline: nothing but heartbeats + resync (+ y-websocket re-broadcasting
  // every received awareness update — the O(n²) echo a star topology pays)
  const idleT0 = Date.now()
  const idle = await countWindow(async () => {}, 16_000)
  const roomIdle = frames.filter((f) => f.room === `/yjs/${CODE}` && f.at >= idleT0 && f.at < idleT0 + 16_000)
  const perMin = (w) => Math.round((w.count * 60) / 16)
  findings.push(`D: typing at keystroke rate: ${perMin(naive)} frames/min from one seat (avg ${naive.avg} B); transitions-only: ${perMin(debounced)} frames/min (avg ${debounced.avg} B); idle baseline: ${perMin(idle)} frames/min from one seat, ${Math.round((roomIdle.length * 60) / 16)} frames/min room-wide at ${seats.length} seats (avg ${roomIdle.length ? Math.round(roomIdle.reduce((n, f) => n + f.bytes.length, 0) / roomIdle.length) : 0} B)`)
}

// ---------- E. the 64-conn ceiling, real relay ----------

{
  const relay = await new Promise((resolve) => {
    const proc = spawn(process.execPath, [new URL('../../packages/spools-relay/server.js', here).pathname], {
      stdio: ['ignore', 'pipe', 'inherit'],
      env: { ...process.env, PORT: String(REAL_PORT), HOST: '127.0.0.1' },
    })
    proc.stdout.once('data', () => resolve(proc))
  })
  const raw = []
  for (let i = 0; i < 64; i++) {
    const ws = new WebSocket(`ws://127.0.0.1:${REAL_PORT}/yjs/ceiling-room`)
    raw.push(ws)
  }
  await sleep(1500)
  const open = raw.filter((w) => w.readyState === WebSocket.OPEN).length
  const last = new WebSocket(`ws://127.0.0.1:${REAL_PORT}/yjs/ceiling-room`)
  const closeInfo = await new Promise((resolve) => {
    last.addEventListener('close', (e) => resolve({ code: e.code, reason: e.reason }))
    setTimeout(() => resolve({ code: 0, reason: 'no close within 5 s' }), 5000)
  })
  // and what a real SDK seat experiences at the wall
  const walled = seat('ceiling-room', REAL_PORT, { key: undefined })
  const statuses = []
  walled.onStatus((s) => statuses.push(s))
  await sleep(4000)
  findings.push(`E: 64 raw conns open=${open}; conn #65 closed with code ${closeInfo.code} "${closeInfo.reason}"; an SDK seat at the wall reports status "${walled.status}" (transitions seen: ${statuses.join('→') || 'none'}) and silently retries forever`)
  await walled.leave()
  for (const w of raw) w.close()
  relay.kill('SIGKILL')
}

console.log('\n== awareness verdicts ==')
for (const f of findings) console.log('  ' + f)

for (const s of seats) await s.leave().catch(() => {})
capWss.close()
process.exit(0)
