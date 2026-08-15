// T-110 spike, parts 1+2: the chat-hour budget.
//
//  1. Doc growth: wind N realistic chat messages into a memory-mode spool;
//     measure Y.encodeStateAsUpdate bytes and history moments at
//     100 / 500 / 2 000 / 10 000 messages; derive the 8 MiB crossing.
//  2. The D4 number: 100 read-cursor body-rewrites with no other activity;
//     diff doc bytes + moment count before/after — the real permanent cost
//     of one cursor advance (text tombstones + the history moment each
//     local content transaction schedules, history.ts:174-184).
//
// Timing is accelerated via the test-only tuning knobs (Spool's constructor);
// the *ratios* are stock: with minGap 10 s a sustained chat logs at most one
// moment per 10 s, and any message ≥ ~12 s after the last gets its own
// moment — so we log one moment per 5 messages (the 30 msg/min shape) in the
// realistic run, and one moment per rewrite in the cursor run (the floor the
// brief's "throttle ≥ history min-gap" rule imposes).
//
// Run (repo root): mise x -- node scratch/spike-room/budget.mjs

import * as Y from '../../packages/spools/node_modules/yjs/dist/yjs.mjs'
import { Spool, SpoolEngine } from '../../packages/spools/dist/index.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const kb = (n) => `${(n / 1024).toFixed(1)} KB`
const mib = (n) => `${(n / 1024 / 1024).toFixed(2)} MiB`

/** memory-mode, offline, no key — pure doc mechanics */
const memSpool = (author, historyTuning) => {
  const engine = new SpoolEngine({ code: 'spike-room-budget', relay: '', persist: false })
  return new Spool(engine, '', undefined, author, historyTuning)
}

// ---------- realistic chat entries (mirrors the brief's §6 wind shapes) ----------

const BODIES = [
  'ok but have you actually listened to the b-side',
  'lol no',
  'we should do this again next weekend, same place?',
  'I am five minutes away, order me whatever you are having',
  'that is the worst take I have ever heard and I respect it',
  'wait, scroll up, who said that',
  'can someone resend the address',
  'this is why we cannot have nice things 😂',
]
const EMOJI = ['👍', '😂', '❤️', '🔥', '😮']
const SEATS = Array.from({ length: 6 }, (_, i) => `seat-${i}-${crypto.randomUUID().slice(0, 8)}`)

let wound = 0
const lastIds = []
/** 80% message, 10% reply, 10% reaction — deterministic mix, realistic shapes */
const windOne = (spool) => {
  const seat = SEATS[wound % SEATS.length]
  const roll = wound % 10
  let e
  if (roll === 7 && lastIds.length > 3) {
    e = spool.wind({ kind: 'message', body: BODIES[wound % BODIES.length], data: { seat }, parent: lastIds[lastIds.length - 3] })
  } else if (roll === 9 && lastIds.length > 1) {
    e = spool.wind({ kind: 'reaction', body: EMOJI[wound % EMOJI.length], parent: lastIds[lastIds.length - 2], data: { seat } })
  } else {
    e = spool.wind({ kind: 'message', body: BODIES[wound % BODIES.length], data: { seat } })
  }
  lastIds.push(e.id)
  if (lastIds.length > 10) lastIds.shift()
  wound++
  return e
}

const CHECKPOINTS = [100, 500, 2000, 10000]
const docBytes = (spool) => Y.encodeStateAsUpdate(spool.doc).byteLength
const snapBytes = (spool) => Y.encodeSnapshot(Y.snapshot(spool.doc)).byteLength

// ---------- run A: messages only, history silenced ----------

{
  const spool = memSpool('budget-a', { debounceMs: 1e9 })
  await spool.whenReady
  await sleep(5)
  if (!(spool.doc instanceof Y.Doc)) throw new Error('yjs module mismatch — fix the deep import')
  console.log('run A — messages only (no history moments)')
  console.log('| messages | doc bytes | per msg (marginal) | snapshot (one moment) would be |')
  console.log('|---|---|---|---|')
  let prev = { n: 0, bytes: docBytes(spool) }
  globalThis.runA = {}
  for (const target of CHECKPOINTS) {
    while (wound < target) windOne(spool)
    const bytes = docBytes(spool)
    const per = (bytes - prev.bytes) / (target - prev.n)
    console.log(`| ${target} | ${kb(bytes)} | ${per.toFixed(0)} B | ${snapBytes(spool)} B |`)
    globalThis.runA[target] = bytes
    prev = { n: target, bytes }
  }
}

// ---------- run B: same messages + moments at the stock cadence shape ----------

{
  wound = 0
  lastIds.length = 0
  const spool = memSpool('budget-b', { debounceMs: 1, minGapMs: 0 })
  await spool.whenReady
  await sleep(5)
  console.log('\nrun B — messages + one history moment per 5 messages (30 msg/min shape)')
  console.log('| messages | doc bytes | moments | history overhead vs run A | per moment (in-doc) |')
  console.log('|---|---|---|---|---|')
  globalThis.runB = {}
  for (const target of CHECKPOINTS) {
    while (wound < target) {
      for (let i = 0; i < 5 && wound < target; i++) windOne(spool)
      await sleep(6) // let the 1 ms debounce land one moment for the batch
    }
    await sleep(10)
    const bytes = docBytes(spool)
    const moments = spool.history.length
    const overhead = bytes - globalThis.runA[target]
    console.log(`| ${target} | ${kb(bytes)} | ${moments} | ${kb(overhead)} | ${(overhead / moments).toFixed(0)} B |`)
    globalThis.runB[target] = { bytes, moments }
  }
}

// ---------- run C: the D4 number — 100 cursor rewrites, nothing else ----------

const cursorRun = async (label, historyTuning) => {
  wound = 0
  lastIds.length = 0
  const spool = memSpool(label, historyTuning)
  await spool.whenReady
  await sleep(5)
  // realistic base: 300 entries so the cursor edits a real doc, not a toy
  while (wound < 300) {
    for (let i = 0; i < 5; i++) windOne(spool)
    await sleep(historyTuning.debounceMs === 1 ? 6 : 0)
  }
  await sleep(12)
  const cursor = spool.wind({ kind: 'room:read', body: lastIds[lastIds.length - 1], data: { seat: SEATS[0] } })
  await sleep(12)
  const before = { bytes: docBytes(spool), moments: spool.history.length, snap: snapBytes(spool) }
  const snaps = [before.snap]
  for (let i = 1; i <= 100; i++) {
    cursor.body = crypto.randomUUID() // advance: body = last-read entry id
    if (historyTuning.debounceMs === 1) await sleep(6) // worst case: every advance = its own moment
    if (i % 25 === 0) snaps.push(snapBytes(spool))
  }
  await sleep(12)
  const after = { bytes: docBytes(spool), moments: spool.history.length, snap: snapBytes(spool) }
  return { before, after, snaps }
}

{
  const noHist = await cursorRun('cursor-nohist', { debounceMs: 1e9 })
  const withHist = await cursorRun('cursor-hist', { debounceMs: 1, minGapMs: 0 })
  console.log('\nrun C — 100 cursor body-rewrites (base: 300 entries, one room:read entry)')
  const per = (r) => ((r.after.bytes - r.before.bytes) / 100).toFixed(1)
  console.log(`  text-rewrite alone (history silenced): +${noHist.after.bytes - noHist.before.bytes} B total → ${per(noHist)} B/advance, moments +${noHist.after.moments - noHist.before.moments}`)
  console.log(`  with a moment per advance (throttle floor): +${withHist.after.bytes - withHist.before.bytes} B total → ${per(withHist)} B/advance, moments +${withHist.after.moments - withHist.before.moments}`)
  console.log(`  snapshot size along the way (every 25 rewrites): ${withHist.snaps.join(' → ')} B (delete-set growth check)`)
}

// ---------- run D: does the cursor cost stay flat? 1 000 advances ----------
// Every body rewrite adds delete-set ranges that EVERY future moment carries
// (a snapshot is sv + ds). Run C saw ~3 B/rewrite of ds growth — check it is
// linear and price the late-life moment.

{
  wound = 0
  lastIds.length = 0
  const spool = memSpool('cursor-long', { debounceMs: 1, minGapMs: 0 })
  await spool.whenReady
  await sleep(5)
  while (wound < 300) {
    for (let i = 0; i < 5; i++) windOne(spool)
    await sleep(6)
  }
  await sleep(12)
  const cursor = spool.wind({ kind: 'room:read', body: lastIds[lastIds.length - 1], data: { seat: SEATS[0] } })
  await sleep(12)
  const b0 = docBytes(spool)
  const rows = []
  for (let i = 1; i <= 1000; i++) {
    cursor.body = crypto.randomUUID()
    await sleep(6)
    if (i % 250 === 0) rows.push({ i, bytes: docBytes(spool), snap: snapBytes(spool) })
  }
  console.log('\nrun D — 1 000 cursor advances (moment each): is the cost flat?')
  console.log('| advances | doc bytes added | avg B/advance | snapshot now |')
  console.log('|---|---|---|---|')
  let prev = { i: 0, bytes: b0 }
  for (const r of rows) {
    console.log(`| ${r.i} | ${kb(r.bytes - b0)} | ${((r.bytes - prev.bytes) / (r.i - prev.i)).toFixed(0)} B (marginal) | ${r.snap} B |`)
    prev = r
  }
}

// ---------- run E: the un-priced third option — append-only cursor entries ----------
// Instead of rewriting one room:read body (D4), wind a FRESH room:read entry
// per advance, newest-wins per seat like room:name. No deletes → no ds growth
// → moments should stay flat and the cost linear. Same 1 000 advances.

{
  wound = 0
  lastIds.length = 0
  const spool = memSpool('cursor-append', { debounceMs: 1, minGapMs: 0 })
  await spool.whenReady
  await sleep(5)
  while (wound < 300) {
    for (let i = 0; i < 5; i++) windOne(spool)
    await sleep(6)
  }
  await sleep(12)
  const b0 = docBytes(spool)
  const rows = []
  for (let i = 1; i <= 1000; i++) {
    spool.wind({ kind: 'room:read', body: crypto.randomUUID(), data: { seat: SEATS[0] } })
    await sleep(6)
    if (i % 250 === 0) rows.push({ i, bytes: docBytes(spool), snap: snapBytes(spool) })
  }
  console.log('\nrun E — 1 000 advances as append-only room:read entries (newest-wins)')
  console.log('| advances | doc bytes added | avg B/advance | snapshot now |')
  console.log('|---|---|---|---|')
  let prev = { i: 0, bytes: b0 }
  for (const r of rows) {
    console.log(`| ${r.i} | ${kb(r.bytes - b0)} | ${((r.bytes - prev.bytes) / (r.i - prev.i)).toFixed(0)} B (marginal) | ${r.snap} B |`)
    prev = r
  }
}

// ---------- the budget, derived ----------

{
  const a10k = globalThis.runA[10000]
  const a2k = globalThis.runA[2000]
  const perMsg = (a10k - a2k) / 8000
  const b = globalThis.runB
  const perMoment = ((b[10000].bytes - b[2000].bytes) - (a10k - a2k)) / (b[10000].moments - b[2000].moments)
  const CAP = 8 * 1024 * 1024
  console.log('\nderived budget (stock knobs: history minGap 10 s → ≤360 moments/hr; pocket minGap 60 s → ≤60 whole-doc PUTs/hr/device)')
  console.log(`  per message: ~${perMsg.toFixed(0)} B   per moment in-doc: ~${perMoment.toFixed(0)} B`)
  console.log(`  8 MiB crossing, messages alone: ~${Math.round(CAP / perMsg)} messages`)
  console.log('| cadence | growth/active-hr | active hrs to 8 MiB |')
  console.log('|---|---|---|')
  for (const perHr of [60, 240, 600]) {
    const momentsHr = Math.min(360, perHr)
    const growth = perHr * perMsg + momentsHr * perMoment
    console.log(`| ${perHr} msg/hr | ${kb(growth)} | ${(CAP / growth).toFixed(0)} h |`)
  }
  console.log(`  deposit size ≈ doc bytes + 47 B envelope; at 10 000 messages a deposit is ${mib(b[10000].bytes)} and each active device uploads it up to 60×/hr`)
}

process.exit(0)
