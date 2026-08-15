#!/usr/bin/env node
// spools-keeper: a headless client that keeps one spool answered.
//
// To every other peer it's just a member who never sleeps — it answers
// SyncStep1 like any client (peers are each other's server, SPEC §3), so the
// midnight-mixtape gap closes for its household with zero protocol change,
// zero relay change, and no pocket involved. It holds the key because you
// handed it the link; the link is the key exchange (SPEC §1). That makes it
// the async answer for keyless spools too (the pocket is keyed-only), and
// the escape hatch for anyone who'd rather not have even ciphertext on a
// relay's disk.
//
// Durability is the M8 round-trip, nothing invented: restore from an export
// file on start, export to it debounced-on-idle while running. Kill -9 loses
// at most the debounce window; the peers still hold everything.
//
//   npx spools-keeper '<link>' [--file <path>]
//
// Quote the link — it contains & characters. Logs carry counts, codes, and
// key fingerprints only: never content, never the key, never the full link.

import { readFile, writeFile, rename } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { openSpool, importSpool, parseSpoolLink, DEFAULT_RELAY } from 'spools'

const SAVE_DEBOUNCE_MS = 2_000
const SAVE_MIN_GAP_MS = 10_000

const argv = process.argv.slice(2)
const link = argv.find((a) => !a.startsWith('--'))
const argValue = (flag) => {
  const i = argv.indexOf(flag)
  return i !== -1 ? argv[i + 1] : undefined
}

if (!link) {
  console.error('usage: spools-keeper <link> [--file <path>]')
  process.exit(1)
}

let parsed
try {
  parsed = parseSpoolLink(link)
} catch (err) {
  console.error(`that's not a spool link: ${err.message}`)
  process.exit(1)
}

const file = argValue('--file') ?? `./${parsed.code}.spool.json`
const relay = parsed.relay ?? DEFAULT_RELAY
const log = (msg) => console.log(`[keeper ${parsed.code}] ${msg}`)

// restore-or-open: an existing file is the spool's last exported state —
// importSpool applies it (CRDT merge) and connects; otherwise start cold and
// let the room fill us in
const spool = existsSync(file)
  ? await importSpool(await readFile(file, 'utf8'), {
      relay,
      key: parsed.key,
      persist: false,
      author: 'keeper',
    })
  : await openSpool(link, { persist: false, author: 'keeper' })

log(
  `keeping ${spool.code}${spool.keyFingerprint ? ` (key ${spool.keyFingerprint}…)` : ' (keyless)'} → ${file}` +
    `${existsSync(file) ? ` — restored ${spool.entries.length} entries` : ''}`
)

// ---- export debounced-on-idle; atomic-ish via tmp+rename ----
let timer = null
let lastSaveAt = 0
let saving = Promise.resolve()

const save = () => {
  saving = saving.then(async () => {
    lastSaveAt = Date.now()
    await writeFile(`${file}.tmp`, spool.export())
    await rename(`${file}.tmp`, file)
  })
  return saving
}

const scheduleSave = () => {
  if (timer) clearTimeout(timer)
  const wait = Math.max(SAVE_DEBOUNCE_MS, lastSaveAt + SAVE_MIN_GAP_MS - Date.now())
  timer = setTimeout(() => {
    timer = null
    void save().catch((err) => log(`save failed: ${err.message}`))
  }, wait)
}

// every doc change schedules a save — body edits, history moments, all of it
spool.doc.on('update', scheduleSave)

// ---- quiet narration: counts only ----
spool.on('status', (s) => log(`relay: ${s}`))
spool.on('entry', () => log(`${spool.entries.length} entries held`))
spool.on('undecryptable', (n) => log(`${n} frames ignored (someone isn't on this key)`))
log(`relay: ${spool.status}`)

// ---- clean shutdown: final save, then leave (flushes the pocket too, if keyed) ----
let closing = false
const close = async (signal) => {
  if (closing) return
  closing = true
  log(`${signal} — saving and leaving`)
  if (timer) clearTimeout(timer)
  try {
    await save()
    await spool.leave()
  } catch (err) {
    log(`shutdown hiccup: ${err.message}`)
  }
  process.exit(0)
}
process.on('SIGINT', () => void close('SIGINT'))
process.on('SIGTERM', () => void close('SIGTERM'))
