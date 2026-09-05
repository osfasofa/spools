// The reel riff, measured (docs/riffs/the-reel.md). Offline, memory-only,
// on the workspace build of spools 0.2.0 through the documented surface plus
// the spool.doc escape hatch. Run: node scratch/riff-reel/spike.mjs
// (after pnpm --filter spools build).
import * as Y from '../../packages/spools/node_modules/yjs/dist/yjs.mjs'
import { newSpool } from '../../packages/spools/dist/index.js'

const N = 5000
const t0 = () => performance.now()
const ms = (t) => `${(performance.now() - t).toFixed(0)} ms`
const bytes = (s) => Y.encodeStateAsUpdate(s.doc).length
const kb = (n) => `${(n / 1024).toFixed(0)} KiB`
const ok = (cond, msg) => { if (!cond) throw new Error('✗ ' + msg); console.log('  ✓ ' + msg) }
const note = (msg) => console.log('  · ' + msg)
const open = () => newSpool({ persist: false, relay: '', author: 'ana' }) // no relay, no pocket, no disk

console.log(`— 1. a reel of ${N} messages —`)
const a = await open()
let t = t0()
const seat = 'seatA'
for (let i = 0; i < N; i++) {
  a.wind({ kind: 'message', body: `message ${i}: the night the canoe sank, told again`, data: { seat }, ...(i % 7 === 0 && i > 0 ? { parent: a.entries[i - 1].id } : {}) })
}
note(`wound ${N} in ${ms(t)}; tape ${kb(bytes(a))} (${(bytes(a) / N).toFixed(0)} B per entry)`)
ok(a.entries.length === N, `${N} entries live`)

console.log('— 2. forgetting inside the reel only grows it —')
const before = bytes(a)
t = t0()
a.doc.transact(() => { for (const e of a.entries.slice(0, N / 2)) e.delete() })
note(`soft-deleted half in ${ms(t)}: ${kb(before)} → ${kb(bytes(a))}`)
ok(bytes(a) > before, 'the tape got longer, not shorter')
ok(a.entries.length === N / 2 && a.deleted.length === N / 2, 'half hidden, half live, nothing gone')

console.log('— 3. the cut, as a retelling with fresh ids (wind) —')
const b = await open()
t = t0()
const idMap = new Map()
for (const e of a.entries) {
  const parent = e.parent && idMap.has(e.parent) ? { parent: idMap.get(e.parent) } : {}
  const fresh = b.wind({ kind: e.kind, body: e.body, data: { ...(e.data ?? {}), from: { spool: a.code, id: e.id, at: e.createdAt } }, ...parent })
  idMap.set(e.id, fresh.id)
}
note(`retold ${b.entries.length} live entries in ${ms(t)}; new reel ${kb(bytes(b))} vs old ${kb(bytes(a))} — ${(bytes(b) / b.entries.length).toFixed(0)} B per entry with provenance`)
ok(b.entries.length === N / 2, 'the retelling holds exactly the kept half')
ok(bytes(b) < bytes(a), 'the new reel is smaller than the old tape')
ok(b.entries.every((e) => e.data.from.spool === a.code), 'provenance rides in data')
const b2 = await open()
for (const e of a.entries) b2.wind({ kind: e.kind, body: e.body, data: e.data })
note(`the same retelling without provenance: ${kb(bytes(b2))} — ${(bytes(b2) / b2.entries.length).toFixed(0)} B per entry; provenance costs ${(bytes(b) - bytes(b2)) / b.entries.length | 0} B per entry (a spool code, a uuid, a timestamp)`)
ok(bytes(b2) < bytes(a) / 2, 'without provenance the kept half is less than half the old tape')
await b2.leave()

console.log('— 4. the cut, preserving identity (escape hatch) —')
const c = await open()
t = t0()
const kept = new Set(a.entries.map((e) => e.id))
let flattened = 0
c.doc.transact(() => {
  const entries = c.doc.getMap('entries')
  for (const e of a.entries) {
    const meta = new Y.Map()
    meta.set('id', e.id); meta.set('author', e.author); meta.set('kind', e.kind); meta.set('createdAt', e.createdAt)
    // a reply whose parent was not kept would point at nothing forever — the
    // room would render it as "not synced yet", which here would be a lie —
    // so the cut flattens it: the thread is gone with the parent
    if (e.parent !== undefined && kept.has(e.parent)) meta.set('parent', e.parent)
    else if (e.parent !== undefined) flattened++
    if (e.data !== undefined) meta.set('data', structuredClone(e.data))
    entries.set(e.id, meta)
    if (e.body) c.doc.getText(`entry:${e.id}`).insert(0, e.body)
  }
})
note(`re-wound ${c.entries.length} with the same ids and timestamps in ${ms(t)}; ${kb(bytes(c))}`)
ok(c.entries.every((e, i) => e.id === a.entries[i].id && e.createdAt === a.entries[i].createdAt), 'identity and order cross intact')
ok(c.entries.filter((e) => e.parent).every((e) => c.entries.some((p) => p.id === e.parent)), 'every kept thread resolves')
note(`${flattened} replies lost their parent to the cut and were flattened — the first thing a retelling must decide, and the spike had to be told`)

console.log('— 5. off the front: keep the last fifth —')
const cutAt = a.entries[Math.floor(a.entries.length * 0.8)].createdAt
const d = await open()
for (const e of a.entries) if (e.createdAt >= cutAt) d.wind({ kind: e.kind, body: e.body, data: { ...(e.data ?? {}), from: { spool: a.code, id: e.id, at: e.createdAt } } })
const exactFifth = a.entries.length - Math.floor(a.entries.length * 0.8)
note(`kept ${d.entries.length} of ${a.entries.length}: ${kb(bytes(d))} — ${d.entries.length - exactFifth} extra from createdAt ties at the cut (entries wound in the same millisecond share a timestamp; a cut by time is fuzzy at the seam, a cut by entry is exact)`)
ok(d.entries.length >= exactFifth && d.entries.length <= exactFifth + 10, 'about a fifth of the live entries, ties included')

console.log('— 6. what the cut costs in memory: the new reel has no past —')
ok(b.history.length === 0 && c.history.length === 0, 'no rewind moments before the cut (history starts at the cut)')
note('the old reel keeps its whole past on every device that keeps it; the pocket lets go after the relay\'s TTL')

console.log('— 7. the ceiling, as physics —')
const CAP = 8 * 1024 * 1024
const perEntry = bytes(a) / N
note(`at ${perEntry.toFixed(0)} B per entry (this body length, gc:false, no history moments), 8 MiB holds ~${Math.floor(CAP / perEntry).toLocaleString()} entries`)
note('the relay advertises its deposit cap in its health JSON (pocket.maxBytes) — a client can draw the counter from the link\'s relay, not a constant')
for (const s of [a, b, c, d]) await s.leave()
console.log('all green')
