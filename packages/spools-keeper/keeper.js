#!/usr/bin/env node
// spools-keeper: a headless client that keeps spools answered.
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
//   npx spools-keeper --links <file> [--dir <path>]
//
// One link keeps one spool. A links file (one link per line; lines starting
// with "# " are comments — a bare "#spool=…" is a link) keeps every spool on
// it, one export file per spool, beside the list unless --dir says where.
// Edit the list, restart the keeper: shutdown saves and leaves cleanly, so
// that's safe. A bad line is logged and skipped; the rest stay kept.
//
// Quote the link — it contains & characters. Logs carry counts, codes, and
// key fingerprints only: never content, never the key, never the full link.
// Every line is stamped (ISO UTC); a keyed spool says what the pocket did
// on open; a reconnect says which one and how long the socket was down; a
// heartbeat every ten minutes says the wall is still up.

import { readFile, writeFile, rename } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { openSpool, importSpool, parseSpoolLink, DEFAULT_RELAY } from 'spools'

const SAVE_DEBOUNCE_MS = 2_000
const SAVE_MIN_GAP_MS = 10_000
const HEARTBEAT_MS = Number(process.env.KEEPER_HEARTBEAT_MS) || 10 * 60_000

// every line through here: ISO UTC stamp, then the text
const say = (msg) => console.log(`${new Date().toISOString()} ${msg}`)

// ---- argv ----
const argv = process.argv.slice(2)
const positional = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'))
const argValue = (flag) => {
  const i = argv.indexOf(flag)
  return i !== -1 ? argv[i + 1] : undefined
}
const link = positional[0]
const linksFile = argValue('--links')

const usage = (why) => {
  if (why) console.error(why)
  console.error('usage: spools-keeper <link> [--file <path>]')
  console.error('       spools-keeper --links <file> [--dir <path>]')
  process.exit(1)
}
if (!link && !linksFile) usage()
if (link && linksFile) usage('give a link or --links <file>, not both')
if (linksFile && argValue('--file') !== undefined) usage('--file names one file; with --links use --dir <path>')
if (link && argValue('--dir') !== undefined) usage('--dir goes with --links; with one link use --file <path>')

// ---- keep one spool: restore-or-open, export debounced-on-idle, narrate counts ----
// Returns { spool, save, close }. Throws if the link is bad or the open fails;
// the caller decides whether that ends the process (one link) or just that
// peg (a list).
const keep = async (rawLink, { file: fileArg, dir } = {}) => {
  const parsed = parseSpoolLink(rawLink) // throws SpoolLinkError on garbage
  const file = fileArg ?? join(dir ?? '.', `${parsed.code}.spool.json`)
  const relay = parsed.relay ?? DEFAULT_RELAY
  const log = (msg) => say(`[keeper ${parsed.code}] ${msg}`)
  const restored = existsSync(file)

  // an existing file is the spool's last exported state — importSpool
  // applies it (CRDT merge) and connects; otherwise start cold and let the
  // room fill us in
  const spool = restored
    ? await importSpool(await readFile(file, 'utf8'), {
        relay,
        key: parsed.key,
        persist: false,
        author: 'keeper',
      })
    : await openSpool(rawLink, { persist: false, author: 'keeper' })

  log(
    `keeping ${spool.code}${spool.keyFingerprint ? ` (key ${spool.keyFingerprint}…)` : ' (keyless)'} → ${file}` +
      `${restored ? ` — restored ${spool.entries.length} entries` : ''}`
  )

  // export debounced-on-idle; atomic-ish via tmp+rename
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

  // quiet narration: counts only
  spool.on('entry', () => log(`${spool.entries.length} entries held`))
  spool.on('undecryptable', (n) => log(`${n} frames ignored (someone isn't on this key)`))
  spool.on('full', (reason) => log(`room full: ${reason}`))

  // status, with reconnects counted and timed per spool: a drop after the
  // first connect starts the clock; the next connect is a reconnect
  let reconnects = 0
  let everConnected = false
  let downSince = null
  spool.on('status', (s) => {
    if (s === 'connected') {
      if (downSince) {
        reconnects++
        log(`relay: connected — reconnect #${reconnects} after ${((Date.now() - downSince) / 1000).toFixed(1)} s offline`)
        downSince = null
      } else {
        log('relay: connected')
      }
      everConnected = true
    } else {
      if (everConnected && !downSince) downSince = Date.now()
      log(`relay: ${s}`)
    }
  })
  log(`relay: ${spool.status}`)

  // the pocket's verdict, once, in the SDK's words; and any deposit refusal
  // as it happens — the subscription outlives close() so a refused final
  // deposit (T-178) is narrated too. Keyless spools have no pocket: silent.
  let pocketTold = false
  let lastDepositError
  const tellPocket = (p) => {
    if (!p) return
    if (!pocketTold && p.phase !== 'checking') {
      pocketTold = true
      const applied = p.phase === 'applied' ? ` (${p.applied} deposit${p.applied === 1 ? '' : 's'})` : ''
      const dropped = p.dropped ? `, ${p.dropped} dropped` : ''
      log(`pocket: ${p.phase}${applied}${dropped}`)
    }
    if (p.depositError !== lastDepositError) {
      lastDepositError = p.depositError
      if (p.depositError) log(`pocket: deposit refused (${p.depositError})`)
    }
  }
  tellPocket(spool.pocket)
  spool.on('pocket', tellPocket)

  // final save, then leave (flushes the pocket too, if keyed)
  const close = async (signal) => {
    log(`${signal} — saving and leaving`)
    if (timer) clearTimeout(timer)
    try {
      await save()
      await spool.leave()
    } catch (err) {
      log(`shutdown hiccup: ${err.message}`)
    }
  }

  return { spool, save, close, reconnects: () => reconnects }
}

// ---- one link, or a list of them ----
const kept = []

if (link) {
  try {
    kept.push(await keep(link, { file: argValue('--file') }))
  } catch (err) {
    console.error(`that's not a spool link: ${err.message}`)
    process.exit(1)
  }
} else {
  const listPath = resolve(linksFile)
  let lines
  try {
    lines = (await readFile(listPath, 'utf8')).split('\n')
  } catch (err) {
    console.error(`can't read ${linksFile}: ${err.message}`)
    process.exit(1)
  }
  const dir = argValue('--dir') ?? dirname(listPath)
  const seen = new Set()
  let failed = 0
  let tried = 0
  for (const [i, raw] of lines.entries()) {
    const line = raw.trim()
    if (line === '' || /^#(\s|$)/.test(line)) continue
    tried++
    const at = `line ${i + 1}`
    let code
    try {
      code = parseSpoolLink(line).code
    } catch {
      // no err.message here: the SDK echoes the offending text, and the
      // list's contents stay out of the log — the line number is enough
      say(`[keeper ${at}] skipped — that's not a spool link`)
      failed++
      continue
    }
    if (seen.has(code)) {
      say(`[keeper ${at}] skipped — ${code} is already on the list`)
      continue
    }
    seen.add(code)
    try {
      kept.push(await keep(line, { dir }))
    } catch (err) {
      say(`[keeper ${code}] skipped — couldn't open: ${err.message}`)
      failed++
    }
  }
  say(`[keeper] keeping ${kept.length} spool${kept.length === 1 ? '' : 's'} from ${linksFile}` +
    `${failed ? ` (${failed} failed)` : ''}`)
  if (kept.length === 0) {
    console.error(tried ? 'nothing on the list could be opened' : `nothing on the list: ${linksFile}`)
    process.exit(1)
  }
}

// ---- heartbeat: one line for the whole wall, so silence is never ambiguous ----
const startedAt = Date.now()
const uptime = () => {
  const m = Math.floor((Date.now() - startedAt) / 60_000)
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}m`
}
const heartbeat = setInterval(() => {
  const pegs = kept.map((k) => `${k.spool.code} ${k.spool.entries.length} held, ${k.reconnects()} reconnects`)
  say(`[keeper] up ${uptime()} · ${pegs.join(' · ')}`)
}, HEARTBEAT_MS)
heartbeat.unref()

// ---- clean shutdown: every spool saves and leaves, in parallel, then exit ----
let closing = false
const closeAll = async (signal) => {
  if (closing) return
  closing = true
  clearInterval(heartbeat)
  await Promise.allSettled(kept.map((k) => k.close(signal)))
  process.exit(0)
}
process.on('SIGINT', () => void closeAll('SIGINT'))
process.on('SIGTERM', () => void closeAll('SIGTERM'))
