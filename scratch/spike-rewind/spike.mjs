// T-060 investigation: what does rewind() actually cost?
//
// Questions (ticket):
//  1. gc:false size cost on a realistic spool — doc bytes, load time.
//  2. Retro-compat: what's recoverable from a doc that lived with gc:on?
//  3. Snapshot log cost: Y.Snapshot encoded size over a doc's life (the ds
//     grows with every deletion, and wholesale body edits are deletions).
//
// Run: node scratch/spike-rewind/spike.mjs   (from repo root; yjs comes from
// packages/spools node_modules)

import * as Y from '../../packages/spools/node_modules/yjs/dist/yjs.mjs'

const kb = (n) => `${(n / 1024).toFixed(1)} KB`
const ms = (n) => `${n.toFixed(1)} ms`

// ---------- the simulated spool: mixtape/chat at intimate scale ----------
// 200 entries (~90-char bodies), 150 of them edited twice WHOLESALE (the
// body-setter path: delete-all + insert — worst case for tombstones), 50
// entries getting 20 character-level inserts (the editor-binding path),
// 40 soft deletes. Metadata mirrors entry.ts exactly.

const LOREM = 'the mixtape needs one more track before the drive, something slow for the last stretch '

const simulate = (doc, { snapshotEvery = 0 } = {}) => {
  const entries = doc.getMap('entries')
  const ids = []
  const snapshots = [] // [ts-equivalent step, encoded bytes]
  let step = 0
  const maybeSnapshot = () => {
    step++
    if (snapshotEvery && step % snapshotEvery === 0) {
      snapshots.push(Y.encodeSnapshot(Y.snapshot(doc)))
    }
  }

  for (let i = 0; i < 200; i++) {
    const id = `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`
    ids.push(id)
    doc.transact(() => {
      const meta = new Y.Map()
      meta.set('id', id)
      meta.set('author', ['ana', 'ben', 'cal'][i % 3])
      meta.set('kind', i % 4 === 0 ? 'track' : 'note')
      meta.set('createdAt', 1700000000000 + i * 60_000)
      if (i % 4 === 0) meta.set('data', { url: `https://x.example/v/${i}`, title: `track ${i}` })
      entries.set(id, meta)
      doc.getText(`entry:${id}`).insert(0, LOREM.slice(0, 60 + (i % 30)) + i)
    })
    maybeSnapshot()
  }
  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < 150; i++) {
      const text = doc.getText(`entry:${ids[i]}`)
      doc.transact(() => {
        text.delete(0, text.length)
        text.insert(0, `edit ${round}: ` + LOREM.slice(0, 70 + (i % 20)))
      })
      maybeSnapshot()
    }
  }
  for (let i = 0; i < 50; i++) {
    const text = doc.getText(`entry:${ids[i]}`)
    for (let c = 0; c < 20; c++) {
      doc.transact(() => text.insert(Math.min(text.length, c * 3), 'ab '))
      maybeSnapshot()
    }
  }
  for (let i = 0; i < 40; i++) {
    doc.transact(() => entries.get(ids[i * 3]).set('deletedAt', 1700020000000 + i))
    maybeSnapshot()
  }
  return { ids, snapshots }
}

// ---------- 1. gc on vs off ----------

for (const gc of [true, false]) {
  const doc = new Y.Doc({ gc })
  simulate(doc)
  const update = Y.encodeStateAsUpdate(doc)
  const t0 = performance.now()
  const fresh = new Y.Doc({ gc })
  Y.applyUpdate(fresh, update)
  const loadMs = performance.now() - t0
  console.log(
    `gc:${gc}  encoded doc ${kb(update.length)}  load ${ms(loadMs)}  ` +
      `(200 entries, 300 wholesale edits, 1000 char edits, 40 soft deletes)`
  )
}

// heavy churn: one body wholesale-replaced 1000 times (the pathological chat)
for (const gc of [true, false]) {
  const doc = new Y.Doc({ gc })
  const text = doc.getText('entry:x')
  for (let i = 0; i < 1000; i++) {
    doc.transact(() => {
      text.delete(0, text.length)
      text.insert(0, LOREM + i)
    })
  }
  console.log(`gc:${gc}  1000-wholesale-edit single body: ${kb(Y.encodeStateAsUpdate(doc).length)}`)
}

// ---------- 2. snapshot log cost over the doc's life ----------

{
  const doc = new Y.Doc({ gc: false })
  const { snapshots } = simulate(doc, { snapshotEvery: 10 }) // ~154 snapshots
  const sizes = snapshots.map((s) => s.length)
  const total = sizes.reduce((a, b) => a + b, 0)
  console.log(
    `\nsnapshot log (every 10th txn, ${snapshots.length} snapshots): ` +
      `first ${sizes[0]} B, median ${sizes[Math.floor(sizes.length / 2)]} B, ` +
      `last ${sizes[sizes.length - 1]} B, total ${kb(total)}`
  )
  // coarser: one snapshot per "session burst" (~every 50 txns)
  const doc2 = new Y.Doc({ gc: false })
  const r2 = simulate(doc2, { snapshotEvery: 50 })
  const t2 = r2.snapshots.reduce((a, s) => a + s.length, 0)
  console.log(`snapshot log (every 50th txn, ${r2.snapshots.length} snapshots): total ${kb(t2)}`)
}

// ---------- 3. does rewind actually work (gc:false), and what does gc:true recover? ----------

{
  const doc = new Y.Doc({ gc: false })
  const entries = doc.getMap('entries')
  const mkEntry = (id, body) =>
    doc.transact(() => {
      const meta = new Y.Map()
      meta.set('id', id)
      meta.set('createdAt', Date.now())
      entries.set(id, meta)
      doc.getText(`entry:${id}`).insert(0, body)
    })
  mkEntry('a', 'first draft')
  const snapT1 = Y.snapshot(doc)
  doc.getText('entry:a').delete(0, 5)
  doc.getText('entry:a').insert(0, 'final')
  mkEntry('b', 'second entry')
  doc.transact(() => entries.get('a').set('deletedAt', 123))
  const snapT2 = Y.snapshot(doc)

  const at1 = Y.createDocFromSnapshot(doc, snapT1)
  const at2 = Y.createDocFromSnapshot(doc, snapT2)
  console.log(
    `\nrewind on gc:false — t1: body ${JSON.stringify(at1.getText('entry:a').toString())}, ` +
      `entries [${[...at1.getMap('entries').keys()]}]  |  ` +
      `t2: body ${JSON.stringify(at2.getText('entry:a').toString())}, ` +
      `a.deletedAt ${at2.getMap('entries').get('a').get('deletedAt')}, entries [${[...at2.getMap('entries').keys()]}]`
  )
  console.log(`present unaffected: ${JSON.stringify(doc.getText('entry:a').toString())}`)
}

{
  // a doc that lived with gc:true (every spool before T-060): sync its state
  // into a gc:false doc — what does a snapshot taken BEFORE the migration
  // moment recover, and does one taken AFTER work?
  const old = new Y.Doc({ gc: true })
  const entries = old.getMap('entries')
  old.transact(() => {
    const meta = new Y.Map()
    meta.set('id', 'a')
    entries.set('a', meta)
    old.getText('entry:a').insert(0, 'text that was later edited away')
  })
  const preMigrationSnap = Y.snapshot(old)
  old.getText('entry:a').delete(0, 31)
  old.getText('entry:a').insert(0, 'current text') // old content now gc'd

  const migrated = new Y.Doc({ gc: false })
  Y.applyUpdate(migrated, Y.encodeStateAsUpdate(old))
  try {
    const back = Y.createDocFromSnapshot(migrated, preMigrationSnap)
    console.log(`\ngc:true retro, pre-migration snapshot: ${JSON.stringify(back.getText('entry:a').toString())}`)
  } catch (err) {
    console.log(`\ngc:true retro, pre-migration snapshot: THROWS (${err.message})`)
  }
  const postSnap = Y.snapshot(migrated)
  migrated.getText('entry:a').delete(0, 7)
  const back2 = Y.createDocFromSnapshot(migrated, postSnap)
  console.log(`gc:true retro, post-migration snapshot: ${JSON.stringify(back2.getText('entry:a').toString())} (edits after migration ARE recoverable)`)
}

// ---------- 4. satisfiability guard: snapshot referencing unseen structs ----------

{
  const a = new Y.Doc({ gc: false })
  const b = new Y.Doc({ gc: false })
  a.getText('t').insert(0, 'from a')
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a))
  b.getText('t').insert(6, ' and b')
  const snapB = Y.snapshot(b) // references b's structs...
  // ...which a never received:
  try {
    const res = Y.createDocFromSnapshot(a, snapB)
    console.log(`\nunsatisfiable snapshot: returned ${JSON.stringify(res.getText('t').toString())} (no throw)`)
  } catch (err) {
    console.log(`\nunsatisfiable snapshot: THROWS (${err.constructor.name}: ${err.message})`)
  }
}
