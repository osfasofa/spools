// Tape-deck riff (docs/riffs/tape-deck.md): direction, reversal, and undo,
// measured on the shipped SDK surface before the riff doc speculates past them.
//
//  1. The fold: one interpreter, two directions, packets that carry both ends.
//     Reading backward costs zero bytes — the tape is untouched.
//  2. The concurrent from-lie: two writers, one field. `from` is the writer's
//     memory, not the room's truth; a commuting delta shrugs it off.
//  3. Checkpoints: absolute state per packet (the chess-brief shape). Backward
//     is a read; a conflict is visible as two packets at one ply.
//  4. Undo mine, not yours: Y.UndoManager over the entries map. What undoing
//     a wind actually does at the entry layer (spoiler: not a soft delete).
//  5. Rollback in place: rewind(ts) diffed against the present, compensating
//     winds. The state comes back, the tape gets longer, and a friend's
//     concurrent edit merges with the rollback.
//  6. Rollback as a fork: Y.createDocFromSnapshot off a rewind moment into a
//     fresh spool — branch-from-a-moment, the spools-of-spools riff's untested
//     item — and reunion with the origin.
//
// Run: node scratch/riff-tape-deck/spike.mjs   (from repo root, after
// `pnpm --filter spools build`; yjs comes from packages/spools node_modules so
// the spike shares the SDK's module instance). Offline, memory-only, with the
// fast history tuning history.test.ts uses, through the exported Spool /
// SpoolEngine escape hatches — the riff is about doc physics, not transports.

import * as Y from '../../packages/spools/node_modules/yjs/dist/yjs.mjs'
import { Spool, SpoolEngine } from '../../packages/spools/dist/index.js'

const bytes = (doc) => Y.encodeStateAsUpdate(doc).byteLength
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let failures = 0
const assert = (cond, label) => {
  if (!cond) {
    console.error(`  ✗ FAIL: ${label}`)
    failures++
    process.exitCode = 1
  } else console.log(`  ✓ ${label}`)
}
const note = (label) => console.log(`  · ${label}`)
const waitUntil = async (pred, ms = 3000) => {
  const t0 = Date.now()
  while (!pred()) {
    if (Date.now() - t0 > ms) return false
    await sleep(5)
  }
  return true
}

const spools = []
// offline, memory-only, near-immediate history moments (the test tuning)
const mk = async (code, author) => {
  const engine = new SpoolEngine({ code, persist: false, disableBc: true, webrtc: false })
  const spool = new Spool(engine, '', undefined, author, { debounceMs: 5, minGapMs: 0 })
  await spool.whenReady
  spools.push(spool)
  return spool
}
// exchange updates both ways. 'remote' origin: an UndoManager never tracks these
const sync = (a, b) => {
  Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc, Y.encodeStateVector(b.doc)), 'remote')
  Y.applyUpdate(a.doc, Y.encodeStateAsUpdate(b.doc, Y.encodeStateVector(a.doc)), 'remote')
}
// wait for the next history moment to land, return its timestamp
const moment = async (spool) => {
  const n = spool.history.length
  if (!(await waitUntil(() => spool.history.length > n))) throw new Error('no moment landed')
  return spool.history[spool.history.length - 1]
}
const bodies = (entries) => entries.map((e) => e.body).sort().join(' | ')

// the interpreter: one fold, a direction knob, packets that carry both ends
const forward = (s, e) => ({ ...s, [e.data.field]: e.data.to })
const backward = (s, e) => ({ ...s, [e.data.field]: e.data.from })
const play = (entries, dir = 'forward', from = {}) =>
  (dir === 'forward' ? entries : [...entries].reverse()).reduce(
    dir === 'forward' ? forward : backward,
    from
  )
const delta = (spool, field, from, to) => spool.wind({ kind: 'delta', data: { field, from, to } })

// ---------- 1. the fold ---------------------------------------------------

console.log('— 1. the fold: one interpreter, two directions —')
{
  const ana = await mk('tape-fold-101', 'ana')
  delta(ana, 'x', 0, 1)
  await sleep(2)
  delta(ana, 'x', 1, 2)
  await sleep(2)
  delta(ana, 'color', 'red', 'blue')
  await sleep(2)
  const b0 = bytes(ana.doc)
  delta(ana, 'x', 2, 5)
  const packetCost = bytes(ana.doc) - b0

  const before = bytes(ana.doc)
  const end = play(ana.entries)
  assert(end.x === 5 && end.color === 'blue', `forward to the end: ${JSON.stringify(end)}`)
  const back1 = play(ana.entries.slice(-1), 'backward', end)
  assert(back1.x === 2 && back1.color === 'blue', `back one step: ${JSON.stringify(back1)}`)
  const back2 = play(ana.entries.slice(-2), 'backward', end)
  assert(back2.x === 2 && back2.color === 'red', `back two steps: ${JSON.stringify(back2)}`)
  const start = play(ana.entries, 'backward', end)
  assert(start.x === 0 && start.color === 'red', `all the way back: ${JSON.stringify(start)}`)
  const again = play(ana.entries, 'forward', start)
  assert(
    JSON.stringify(again) === JSON.stringify(end),
    'palindrome: forward, back, forward lands on the same state'
  )
  assert(
    bytes(ana.doc) === before,
    `reading in either direction costs zero bytes (${before} B before and after)`
  )
  note(`one delta packet costs ${packetCost} B at rest (field + from + to + metadata, no body)`)
}

// ---------- 2. the concurrent from-lie -----------------------------------

console.log('— 2. the concurrent from-lie —')
{
  const ana = await mk('tape-lie-101', 'ana')
  const ben = await mk('tape-lie-101', 'ben')
  delta(ana, 'x', 0, 1)
  sync(ana, ben)
  await sleep(2)
  delta(ana, 'x', 1, 2) // ana: 1 → 2
  await sleep(2)
  delta(ben, 'x', 1, 3) // ben, concurrently, from the same 1: 1 → 3
  sync(ana, ben)

  const seq = (s) => s.entries.map((e) => `${e.author}:${e.data.from}→${e.data.to}`).join(' ')
  assert(seq(ana) === seq(ben), `both peers see one sequence: ${seq(ana)}`)
  const endA = play(ana.entries)
  const endB = play(ben.entries)
  assert(endA.x === 3 && endB.x === 3, `forward converges on both peers: x=${endA.x}`)
  const last = ana.entries[ana.entries.length - 1]
  const stepBack = play([last], 'backward', endA)
  const replayed = play(ana.entries.slice(0, -1))
  assert(
    stepBack.x === 1 && replayed.x === 2,
    `one step back says x=${stepBack.x}; replaying everything but the last says x=${replayed.x} — the from-lie`
  )
  const sets = ana.entries.filter((e) => e.kind === 'delta')
  assert(
    play(sets).x !== play([...sets].reverse()).x,
    `set-packets depend on order: sorted gives x=${play(sets).x}, reversed gives x=${play([...sets].reverse()).x}`
  )

  // the same two people, a commuting delta instead
  const tick = (spool, n) => spool.wind({ kind: 'tick', data: { n } })
  tick(ana, +1)
  await sleep(2)
  tick(ben, +1)
  sync(ana, ben)
  const ticks = ana.entries.filter((e) => e.kind === 'tick')
  const sum = (es) => es.reduce((s, e) => s + e.data.n, 0)
  const unsum = (es, s) => [...es].reverse().reduce((t, e) => t - e.data.n, s)
  assert(
    sum(ticks) === 2 && sum([...ticks].reverse()) === 2,
    'a commuting delta reads the same in any order'
  )
  assert(
    unsum(ticks.slice(-1), 2) === 1 && unsum(ticks, 2) === 0,
    'and its inverse is free: minus one, minus one, back to zero'
  )
}

// ---------- 3. checkpoints --------------------------------------------------

console.log('— 3. checkpoints (the chess-brief shape) —')
{
  const ana = await mk('tape-fen-101', 'ana')
  const ben = await mk('tape-fen-101', 'ben')
  const move = (spool, ply, san, state) => spool.wind({ kind: 'move', data: { ply, san, state } })
  move(ana, 1, 'e4', 'E')
  await sleep(2)
  move(ana, 2, 'e5', 'EE')
  sync(ana, ben)
  await sleep(2)
  move(ana, 3, 'Nf3', 'EEN')
  await sleep(2)
  move(ben, 3, 'Bc4', 'EEB') // both from ply 2, concurrently
  sync(ana, ben)

  const at = (s, ply) => s.entries.filter((e) => e.data.ply === ply).map((e) => e.data.state)
  assert(at(ana, 2).join() === 'EE', 'backward is a read: the ply-2 checkpoint, no inversion')
  assert(
    at(ana, 3).length === 2 && at(ben, 3).length === 2,
    `the conflict is visible on both peers: two packets at ply 3 (${at(ana, 3).join(', ')})`
  )
}

// ---------- 4. undo mine, not yours ---------------------------------------

console.log('— 4. undo mine, not yours (Y.UndoManager over the entries map) —')
{
  const ana = await mk('tape-undo-101', 'ana')
  const ben = await mk('tape-undo-101', 'ben')
  const undo = new Y.UndoManager(ana.doc.getMap('entries'), { captureTimeout: 0 })

  const e1 = ana.wind({ kind: 'note', body: 'hello from ana' })
  const m1 = await moment(ana)
  sync(ana, ben)
  await sleep(2)
  const e2 = ben.wind({ kind: 'note', body: 'hello from ben' })
  sync(ana, ben)
  assert(ana.entries.length === 2, 'both notes on ana before the undo')

  const b0 = bytes(ana.doc)
  undo.undo()
  const b1 = bytes(ana.doc)
  sync(ana, ben)
  const has = (s, e) => s.entries.some((x) => x.id === e.id)
  assert(!has(ana, e1), "undo: ana's note vanishes from spool.entries")
  assert(
    !ana.deleted.some((x) => x.id === e1.id),
    'undo is not a soft delete: the note is not in spool.deleted either — a hard removal at the entry layer'
  )
  assert(
    ana.doc.share.has(`entry:${e1.id}`),
    'undo leaves the body text behind as an orphan root type (entry:<id> still in doc.share)'
  )
  assert(has(ana, e2) && has(ben, e2), "ben's note survives on both peers")
  assert(!has(ben, e1), "after sync, ben's copy loses ana's note too")
  assert(
    ana.rewind(m1).some((s) => s.id === e1.id),
    'memory survives the undo: rewind(m1) still shows the note'
  )
  undo.redo()
  const b2 = bytes(ana.doc)
  const back = ana.entries.find((x) => x.id === e1.id)
  assert(
    back && back.body === 'hello from ana',
    `redo brings the note back, body intact: "${back?.body}"`
  )
  note(`doc bytes: ${b0} before undo, ${b1} after undo, ${b2} after redo — the tape only grows`)

  // a body edit, undone, beside a friend's concurrent edit to the same body
  const e3 = ana.wind({ kind: 'note', body: 'the night the canoe sank' })
  sync(ana, ben)
  const textUndo = new Y.UndoManager(e3.text, { captureTimeout: 0 })
  e3.text.insert(e3.text.length, ' (or so ana thought)')
  const benE3 = ben.entries.find((x) => x.id === e3.id)
  benE3.text.insert(0, 'as ben tells it: ') // concurrent, other end of the body
  textUndo.undo()
  sync(ana, ben)
  assert(
    e3.body === 'as ben tells it: the night the canoe sank' && benE3.body === e3.body,
    `a body undo removes only ana's edit; ben's concurrent insert survives: "${e3.body}"`
  )
}

// ---------- 5. rollback in place --------------------------------------------

console.log('— 5. rollback in place: the state comes back, the tape gets longer —')
let origin, originM1, keepP
{
  const ana = await mk('tape-roll-101', 'ana')
  const ben = await mk('tape-roll-101', 'ben')
  const p = ana.wind({ kind: 'note', body: 'paddle' })
  await sleep(2)
  const q = ana.wind({ kind: 'note', body: 'canoe' })
  const m1 = await moment(ana)
  await sleep(2)
  const r = ana.wind({ kind: 'note', body: 'lake' })
  p.delete()
  q.body = 'canoe, sunk'
  const m2 = await moment(ana)
  sync(ana, ben)
  // ben, meanwhile, edits the entry ana is about to roll back over
  const benR = ben.entries.find((e) => e.id === r.id)
  benR.text.insert(benR.text.length, ' at night')

  // roll ana back to m1, in place: compensating winds from the rewind diff
  const b0 = bytes(ana.doc)
  const then = ana.rewind(m1)
  const thenVisible = new Set(then.filter((s) => s.deletedAt == null).map((s) => s.id))
  for (const e of ana.entries) if (!thenVisible.has(e.id)) e.delete() // newer than the moment
  for (const e of ana.deleted) if (thenVisible.has(e.id)) e.restore() // deleted since
  for (const s of then) {
    const live = [...ana.entries, ...ana.deleted].find((e) => e.id === s.id)
    if (live && live.body !== s.body) live.body = s.body
  }
  const b1 = bytes(ana.doc)
  const wanted = then.filter((s) => s.deletedAt == null).map((s) => s.body).sort().join(' | ')
  assert(
    bodies(ana.entries) === wanted,
    `after the rollback the visible spool reads as it did at m1: ${bodies(ana.entries)}`
  )
  assert(ana.deleted.some((e) => e.id === r.id), 'the newer entry is soft-deleted, not gone')
  assert(b1 > b0, `the tape got longer: ${b0} B before the rollback, ${b1} B after`)
  const m3 = await moment(ana)
  assert(
    ana.rewind(m2).some((s) => s.id === r.id && s.deletedAt == null),
    'rewind(m2) still shows the newer entry alive — the walk left footprints, it erased nothing'
  )
  assert(
    ana.rewind(m3).some((s) => s.id === r.id && s.deletedAt != null),
    'rewind(m3) shows it soft-deleted by the rollback'
  )
  sync(ana, ben)
  const rNow = ana.deleted.find((e) => e.id === r.id)
  assert(
    rNow && rNow.body === 'lake at night',
    `ben's concurrent edit merged into the rolled-back entry: "${rNow?.body}" (tombstone hides, edit survives)`
  )
  assert(bodies(ben.entries) === bodies(ana.entries), 'ben converges on the rolled-back view')
  origin = ana
  originM1 = m1
  keepP = p
}

// ---------- 6. rollback as a fork -------------------------------------------

console.log('— 6. rollback as a fork: branch-from-a-moment —')
{
  const rec = origin.doc.getArray('history').toArray().find((m) => m.ts === originM1)
  const snap = Y.decodeSnapshot(Buffer.from(rec.snap, 'base64'))
  const past = Y.createDocFromSnapshot(origin.doc, snap)
  const fork = await mk('tape-fork-101', 'ana')
  Y.applyUpdate(fork.doc, Y.encodeStateAsUpdate(past), 'remote')
  past.destroy()
  assert(
    bodies(fork.entries) === 'canoe | paddle',
    `the fork holds the moment: ${bodies(fork.entries)} — the newer entry never existed here`
  )
  assert(
    fork.entries.some((e) => e.id === keepP.id),
    'entry identity crosses into the fork (same ids, same items)'
  )
  note(
    `fork carries ${fork.history.length} earlier moment(s); m1's own record lands after its snapshot, so it stays behind`
  )
  note(`fork ${bytes(fork.doc)} B vs origin ${bytes(origin.doc)} B`)
  const forkOnly = fork.wind({ kind: 'note', body: 'fork-only: a different summer' })
  await sleep(2)
  // reunion with the origin: same items, so the origin's whole present comes back
  Y.applyUpdate(fork.doc, Y.encodeStateAsUpdate(origin.doc, Y.encodeStateVector(fork.doc)), 'remote')
  const expected = [...origin.entries.map((e) => e.body), forkOnly.body].sort().join(' | ')
  assert(
    bodies(fork.entries) === expected,
    `reunion resurrects the origin's present beside the fork's own entry: ${bodies(fork.entries)}`
  )
  assert(
    fork.deleted.some((e) => e.body === 'lake at night'),
    "the origin's soft-deletes arrive too — a branch-from-a-moment cannot un-know what the origin later did, once they meet"
  )
}

await Promise.all(spools.map((s) => s.leave()))
console.log(failures ? `\n${failures} assertion(s) failed` : '\nall green')
