#!/usr/bin/env node
// T-178 cold reader: open a link with nothing else in the room and count
// what the pocket gives back. Companion to unload.html.
//   node read.mjs '<link>'
import { openSpool } from '../../packages/spools/dist/index.js'

const link = process.argv[2]
if (!link) {
  console.error('usage: read.mjs <link>')
  process.exit(1)
}
const r = await openSpool(link, { persist: false, author: 'reader' })
await new Promise((res) => {
  const c = (st) => st && st.phase !== 'checking' && res()
  r.on('pocket', c)
  c(r.pocket)
})
console.log(`pocket: ${r.pocket?.phase}${r.pocket?.applied != null ? ` (${r.pocket.applied} deposits)` : ''}`)
console.log(`entries: ${r.entries.length}`)
for (const e of r.entries) console.log(`  - ${e.body}`)
await r.leave()
process.exit(0)
