#!/usr/bin/env node
// T-178 repro: where do pocket deposits go missing at leave()?
//
// The ticket names four candidate mechanisms. This harness runs one scenario
// per mechanism against the REAL workspace relay (spawned locally on
// 127.0.0.1 — never the canonical one) with persist:false writers, then
// opens the link cold in a fresh Spool and counts what the pocket gave back.
// No dependencies beyond node and the SDK's own dist/.
//
//   (cd packages/spools && pnpm build)   # this imports dist/
//   node repro.mjs                       # S1–S4, about 15 s
//   node repro.mjs --slow                # adds S2b: the leave-time retry
//                                        # outliving the relay's 60 s rate
//                                        # window (about 65 s more)
//
// Verdicts: OK (nothing lost) · NAMED (lost from the pocket, and the SDK said
// so through depositError) · SILENT (lost, nothing said) · PHYSICS (the
// process was gone before any PUT could finish; nothing local survives a
// persist:false client, so there is nothing to heal from) · BY DESIGN (the
// per-tag ring, documented in the relay README).
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  newSpool,
  openSpool,
  Spool,
  SpoolEngine,
  buildSpoolLink,
  generateCode,
} from '../../packages/spools/dist/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const RELAY = join(here, '..', '..', 'packages', 'spools-relay', 'server.js')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let nextPort = 15700 + Math.floor(Math.random() * 200)

const startRelay = async (env = {}) => {
  const port = nextPort++
  const child = spawn(process.execPath, [RELAY], {
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', ...env },
    stdio: 'ignore',
  })
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break
    } catch {
      await sleep(50)
    }
  }
  return { ws: `ws://127.0.0.1:${port}/yjs`, http: `http://127.0.0.1:${port}`, kill: () => child.kill() }
}

const settled = (spool) =>
  new Promise((resolve) => {
    const check = (s) => {
      if (s && s.phase !== 'checking') {
        off()
        resolve(s)
        return true
      }
      return false
    }
    const off = spool.on('pocket', check)
    check(spool.pocket)
  })

/** a cold reader: the room is empty by now, so every entry it renders came out of the pocket */
const readBack = async (link) => {
  const r = await openSpool(link, { persist: false, author: 'reader' })
  await settled(r)
  const bodies = r.entries.map((e) => e.body).sort()
  await r.leave()
  return bodies
}

const rows = []
const verdict = (name, wound, got, err, forced, extra = '') => {
  const lost = wound.filter((b) => !got.includes(b))
  const v = forced ?? (lost.length === 0 ? 'OK' : err ? `NAMED (depositError: ${err})` : 'SILENT LOSS')
  rows.push({ name, wound: wound.length, pocket: got.length, lost: lost.length, v })
  console.log(
    `${name.padEnd(52)} wound ${wound.length}  pocket ${got.length}  lost ${lost.length}  ` +
      `depositError ${String(err ?? '-').padEnd(13)} ${v}${extra ? `  [${extra}]` : ''}`
  )
}

const freshKey = () => crypto.getRandomValues(new Uint8Array(32))

// ---- child mode for S3: a headless builder in its own process ----
if (process.argv[2] === '--child') {
  const [, , , mode, link] = process.argv
  const s = await openSpool(link, { persist: false, author: 'child' })
  await settled(s)
  s.wind({ kind: 'note', body: `S3 ${mode}` })
  if (mode === 'no-leave') process.exit(0) // syrup's headless builder: closes without leave()
  if (mode === 'exit-as-put-starts') {
    void s.leave() // the flush PUT is initiated…
    process.exit(0) // …and the process is gone before a byte leaves it
  }
  if (mode === 'exit-20ms-into-put') {
    void s.leave()
    await sleep(20) // enough for the body to reach a localhost relay, not for the response
    process.exit(0)
  }
  await s.leave() // control: waits for the flush like a well-behaved client
  process.exit(0)
}

const slow = process.argv.includes('--slow')
console.log(`relay: ${RELAY}\n`)

// ---- S1: mechanism-free baseline — leave() inside the debounce window ----
{
  const relay = await startRelay()
  const w = await newSpool({ relay: relay.ws, persist: false, author: 'w' })
  await settled(w)
  w.wind({ kind: 'note', body: 'S1 last second' })
  await w.leave() // 10 s debounce never elapses: only the flush can carry it
  verdict('S1 leave() inside the debounce', ['S1 last second'], await readBack(w.share('')), w.pocket?.depositError)
  relay.kill()
}

// ---- S5: mechanism 5 — leave() before the open-time pocket check settles ----
// T-182's wall: a script minted a keyed spool, wound once, and left as soon
// as the socket said connected — before the pocket's GET had answered. The
// scheduler arms only when that GET settles; winds before then set nothing
// dirty, and flush() returns early when unarmed. Nothing is deposited.
{
  const relay = await startRelay()
  const w = await newSpool({ relay: relay.ws, persist: false, author: 'w' })
  w.wind({ kind: 'note', body: 'S5 before settle' }) // no settled(w): straight in
  const phaseAtLeave = w.pocket?.phase
  const t0 = Date.now()
  await w.leave()
  verdict(
    'S5 leave() before the pocket check settles',
    ['S5 before settle'],
    await readBack(w.share('')),
    w.pocket?.depositError,
    undefined,
    `phase at leave: ${phaseAtLeave}; leave() ${Date.now() - t0} ms`
  )
  relay.kill()
}

// ---- S2: mechanism 1 — the final PUT answered 429 ----
const s2 = async (waitForWindow) => {
  const relay = await startRelay({ POCKET_PUTS_PER_MIN: '1' })
  const a = await newSpool({ relay: relay.ws, persist: false, author: 'a' })
  await settled(a)
  a.wind({ kind: 'note', body: 'S2 first' })
  await a.leave() // PUT #1: the whole per-IP budget for this minute
  const burnedAt = Date.now()
  const link = a.share('')
  const b = await openSpool(link, { persist: false, author: 'b' })
  await settled(b)
  b.wind({ kind: 'note', body: 'S2 second' })
  if (waitForWindow) {
    // leave 57.5 s after the budget was burned: tries at +0, +1 s, +3 s — the
    // third crosses the 60 s line, if the SDK still has any tries left by then
    const wait = burnedAt + 57_500 - Date.now()
    console.log(`  (S2b: waiting ${Math.round(wait / 1000)} s for the rate window to nearly roll over)`)
    await sleep(Math.max(0, wait))
  }
  const t0 = Date.now()
  await b.leave() // the flush PUT meets the 429
  verdict(
    waitForWindow ? 'S2b 429 at leave, window frees during the retry' : 'S2 429 at leave (POCKET_PUTS_PER_MIN=1)',
    ['S2 first', 'S2 second'],
    await readBack(link),
    b.pocket?.depositError,
    undefined,
    `leave() took ${Date.now() - t0} ms`
  )
  relay.kill()
}
await s2(false)

// ---- S3: mechanisms 2 and 3 — the process dies; persist:false has nothing to heal from ----
const s3 = async (mode, label) => {
  const relay = await startRelay()
  const link = buildSpoolLink({ code: generateCode(), relay: relay.ws, key: freshKey() })
  await new Promise((r) =>
    spawn(process.execPath, [fileURLToPath(import.meta.url), '--child', mode, link], { stdio: 'inherit' }).on('exit', r)
  )
  const got = await readBack(link)
  const lost = !got.includes(`S3 ${mode}`)
  verdict(label, [`S3 ${mode}`], got, undefined, lost ? 'PHYSICS' : 'OK', 'child process; depositError unobservable')
  relay.kill()
}
await s3('leave', 'S3a child awaits leave() (control)')
await s3('no-leave', 'S3b child exits without leave()')
await s3('exit-as-put-starts', 'S3c child exits as the flush PUT starts')
await s3('exit-20ms-into-put', 'S3d child exits 20 ms into the flush PUT')

// ---- S4: mechanism 4 — more isolated writers than ring slots ----
{
  const relay = await startRelay({ POCKET_K: '2' })
  const code = generateCode()
  const key = freshKey()
  const link = buildSpoolLink({ code, relay: relay.ws, key })
  // three writers that never meet: engines without a relay (no websocket), pocket only
  const writers = ['w1', 'w2', 'w3'].map(
    (name) => new Spool(new SpoolEngine({ code, key, persist: false }), relay.ws, key, name)
  )
  for (const w of writers) await settled(w) // all three see an empty pocket
  for (const w of writers) w.wind({ kind: 'note', body: `S4 ${w.author}` })
  for (const w of writers) await w.leave() // three tags into a ring of two
  verdict(
    'S4 three isolated writers, POCKET_K=2 (the ring)',
    writers.map((w) => `S4 ${w.author}`),
    await readBack(link),
    writers.map((w) => w.pocket?.depositError).find(Boolean),
    'BY DESIGN'
  )
  relay.kill()
}

if (slow) await s2(true)

console.log('\nsummary')
for (const r of rows) console.log(`  ${r.name.padEnd(52)} lost ${r.lost}/${r.wound}  ${r.v}`)
process.exit(0)
