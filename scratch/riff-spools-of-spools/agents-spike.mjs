// Agents riff (docs/forks/pfam-riff.md): three agent-shaped questions,
// measured on the shipped SDK before the riff speculates past them.
//
//  1. THE CLAIM CONVENTION — two agents race to claim one task entry,
//     concurrently, on diverged replicas. After merge, do both replicas
//     compute the same winner (first claim by createdAt, id tie-break —
//     the display-order invariant, reused as an arbiter)? 100 rounds.
//  2. WAKE-UP SEMANTICS — an agent that opens a spool and applies a peer's
//     accumulated update: does the catch-up arrive as one batched entry
//     event (the diff contract), so a periodic agent needs no polling loop?
//  3. APPEND vs REWRITE — the same 300 status updates written the room's
//     way (append-only entries) vs the dashboard way (rewriting one body).
//     Doc bytes for each shape; T-110 already measured the rewrite shape
//     going quadratic once history moments interleave — this puts flat
//     numbers on the base cost too.
//
// Run: node scratch/riff-spools-of-spools/agents-spike.mjs   (from repo
// root, after `pnpm --filter spools build`).

import * as Y from '../../packages/spools/node_modules/yjs/dist/yjs.mjs'
import { newSpool } from '../../packages/spools/dist/index.js'

const kb = (n) => `${(n / 1024).toFixed(1)} KB`
const bytes = (doc) => Y.encodeStateAsUpdate(doc).byteLength
const assert = (cond, label) => {
  if (!cond) {
    console.error(`  ✗ FAIL: ${label}`)
    process.exitCode = 1
  } else console.log(`  ✓ ${label}`)
}
const offline = { relay: '', persist: false, encrypted: false }
const syncBoth = (a, b) => {
  Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc))
  Y.applyUpdate(a.doc, Y.encodeStateAsUpdate(b.doc))
}

// ---------- 1. the claim convention -------------------------------------

console.log('— claim convention: deterministic winner across replicas —')

const deskA = await newSpool({ ...offline, author: 'agent-a' })
const deskB = await newSpool({ ...offline, author: 'agent-b' })
Y.applyUpdate(deskB.doc, Y.encodeStateAsUpdate(deskA.doc))

const winnerOf = (desk, taskId) => {
  // spool.entries is already the protocol's display order:
  // createdAt ascending, id ascending as tie-break — same on every peer.
  const claims = desk.entries.filter((e) => e.kind === 'claim' && e.parent === taskId)
  return claims.length ? claims[0].data.seat : null
}

let agree = 0
let tiesSeen = 0
for (let round = 0; round < 100; round++) {
  const task = deskA.wind({ kind: 'task', body: `task ${round}` })
  syncBoth(deskA, deskB) // both agents can see the task…
  // …and now claim CONCURRENTLY: neither replica has seen the other's claim
  const cA = deskA.wind({ kind: 'claim', parent: task.id, data: { seat: 'agent-a' } })
  const cB = deskB.wind({ kind: 'claim', parent: task.id, data: { seat: 'agent-b' } })
  if (cA.createdAt === cB.createdAt) tiesSeen++
  syncBoth(deskA, deskB)
  if (winnerOf(deskA, task.id) === winnerOf(deskB, task.id)) agree++
}
assert(agree === 100, `both replicas agree on the claim winner in 100/100 rounds (${tiesSeen} exact-ms ties, settled by id)`)
await deskA.leave()
await deskB.leave()

// ---------- 2. wake-up semantics -----------------------------------------

console.log('— wake-up: catch-up arrives as one batched diff event —')

const home = await newSpool({ ...offline, author: 'ana' })
const agent = await newSpool({ ...offline, author: 'agent' })
Y.applyUpdate(agent.doc, Y.encodeStateAsUpdate(home.doc))

home.wind({ kind: 'note', body: 'first' })
home.wind({ kind: 'note', body: 'second' })
home.wind({ kind: 'question', body: 'third — for the agent' })

const events = []
agent.on('entry', (change) => events.push(change))
// the agent "wakes": one applyUpdate carrying everything it missed
// (mechanically what a pocket collect or a sync burst does on open)
Y.applyUpdate(agent.doc, Y.encodeStateAsUpdate(home.doc))

assert(
  events.length === 1 && events[0].added.length === 3,
  `three missed winds arrive as ONE event with added:3 (got ${events.length} event(s), added:${events[0]?.added.length})`
)
await home.leave()
await agent.leave()

// ---------- 3. append vs rewrite -----------------------------------------

console.log('— 300 status updates: the room way vs the dashboard way —')

const STATUS = (i) => `step ${i}: fetched 12 files, wound 3 findings, waiting on CI`

const appender = await newSpool({ ...offline, author: 'agent' })
const base = bytes(appender.doc)
for (let i = 0; i < 300; i++) appender.wind({ kind: 'status', body: STATUS(i) })
const appendBytes = bytes(appender.doc) - base

const rewriter = await newSpool({ ...offline, author: 'agent' })
const status = rewriter.wind({ kind: 'status', body: STATUS(0) })
const base2 = bytes(rewriter.doc)
for (let i = 1; i < 300; i++) status.body = STATUS(i) // wholesale rewrite: delete-all + insert
const rewriteBytes = bytes(rewriter.doc) - base2

console.log(`  append-only: ${kb(appendBytes)} for 300 entries (${(appendBytes / 300).toFixed(0)} B each) — every step still readable, rewindable`)
console.log(`  body-rewrite: ${kb(rewriteBytes)} for 299 rewrites (${(rewriteBytes / 299).toFixed(0)} B each) — history shows churn, reads as one line`)
console.log(`  (gc:false keeps every rewrite's tombstones forever; T-110 measured this shape going`)
console.log(`   quadratic once history moments interleave — the append column has no such cliff)`)
assert(appendBytes > 0 && rewriteBytes > 0, 'both shapes measured')

await appender.leave()
await rewriter.leave()

console.log(process.exitCode ? '\nspike FAILED' : '\nspike ok')
