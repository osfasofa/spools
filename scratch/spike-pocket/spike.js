// T-100: pocket feasibility spike. Runs S1–S6 from the ticket against the
// sketch in docs/M10-async-brief.md §6, driving the REAL published SDK on
// both sides of the loop wherever a scenario allows it.
//
// Run: pnpm install --ignore-workspace && node spike.js   (Node 24)
import 'fake-indexeddb/auto' // must precede spools: engine checks indexedDB at module load
import { newSpool, openSpool, importSpool } from 'spools'
import { spawn } from 'node:child_process'
import nacl from 'tweetnacl'
import { startPocketRelay } from './pocket-relay.js'
import {
  seal, unseal, deriveToken, randomTag, linkKey, exportUpdate, wrapAsExport,
  unionEntries, sleep, waitFor, put, get, isPocketResponse, record, printTable, results,
} from './util.js'
import * as Y from 'yjs'

const assert = (cond, msg) => { if (!cond) throw new Error(`assert: ${msg}`) }

// ---------- S1: the midnight loop, headless, real SDK both sides ----------
const s1 = async () => {
  const relay = await startPocketRelay({ port: 5401 })
  try {
    const a = await newSpool({ relay: 'ws://localhost:5401/yjs', persist: false, author: 'a' })
    const link = a.share()
    const key = linkKey(link)
    const token = deriveToken(key)
    for (let i = 1; i <= 8; i++) a.wind({ kind: 'track', body: `Track ${i}` })
    await sleep(2400) // let the history debounce stamp a moment, like a real session would
    const blob = seal(exportUpdate(a), key, randomTag())
    const putRes = await put('http://localhost:5401', a.code, token, blob)
    assert(putRes.status === 200 && putRes.json.stored === true, 'deposit stored')
    await a.leave() // A is now fully offline; the room is empty

    const got = await get('http://localhost:5401', a.code, token)
    assert(isPocketResponse(got.json) && got.json.deposits.length === 1, 'one deposit waiting')
    const plain = unseal(Buffer.from(got.json.deposits[0].blob, 'base64'), key)
    assert(plain, 'deposit decrypts')
    const b = await importSpool(wrapAsExport(a.code, plain), {
      relay: 'ws://localhost:5401/yjs', key, persist: false, author: 'b',
    })
    await waitFor(() => b.entries.length === 8, 3000, 'B sees all 8 tracks')
    assert(b.entries.every((e) => e.body.startsWith('Track ')), 'bodies intact')
    assert(b.history.length >= 1, "A's rewind moment came along")
    await b.leave()
    record('S1', 'Midnight loop (writer gone, cold reader)', true,
      `B renders all 8 tracks + ${b.history.length} rewind moment(s) from the pocket alone; room was empty`)
  } finally { await relay.close() }
}

// ---------- S2: cold open with real (fake-)IndexedDB persistence ----------
const s2 = async () => {
  const relay = await startPocketRelay({ port: 5402 })
  try {
    const a = await newSpool({ relay: 'ws://localhost:5402/yjs', persist: false, author: 'a' })
    const link = a.share()
    const key = linkKey(link)
    const token = deriveToken(key)
    for (let i = 1; i <= 5; i++) a.wind({ kind: 'note', body: `Note ${i}` })
    await sleep(2400)
    await put('http://localhost:5402', a.code, token, seal(exportUpdate(a), key, randomTag()))
    await a.leave()

    // first open on the "new device": fetch pocket, apply, PERSIST (sealed at rest)
    const got = await get('http://localhost:5402', a.code, token)
    const plain = unseal(Buffer.from(got.json.deposits[0].blob, 'base64'), key)
    const b1 = await importSpool(wrapAsExport(a.code, plain), { key, persist: true, author: 'b' })
    await waitFor(() => b1.entries.length === 5, 3000, 'first open sees 5')
    await b1.leave()

    // reopen from storage: the room is EMPTY, so anything rendered came from IndexedDB
    const b2 = await openSpool(link, { persist: true })
    assert(b2.entries.length === 5, 'reopen from sealed storage shows 5')
    await b2.leave()
    record('S2', 'Cold open persists (fake-indexeddb)', true,
      'pocket-applied state survives close/reopen via encrypted IndexedDB; empty room = storage-only by construction')
  } finally { await relay.close() }
}

// ---------- S3: divergence — K=1, unpartitioned control, per-tag ring ----------
const s3 = async () => {
  // two writers who have never met: same code+key, no transport at all
  const a = await newSpool({ relay: '', persist: false, author: 'a' })
  const key = linkKey(a.share())
  const token = deriveToken(key)
  const b = await importSpool(wrapAsExport(a.code, exportUpdate(a)), { key, persist: false, author: 'b' })
  for (const t of ['A-1', 'A-2']) a.wind({ kind: 'track', body: t })
  for (const t of ['B-1', 'B-2', 'B-3']) b.wind({ kind: 'track', body: t })
  await sleep(2400)
  const updA = exportUpdate(a)
  const updB = exportUpdate(b)
  const tagA = randomTag()
  const tagB = randomTag()
  const unionOf = (deposits) =>
    unionEntries(deposits.map((d) => unseal(Buffer.from(d.blob, 'base64'), key)).filter(Boolean))

  // S3a — K=1: whoever deposited last wins; the other worldview is gone
  {
    const relay = await startPocketRelay({ port: 5403, K: 1 })
    await put('http://localhost:5403', a.code, token, seal(updA, key, tagA))
    await put('http://localhost:5403', a.code, token, seal(updB, key, tagB))
    const u = unionOf((await get('http://localhost:5403', a.code, token)).json.deposits)
    const lostA = !u.some((e) => e.body.startsWith('A-'))
    record('S3a', 'K=1 divergence', lostA && u.length === 3,
      `predicted failure confirmed: only B's 3 entries survive; A's worldview evicted`)
    await relay.close()
  }
  // S3b — unpartitioned last-K ring (the reviewer's sequence): solo writer flushes the peer
  {
    const relay = await startPocketRelay({ port: 5404, K: 4, partitioned: false })
    await put('http://localhost:5404', a.code, token, seal(updA, key, tagA))
    await put('http://localhost:5404', a.code, token, seal(updB, key, tagB))
    for (let i = 0; i < 4; i++) await put('http://localhost:5404', a.code, token, seal(updA, key, tagA))
    const u = unionOf((await get('http://localhost:5404', a.code, token)).json.deposits)
    const lostB = !u.some((e) => e.body.startsWith('B-'))
    record('S3b', 'Unpartitioned ring, K solo re-deposits', lostB,
      `review finding 3 confirmed: 4 solo deposits from A flush B's only worldview out of a last-4 ring`)
    await relay.close()
  }
  // S3c/S3d — the per-tag ring under the same attack, then self-collapse
  {
    const relay = await startPocketRelay({ port: 5407, K: 4 })
    await put('http://localhost:5407', a.code, token, seal(updA, key, tagA))
    await put('http://localhost:5407', a.code, token, seal(updB, key, tagB))
    for (let i = 0; i < 4; i++) await put('http://localhost:5407', a.code, token, seal(updA, key, tagA))
    const got = await get('http://localhost:5407', a.code, token)
    const u = unionOf(got.json.deposits)
    record('S3c', 'Per-tag ring, same sequence', got.json.deposits.length === 2 && u.length === 5,
      `2 deposits (newest per tag), union holds all 5 entries — solo re-deposits only replace A's own slot`)

    // C merges and re-deposits: the newest single deposit now carries the union
    const merged = new Y.Doc({ gc: false })
    for (const d of got.json.deposits) Y.applyUpdate(merged, unseal(Buffer.from(d.blob, 'base64'), key))
    const updC = Y.encodeStateAsUpdate(merged)
    merged.destroy()
    await put('http://localhost:5407', a.code, token, seal(updC, key, randomTag()))
    const after = await get('http://localhost:5407', a.code, token)
    const newestAlone = unionOf([after.json.deposits[0]])
    record('S3d', 'Self-collapse after merge', newestAlone.length === 5,
      'the merger’s single newest deposit contains the whole union; older tags become redundant and age out')
    await relay.close()
  }
  await a.leave()
  await b.leave()
}

// ---------- S4: namespace fencing + drop-and-count ----------
const s4 = async () => {
  const relay = await startPocketRelay({ port: 5408 })
  try {
    const a = await newSpool({ relay: '', persist: false, author: 'a' })
    const key = linkKey(a.share())
    const token = deriveToken(key)
    a.wind({ kind: 'track', body: 'Real' })
    await sleep(200)
    await put('http://localhost:5408', a.code, token, seal(exportUpdate(a), key, randomTag()))

    // a code-only attacker guesses namespaces: valid envelopes, wrong token
    const wrongToken = deriveToken(nacl.randomBytes(32))
    for (let i = 0; i < 6; i++) {
      await put('http://localhost:5408', a.code, wrongToken, seal(nacl.randomBytes(64), nacl.randomBytes(32), randomTag()))
    }
    const mine = await get('http://localhost:5408', a.code, token)
    record('S4a', 'Cross-namespace garbage', mine.json.deposits.length === 1,
      'six garbage deposits under a guessed token never touch the ring readers actually derive')

    // a key-holder gone weird: right namespace, undecryptable ciphertext
    const badCt = Buffer.concat([Buffer.from([0xe2, 0xe3, 1]), Buffer.from(randomTag()), Buffer.from(nacl.randomBytes(24)), Buffer.from(nacl.randomBytes(80))])
    await put('http://localhost:5408', a.code, token, badCt)
    const got = await get('http://localhost:5408', a.code, token)
    const plains = got.json.deposits.map((d) => unseal(Buffer.from(d.blob, 'base64'), key))
    const dropped = plains.filter((p) => p === null).length
    const u = unionEntries(plains.filter(Boolean))
    record('S4b', 'In-namespace garbage drop-and-count', got.json.deposits.length === 2 && dropped === 1 && u.length === 1,
      `relay stores what it cannot verify (by design); reader drops 1, counts it, doc untouched`)
    await a.leave()
  } finally { await relay.close() }
}

// ---------- S5: the old-relay 200-trap ----------
const s5 = async () => {
  const child = spawn(process.execPath, ['old-relay.js'], {
    cwd: new URL('.', import.meta.url).pathname, env: { ...process.env, PORT: '5405' }, stdio: 'ignore',
  })
  try {
    await waitFor(async () => {
      try { return (await fetch('http://localhost:5405/')).status === 200 } catch { return false }
    }, 5000, 'old relay up')

    const health = await (await fetch('http://localhost:5405/')).json()
    const probeSaysNo = health.pocket === undefined
    const g = await get('http://localhost:5405', 'some-room-123', 'sometokenABCDEF00')
    const trapCaught = g.status === 200 && !isPocketResponse(g.json)
    const p = await fetch('http://localhost:5405/pocket/some-room-123/sometokenABCDEF00', { method: 'PUT', body: Buffer.from([0xe2, 0xe3, 1]) })
    const pJson = await p.json()
    const putTrapCaught = p.status === 200 && pJson.stored !== true && !isPocketResponse(pJson)
    record('S5', 'Old-relay 200-trap', probeSaysNo && trapCaught && putTrapCaught,
      'old relay 200s every GET/PUT with health JSON; envelope + health-block rules read it as NO capability, never “empty”')

    // (positive probe control runs implicitly all spike: startPocketRelay health carries the pocket block)
  } finally { child.kill() }
}

// ---------- S6: frame-log noise, measured at honest defaults ----------
const s6 = async () => {
  const relay = await startPocketRelay({ port: 5406 })
  try {
    const a = await newSpool({ relay: 'ws://localhost:5406/yjs', persist: false, author: 'a' })
    for (let i = 1; i <= 3; i++) a.wind({ kind: 'track', body: `Track ${i}` })
    await sleep(2500) // initial sync burst + history moment settle
    const contentBytes = exportUpdate(a).length
    relay.resetFrameLog(a.code)
    const WINDOW_MS = 70_000 // covers 3× the 20 s resync + ~2 of the provider's ~30 s alone-in-room reconnect cycles
    await sleep(WINDOW_MS)
    const log = relay.frameLog(a.code)
    const frames = log.length
    const bytes = log.reduce((n, f) => n + f.bytes, 0)
    const perHour = (n) => Math.round((n * 3_600_000) / WINDOW_MS)
    await a.leave()
    record('S6', 'Frame-log noise (idle keyed client, stock 20 s resync)', frames > 0,
      `${frames} frames / ${bytes} B in ${WINDOW_MS / 1000} s idle ⇒ ~${perHour(frames)} frames ≈ ${(perHour(bytes) / 1024).toFixed(1)} KiB per idle hour vs ${contentBytes} B of actual content — a frame log records ~${(perHour(bytes) / contentBytes).toFixed(1)}× the doc per hour of nothing`)
    console.log(`    [S6 detail] window=${WINDOW_MS}ms frames=${frames} bytes=${bytes} contentBytes=${contentBytes} → per hour: ${perHour(frames)} frames, ${perHour(bytes)} bytes (arithmetic floor: 180 resync SyncStep1s/hr at the 20 s default)`)
  } finally { await relay.close() }
}

// ---------- run ----------
const scenarios = [s1, s2, s3, s4, s5, s6]
for (const s of scenarios) {
  try {
    await s()
  } catch (err) {
    record(s.name.toUpperCase(), '(scenario crashed)', false, err.message)
  }
}
printTable()
const failed = results.filter((r) => r.result === 'FAIL').length
console.log(failed === 0 ? '\nVERDICT: (a) sketch works as drafted — see table' : `\n${failed} FAILURES — see table`)
process.exit(failed === 0 ? 0 : 1)
