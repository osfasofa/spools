// T-105 verification: does the canonical relay keep the pocket's promise?
// Runs the milestone-acceptance midnight test against PRODUCTION, using the
// local pocket-aware SDK build (not the published 0.0.1, which predates M10).
//
//   node verify.mjs deposit   # writer: wind, leave (flushes a deposit), save the link
//   node verify.mjs check     # what the relay holds, globally and for this spool
//   node verify.mjs read      # cold reader in a FRESH process — the midnight open
//
// The writer is gone by the time the reader runs (separate processes, no
// shared memory, persist:false everywhere), and the room is empty — so
// anything the reader renders came out of the relay's pocket.
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { newSpool, openSpool, parseSpoolLink, DEFAULT_RELAY } from '../../packages/spools/dist/index.js'

const STATE = new URL('./last-link.txt', import.meta.url)
const HEALTH = DEFAULT_RELAY.replace(/^wss:/, 'https:').replace(/\/yjs$/, '')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** the SPEC §6 derivation, independently reimplemented so this script checks the SDK rather than trusting it */
const tokenFor = (key) =>
  createHash('sha512')
    .update(Buffer.concat([Buffer.from('spool-pocket-v1'), Buffer.from(key)]))
    .digest()
    .subarray(0, 12)
    .toString('base64url')

const health = async () => (await fetch(HEALTH)).json()

const pocketOf = async (code, key) =>
  (await fetch(`${HEALTH}/pocket/${code}/${tokenFor(key)}`)).json()

const phase = process.argv[2]

if (phase === 'deposit') {
  console.log(`relay: ${DEFAULT_RELAY}`)
  const spool = await newSpool({ persist: false, author: 'the-phone' })
  const link = spool.share('')
  const key = parseSpoolLink(link).key
  console.log(`spool: ${spool.code}  key fingerprint: ${spool.keyFingerprint}`)
  for (const t of ['Cheer Up Boys (Your Make Up Is Running)', 'Take Me Out', 'Bloodbuzz Ohio']) {
    spool.wind({ kind: 'track', body: t })
  }
  console.log(`wound ${spool.entries.length} tracks; waiting 2.5s for the history moment…`)
  await sleep(2500)
  console.log('leaving (this flushes the final deposit)…')
  await spool.leave()
  await writeFile(STATE, link)
  const held = await pocketOf(spool.code, key)
  console.log(`pocket for ${spool.code}: ${held.deposits?.length ?? 0} deposit(s), ttlDays=${held.ttlDays}`)
  console.log(`link saved to ${STATE.pathname}`)
} else if (phase === 'check') {
  const h = await health()
  console.log(`global: rooms=${h.pocket.rooms} deposits=${h.pocket.deposits} ttlDays=${h.pocket.ttlDays} maxBytes=${h.pocket.maxBytes}`)
  try {
    const link = (await readFile(STATE, 'utf8')).trim()
    const { code, key } = parseSpoolLink(link)
    const held = await pocketOf(code, key)
    const sizes = (held.deposits ?? []).map((d) => `${Math.round(Buffer.from(d.blob, 'base64').length / 1024)}KB @ ${new Date(d.at).toISOString()}`)
    console.log(`this spool (${code}): ${held.deposits?.length ?? 0} deposit(s) ${sizes.join(', ')}`)
  } catch {
    console.log('(no saved link yet — run the deposit phase first)')
  }
} else if (phase === 'read') {
  const link = (await readFile(STATE, 'utf8')).trim()
  const { code } = parseSpoolLink(link)
  console.log(`cold-opening ${code} — writer is long gone, room should be empty`)
  const t0 = Date.now()
  const spool = await openSpool(link, { persist: false, author: 'the-laptop' })
  const seen = []
  spool.on('pocket', (p) => seen.push(`${p.phase}${p.applied != null ? `(applied=${p.applied},dropped=${p.dropped})` : ''}`))
  await new Promise((resolve) => {
    const done = () => spool.pocket && spool.pocket.phase !== 'checking'
    const poll = setInterval(() => {
      if (done()) {
        clearInterval(poll)
        resolve()
      }
    }, 100)
    setTimeout(() => {
      clearInterval(poll)
      resolve()
    }, 20_000)
  })
  const ms = Date.now() - t0
  console.log(`pocket states: ${seen.join(' → ') || '(none)'}`)
  console.log(`peers in room: ${spool.status}  |  entries after ${ms}ms:`)
  for (const e of spool.entries) console.log(`  · ${e.body}`)
  console.log(`rewind moments carried across: ${spool.history.length}`)
  await spool.leave()
  console.log(spool.entries.length === 3 ? '\nMIDNIGHT TEST: PASS' : '\nMIDNIGHT TEST: FAIL')
} else {
  console.error('usage: node verify.mjs deposit|check|read')
  process.exit(1)
}
