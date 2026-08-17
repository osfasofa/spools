// Spools-of-spools riff (docs/spools-of-spools.md): two questions, measured
// on the shipped SDK surface before the riff doc speculates past them.
//
//  1. What does a collection cost AT REST? — a spool holding N link entries
//     (kind 'spool', data.link = a full canonical link, body = a petname):
//     doc bytes at N=100 and N=1000, marginal bytes per link.
//  2. Does `splice` already work BY HAND through the spool.doc escape hatch?
//     Fork a spool under a new code (full lineage), diverge on both sides
//     (including concurrent character edits to the SAME pre-fork body),
//     reunite by exchanging updates, and rewind across the seam.
//
// Run: node scratch/riff-spools-of-spools/spike.mjs   (from repo root, after
// `pnpm --filter spools build`; yjs comes from packages/spools node_modules
// so the spike shares the SDK's module instance). Written/run on Node 22
// (mise pins 24 for the repo; nothing here is version-sensitive).

import * as Y from '../../packages/spools/node_modules/yjs/dist/yjs.mjs'
import {
  newSpool,
  buildSpoolLink,
  parseSpoolLink,
  generateCode,
} from '../../packages/spools/dist/index.js'

const kb = (n) => `${(n / 1024).toFixed(1)} KB`
const bytes = (doc) => Y.encodeStateAsUpdate(doc).byteLength
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const assert = (cond, label) => {
  if (!cond) {
    console.error(`  ✗ FAIL: ${label}`)
    process.exitCode = 1
  } else console.log(`  ✓ ${label}`)
}
// offline, memory-only: the riff is about doc physics, not transports
const offline = { relay: '', persist: false, encrypted: false }

// ---------- 1. collection cost at rest ----------------------------------

console.log('— collection cost at rest —')

const randomKey = () => crypto.getRandomValues(new Uint8Array(32))
const RELAY = 'wss://spools-relay-production.up.railway.app/yjs'
const PETNAMES = [
  'the mixtape for the drive', 'us', 'summer campfire', "gran's stories",
  'the move logistics', 'reading circle', 'trip to the coast', 'band practice',
]

const collection = await newSpool({ ...offline, author: 'ana' })
const sampleLink = buildSpoolLink({
  code: generateCode(),
  relay: RELAY,
  key: randomKey(),
  base: 'https://osfasofa.github.io/spools/',
})
console.log(`  sample link: ${sampleLink.length} chars`)

const sizes = {}
for (let i = 0; i < 1000; i++) {
  collection.wind({
    kind: 'spool',
    body: PETNAMES[i % PETNAMES.length],
    data: {
      link: buildSpoolLink({
        code: generateCode(),
        relay: RELAY,
        key: randomKey(),
        base: 'https://osfasofa.github.io/spools/',
      }),
    },
  })
  if (i + 1 === 100) sizes[100] = bytes(collection.doc)
  if (i + 1 === 1000) sizes[1000] = bytes(collection.doc)
}
const perLink = (sizes[1000] - sizes[100]) / 900
console.log(`  100 links: ${kb(sizes[100])}   1000 links: ${kb(sizes[1000])}`)
console.log(`  marginal cost: ${perLink.toFixed(0)} B/link (before history moments)`)
console.log(`  headroom: ${(8 * 1024 * 1024 / perLink / 1000).toFixed(0)}k links fit under the 8 MiB deposit cap`)
await collection.leave()

// sealed reference: the existing grammar already does capability-free links
const sealed = buildSpoolLink({ code: 'amber-cassette-042', relay: RELAY })
const parsedSealed = parseSpoolLink(sealed)
assert(
  parsedSealed.code === 'amber-cassette-042' && parsedSealed.relay === RELAY && !parsedSealed.key,
  'link grammar already expresses a sealed reference (code+relay, no k) — parse round-trips, no key'
)

// ---------- 2. splice by hand on the shipped surface --------------------

console.log('— splice by hand (fork → diverge → reunite → rewind across the seam) —')

const campfire = await newSpool({ ...offline, author: 'ana' })
const tale1 = campfire.wind({ kind: 'tale', body: 'the night the canoe sank' })
campfire.wind({ kind: 'tale', body: 'how the dog got its name' })
campfire.wind({ kind: 'saying', body: 'never trust a calm lake' })

// let the debounced history log stamp a pre-fork moment (2 s after last write)
await sleep(2600)
assert(campfire.history.length >= 1, `pre-fork history moment recorded (${campfire.history.length} moment)`)
const tsPreFork = Date.now()
const preForkBytes = bytes(campfire.doc)

// THE FORK: a new spool (new code, would be a new key) + one applyUpdate.
// This is the whole splice mechanism available today via the escape hatch.
const fork = await newSpool({ ...offline, author: 'ben' })
Y.applyUpdate(fork.doc, Y.encodeStateAsUpdate(campfire.doc))

assert(fork.code !== campfire.code, `fork has its own identity (${campfire.code} → ${fork.code})`)
assert(fork.entries.length === 3, 'fork carries the whole corpus (3 entries) — all-or-nothing, no partial fork')
assert(fork.history.length === campfire.history.length, 'history moments crossed the seam with it')

// DIVERGE: each side winds its own entries, and both edit the SAME
// pre-fork body concurrently (start vs end — the character-merge test)
campfire.wind({ kind: 'gloss', body: 'wound at the campfire after the fork' })
fork.wind({ kind: 'telling', body: 'wound on the fork after the fork' })
const atCampfire = campfire.entries.find((e) => e.id === tale1.id)
const atFork = fork.entries.find((e) => e.id === tale1.id)
atCampfire.text.insert(0, 'as ana tells it: ')
atFork.text.insert(atFork.text.length, ' — and the paddle was never found')

// REUNITE: exchange updates both ways. CRDT merge; the seam has no special case.
Y.applyUpdate(campfire.doc, Y.encodeStateAsUpdate(fork.doc))
Y.applyUpdate(fork.doc, Y.encodeStateAsUpdate(campfire.doc))

const idsA = campfire.entries.map((e) => e.id).join(',')
const idsB = fork.entries.map((e) => e.id).join(',')
assert(idsA === idsB && campfire.entries.length === 5, 'entry sets converge after reunion (5 entries, same order both sides)')
const mergedBody = campfire.entries.find((e) => e.id === tale1.id).body
assert(
  mergedBody.startsWith('as ana tells it: ') && mergedBody.endsWith('never found') &&
    mergedBody === fork.entries.find((e) => e.id === tale1.id).body,
  `concurrent edits to one pre-fork body merged character-level across the seam`
)
console.log(`    merged body: "${mergedBody}"`)

// REWIND ACROSS THE SEAM: the fork remembers who it was before it was born
const past = fork.rewind(tsPreFork)
assert(
  past.length === 3 && past.every((e) => ['tale', 'saying'].includes(e.kind)),
  'fork.rewind(pre-fork ts) reconstructs the pre-fork corpus inside the fork'
)

console.log(`    sizes: pre-fork ${kb(preForkBytes)} → post-reunion ${kb(bytes(campfire.doc))} (campfire) / ${kb(bytes(fork.doc))} (fork)`)

await campfire.leave()
await fork.leave()

console.log(process.exitCode ? '\nspike FAILED' : '\nspike ok')
