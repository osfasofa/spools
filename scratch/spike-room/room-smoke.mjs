// T-113 acceptance: apps/room, two origins, one local relay, headless Chrome.
//
//  1. A and B converge on a conversation (real keystrokes through the
//     composer, both directions).
//  2. B's composer keeps focus AND its half-typed draft through peer traffic.
//  3. Reserved room:* kinds are invisible; unknown kinds render the labeled
//     fallback; nothing breaks.
//  4. 375×667 with zero horizontal overflow; self bubbles right / other
//     bubbles left with a seat tile.
//
// Harness idiom from scratch/torture-t104/midnight.mjs (raw CDP, no deps).
// Run (repo root, after `pnpm build` in apps/room):
//   mise x -- node scratch/spike-room/room-smoke.mjs

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// the built SDK, for the export round-trip (T-163): importSpool runs in plain
// Node with persist:false and no relay — the file must open where no browser is
import { importSpool } from '../../packages/spools/dist/index.js'

const CHROME = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CDP_PORT = 9347
const RELAY_PORT = 9471
const ORIGINS = [8791, 8792, 8793] // device A, device B, device C (T-114)
const here = new URL('.', import.meta.url)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------- static server for apps/room/dist ----------

const serveDist = (port) =>
  new Promise((resolve) => {
    const root = new URL('../../apps/room/dist/', import.meta.url)
    const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml' }
    const srv = createServer(async (req, res) => {
      const path = req.url === '/' ? 'index.html' : req.url.slice(1).split('?')[0]
      try {
        const data = await readFile(new URL(path, root))
        res.setHeader('content-type', types[path.split('.').pop()] ?? 'application/octet-stream')
        res.end(data)
      } catch {
        res.statusCode = 404
        res.end('not found')
      }
    })
    srv.listen(port, () => resolve(srv))
  })

// ---------- minimal CDP Tab (verbatim idiom from torture-t021/t104) ----------

class Tab {
  static async open(url, { width = 375, height = 667, patch } = {}) {
    const info = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' })).json()
    const tab = new Tab()
    tab.id = info.id
    tab.errors = []
    tab.ws = new WebSocket(info.webSocketDebuggerUrl)
    await new Promise((r) => tab.ws.addEventListener('open', r))
    tab.msgId = 0
    tab.pending = new Map()
    tab.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && tab.pending.has(msg.id)) {
        tab.pending.get(msg.id)(msg)
        tab.pending.delete(msg.id)
      } else if (msg.method === 'Runtime.exceptionThrown') {
        tab.errors.push(msg.params.exceptionDetails?.exception?.description ?? 'exception')
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        tab.errors.push(msg.params.args.map((a) => a.value ?? a.description ?? '?').join(' '))
      }
    })
    await tab.call('Runtime.enable')
    await tab.call('Page.enable')
    await tab.call('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: true,
    })
    if (patch) await tab.call('Page.addScriptToEvaluateOnNewDocument', { source: patch })
    await tab.call('Page.navigate', { url })
    return tab
  }

  call(method, params = {}) {
    const id = ++this.msgId
    return new Promise((resolve, reject) => {
      this.pending.set(id, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)))
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  async eval(expression) {
    const { result, exceptionDetails } = await this.call('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'page exception')
    return result.value
  }

  async until(expression, timeoutMs, label = expression) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      try {
        if (await this.eval(expression)) return Date.now() - (deadline - timeoutMs)
      } catch {
        // context mid-navigation — keep polling
      }
      await sleep(300)
    }
    throw new Error(`timeout (${timeoutMs} ms) waiting for: ${label}`)
  }

  ready(timeoutMs = 15_000) {
    return this.until('!!window.spool', timeoutMs, 'room app ready')
  }

  /** real keystrokes: focus the composer, insert text, press Enter */
  async typeAndSend(text) {
    await this.eval(`document.querySelector('.composerInput').focus()`)
    await this.call('Input.insertText', { text })
    // the text field makes it a real keypress — without it Chrome treats the
    // event as rawKeyDown and never runs implicit form submission
    await this.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', windowsVirtualKeyCode: 13 })
    await this.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  }

  async close() {
    this.ws.close()
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${this.id}`)
  }
}

// ---------- scenario plumbing ----------

const results = []
const scenario = async (name, fn) => {
  process.stdout.write(`\n▶ ${name}\n`)
  try {
    const detail = await fn()
    results.push({ name, pass: true, detail: detail ?? '' })
    console.log(`  PASS ${detail ?? ''}`)
  } catch (err) {
    results.push({ name, pass: false, detail: err.message })
    console.log(`  FAIL ${err.message}`)
  }
}

const code = `room-smoke-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
const keyB64 = randomBytes(32).toString('base64url')
const linkFor = (origin) =>
  `http://localhost:${origin}/#spool=${code}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}&k=${keyB64}`

// ---------- run ----------

const servers = await Promise.all(ORIGINS.map(serveDist))
const relay = await new Promise((resolve) => {
  const proc = spawn(process.execPath, [new URL('../../packages/spools-relay/server.js', here).pathname], {
    stdio: ['ignore', 'pipe', 'inherit'],
    env: { ...process.env, PORT: String(RELAY_PORT), HOST: '127.0.0.1' },
  })
  proc.stdout.once('data', () => resolve(proc))
})
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${join(tmpdir(), `t113-profile-${Date.now()}`)}`,
    '--no-first-run',
  ],
  { stdio: 'ignore' }
)
for (let i = 0; i < 40; i++) {
  try {
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)
    break
  } catch {
    await sleep(250)
  }
}

let a, b

await scenario('1. two origins converge through the composer, both directions', async () => {
  a = await Tab.open(linkFor(ORIGINS[0]))
  await a.ready()
  b = await Tab.open(linkFor(ORIGINS[1]))
  await b.ready()
  await a.typeAndSend('hello from A')
  const t1 = await b.until(
    `[...document.querySelectorAll('.bubble')].some(el => el.textContent === 'hello from A')`,
    15_000,
    'B renders A’s message'
  )
  await b.typeAndSend('hello back from B')
  await a.until(
    `[...document.querySelectorAll('.bubble')].some(el => el.textContent === 'hello back from B')`,
    15_000,
    'A renders B’s message'
  )
  return `converged both ways (~${t1} ms first hop)`
})

await scenario('2. composer keeps focus and draft through peer traffic', async () => {
  await b.eval(`document.querySelector('.composerInput').focus()`)
  await b.call('Input.insertText', { text: 'half a thought…' })
  await a.typeAndSend('noise 1')
  await a.typeAndSend('noise 2')
  await a.typeAndSend('noise 3')
  await b.until(
    `[...document.querySelectorAll('.bubble')].filter(el => el.textContent.startsWith('noise')).length === 3`,
    15_000,
    'B renders the noise'
  )
  const focused = await b.eval(`document.activeElement === document.querySelector('.composerInput')`)
  const draft = await b.eval(`document.querySelector('.composerInput').value`)
  if (!focused) throw new Error('composer lost focus during peer traffic')
  if (draft !== 'half a thought…') throw new Error(`draft mangled: "${draft}"`)
  return 'focus held, draft intact through 3 peer messages'
})

await scenario('3. reserved kinds invisible, unknown kinds labeled, nothing breaks', async () => {
  await a.eval(`window.spool.wind({ kind: 'room:name', body: 'the lounge' })`)
  await a.eval(`window.spool.wind({ kind: 'mixtape-track', body: 'an entry from some other client' })`)
  await b.until(
    `[...document.querySelectorAll('.systemLine')].some(el => el.textContent.includes('an entry from some other client'))`,
    15_000,
    'B renders the unknown-kind fallback'
  )
  // the room NAME renders in the header (that's T-122's job) — the leak we
  // guard against is a room:* entry showing up as feed content
  const reservedVisible = await b.eval(
    `[...document.querySelectorAll('.bubble, .systemLine')].some(el => el.textContent.includes('the lounge'))`
  )
  if (reservedVisible) throw new Error('reserved room:* entry leaked into the feed')
  const label = await b.eval(
    `[...document.querySelectorAll('.kindLabel')].some(el => el.textContent === 'mixtape-track')`
  )
  if (!label) throw new Error('unknown kind rendered without its label')
  return 'room:name hidden; mixtape-track shown as labeled fallback'
})

await scenario('4. mobile layout: 375×667, alignment, tiles, no sideways scroll', async () => {
  const overflow = await a.eval(`document.documentElement.scrollWidth > document.documentElement.clientWidth`)
  if (overflow) throw new Error('horizontal overflow at 375px')
  const mineRight = await a.eval(`(() => {
    const el = [...document.querySelectorAll('.bubble.mine')].pop()
    if (!el) return false
    const r = el.getBoundingClientRect()
    return r.right > window.innerWidth / 2
  })()`)
  const themLeft = await b.eval(`(() => {
    const el = [...document.querySelectorAll('.bubble.them')].pop()
    if (!el) return false
    const r = el.getBoundingClientRect()
    return r.left < window.innerWidth / 2
  })()`)
  const tile = await b.eval(`document.querySelectorAll('.seatTile').length > 0`)
  const composerVisible = await a.eval(`(() => {
    const r = document.querySelector('.composer').getBoundingClientRect()
    return r.bottom <= window.innerHeight + 1 && r.height >= 44
  })()`)
  if (!mineRight) throw new Error('own bubbles are not right-aligned')
  if (!themLeft) throw new Error('peer bubbles are not left-aligned')
  if (!tile) throw new Error('no seat tile rendered beside a peer group')
  if (!composerVisible) throw new Error('composer not visible within the viewport')
  if (a.errors.length || b.errors.length) throw new Error(`page errors: ${[...a.errors, ...b.errors].join(' | ')}`)
  return 'aligned, tiled, no overflow, composer on-screen, 0 page errors'
})

// ---------- T-114: seats + the profile table ----------

/** set a React-controlled input: native setter + bubbled input event */
const SET_INPUT = `(el, value) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}`

let c

await scenario('5. rename on B applies retroactively on cold-opened C, survives B reload', async () => {
  const aSeat = await a.eval(`localStorage.getItem('spool-seat')`)
  const suffix = `#${aSeat.slice(-4).toLowerCase()}`

  // B renames A through the settings UI: people row → input → blur commits
  await b.eval(`document.querySelector('.headerTitle').click()`)
  await b.until(`document.querySelectorAll('.personRow').length >= 2`, 10_000, 'people section lists both seats')
  const renamed = await b.eval(`(() => {
    const row = [...document.querySelectorAll('.personRow')].find(r =>
      r.querySelector('.personSeatId').textContent.startsWith('${suffix}'))
    if (!row) return false
    const input = row.querySelector('.personName')
    input.focus()
    ;(${SET_INPUT})(input, 'zora')
    input.blur()
    return true
  })()`)
  if (!renamed) throw new Error(`no people row found for ${suffix} on B`)
  await b.eval(`document.querySelector('.headerBtn').click()`) // back to the room

  // C cold-opens on a third origin: A's OLD messages must show the new name
  c = await Tab.open(linkFor(ORIGINS[2]))
  await c.ready()
  await c.until(
    `[...document.querySelectorAll('.senderName')].some(el => el.textContent === 'zora')`,
    15_000,
    "C sees A's old messages under the new name"
  )
  const stale = await c.eval(
    `[...document.querySelectorAll('.senderName')].some(el => el.textContent.startsWith('#'))
       && [...document.querySelectorAll('.senderSuffix')].length === 0`
  )
  if (stale) throw new Error('C still renders bare seat ids for named seats')

  // no name string ever lands inside a message entry (the fosho anti-pattern)
  const clean = await c.eval(`window.spool.entries
    .filter(e => e.kind === 'message')
    .every(e => { const keys = Object.keys(e.data ?? {}); return keys.length === 1 && keys[0] === 'seat' })`)
  if (!clean) throw new Error('a message entry carries more than data.seat')

  // B reloads: the rename came back from its own IndexedDB, not the session
  // (Page.reload — a same-URL navigate with a fragment is a same-document no-op)
  await b.eval(`window.__oldPage = true`)
  await b.call('Page.reload')
  await b.until(`!window.__oldPage && !!window.spool`, 15_000, 'B truly reloaded')
  await b.until(
    `[...document.querySelectorAll('.senderName')].some(el => el.textContent === 'zora')`,
    10_000,
    'rename survives B reload'
  )
  return 'renamed via UI on B; retroactive on cold C; message entries clean; survived reload'
})

await scenario('6. concurrent renames of the same seat converge newest-wins everywhere', async () => {
  const bSeat = await b.eval(`localStorage.getItem('spool-seat')`)
  await Promise.all([
    a.eval(`window.spool.wind({ kind: 'room:profile', body: 'zig', data: { seat: '${bSeat}' } })`),
    c.eval(`window.spool.wind({ kind: 'room:profile', body: 'zag', data: { seat: '${bSeat}' } })`),
  ])
  const resolver = `(() => {
    const profs = window.spool.entries.filter(e => e.kind === 'room:profile' && e.data?.seat === '${bSeat}')
    return profs.length ? profs[profs.length - 1].body : null
  })()`
  await a.until(`${resolver} !== null`, 10_000, 'A has profile entries')
  const settle = Date.now() + 8000
  let names = []
  while (Date.now() < settle) {
    names = await Promise.all([a.eval(resolver), b.eval(resolver), c.eval(resolver)])
    if (names[0] && names[0] === names[1] && names[1] === names[2]) break
    await sleep(300)
  }
  if (!(names[0] && names[0] === names[1] && names[1] === names[2])) {
    throw new Error(`did not converge: ${names.join(' / ')}`)
  }
  // and the DOM agrees with the resolver on a device that didn't write it
  await a.until(
    `[...document.querySelectorAll('.senderName')].some(el => el.textContent === '${names[0]}')`,
    10_000,
    'A renders the winning name'
  )
  if (a.errors.length || b.errors.length || c.errors.length) {
    throw new Error(`page errors: ${[...a.errors, ...b.errors, ...c.errors].join(' | ')}`)
  }
  return `all three devices agree on "${names[0]}" (newest-wins), DOM matches, 0 page errors`
})

// ---------- T-118: reactions + replies ----------

const bubbleSel = (text) => `[...document.querySelectorAll('.bubble')].find(el => el.textContent.includes(${JSON.stringify(text)}))`

await scenario('9. reactions: toggle round-trip, skin-tone grouping, duplicate dedupe', async () => {
  // B reacts 👍 to A's first message through the sheet
  await b.eval(`${bubbleSel('hello from A')}.click()`)
  await b.until(`!!document.querySelector('.sheet')`, 5_000, 'action sheet opens')
  await b.eval(`[...document.querySelectorAll('.sheetReact')].find(el => el.textContent === '👍').click()`)
  const chipOn = (tab) =>
    tab.until(
      `(() => { const bub = ${bubbleSel('hello from A')}; const row = bub?.parentElement.querySelector('.reactionRow'); return !!row && row.textContent.includes('👍') })()`,
      10_000,
      'reaction chip renders'
    )
  await chipOn(a)
  await chipOn(b)

  // toggle off: tap the chip on B → gone on both sides
  await b.eval(`(() => { const bub = ${bubbleSel('hello from A')}; bub.parentElement.querySelector('.reactionChip').click() })()`)
  await a.until(
    `(() => { const bub = ${bubbleSel('hello from A')}; return !bub.parentElement.querySelector('.reactionRow') })()`,
    10_000,
    'un-react propagates'
  )

  // skin tone: B reacts 👍🏽 via the custom input — groups as 👍
  await b.eval(`${bubbleSel('hello from A')}.click()`)
  await b.until(`!!document.querySelector('.sheetCustomInput')`, 5_000, 'sheet again')
  await b.eval(`(() => {
    const input = document.querySelector('.sheetCustomInput')
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(input, '👍🏽')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    document.querySelector('.sheetCustomGo').click()
    document.querySelector('.sheetBackdrop')?.click()
  })()`)
  await chipOn(a)

  // A reacts 👍 too → count 2 on one grouped chip
  await a.eval(`${bubbleSel('hello from A')}.click()`)
  await a.until(`!!document.querySelector('.sheet')`, 5_000, 'sheet on A')
  await a.eval(`[...document.querySelectorAll('.sheetReact')].find(el => el.textContent === '👍').click()`)
  await b.until(
    `(() => { const bub = ${bubbleSel('hello from A')}; const chips = bub?.parentElement.querySelectorAll('.reactionChip'); return chips?.length === 1 && chips[0].textContent.includes('2') })()`,
    10_000,
    'one grouped chip counts 2'
  )

  // duplicate entries from one seat (offline-dupe shape) must not double-count
  await b.eval(`(() => {
    const target = window.spool.entries.find((e) => e.kind === 'message' && e.body === 'hello from A')
    const seat = localStorage.getItem('spool-seat')
    window.spool.wind({ kind: 'reaction', parent: target.id, body: '💀', data: { seat } })
    window.spool.wind({ kind: 'reaction', parent: target.id, body: '💀', data: { seat } })
  })()`)
  await a.until(
    `(() => { const bub = ${bubbleSel('hello from A')}; const chip = [...bub.parentElement.querySelectorAll('.reactionChip')].find(c => c.textContent.includes('💀')); return !!chip && !chip.textContent.includes('2') })()`,
    10_000,
    'duplicate reactions collapse to one'
  )
  return '👍 toggled on/off across devices; 👍🏽 grouped into 👍 (count 2 with A); duplicate 💀 entries collapsed'
})

await scenario('10. replies: quote, jump, and orphan stubs', async () => {
  // B replies to A's message through the sheet
  await b.eval(`${bubbleSel('hello from A')}.click()`)
  await b.until(`!!document.querySelector('.sheet')`, 5_000, 'sheet opens')
  await b.eval(`[...document.querySelectorAll('.sheetAction')].find(el => el.textContent.includes('reply')).click()`)
  await b.until(`!!document.querySelector('.replyBanner')`, 5_000, 'reply banner shows')
  await b.typeAndSend('replying to the first thing you said')
  await a.until(
    `(() => { const bub = ${bubbleSel('replying to the first thing')}; return !!bub?.querySelector('.replyQuote')?.textContent.includes('hello from A') })()`,
    10_000,
    'A renders the quoted reply'
  )
  // quote names the sender via the profile resolver (A's seat is "zora")
  const quoted = await a.eval(`${bubbleSel('replying to the first thing')}.querySelector('.replyQuote').textContent`)
  if (!quoted.startsWith('zora:')) throw new Error(`quote is "${quoted}" — expected the resolved name`)

  // tap-to-jump exists and doesn't throw (structural lookup, small feed)
  await a.eval(`${bubbleSel('replying to the first thing')}.querySelector('.replyQuote').click()`)

  // orphan 1: parent hidden (soft-deleted) → quote degrades to "hidden"
  await a.eval(`window.spool.entries.find((e) => e.kind === 'message' && e.body === 'hello from A').delete()`)
  await b.until(
    `(() => { const bub = ${bubbleSel('replying to the first thing')}; return bub?.querySelector('.replyQuote')?.textContent === 'hidden' })()`,
    10_000,
    'hidden parent renders the hidden stub'
  )
  // orphan 2: parent that never synced → "not synced yet"
  await b.eval(`window.spool.wind({ kind: 'message', body: 'reply into the void', data: { seat: localStorage.getItem('spool-seat') }, parent: 'never-going-to-exist' })`)
  await b.until(
    `(() => { const bub = ${bubbleSel('reply into the void')}; return bub?.querySelector('.replyQuote')?.textContent === 'not synced yet' })()`,
    10_000,
    'missing parent renders the not-synced stub'
  )
  // restore the deleted message so later scenarios see a stable world
  await a.eval(`window.spool.deleted.find((e) => e.body === 'hello from A')?.restore()`)
  if (a.errors.length || b.errors.length) throw new Error(`page errors: ${[...a.errors, ...b.errors].join(' | ')}`)
  return 'quote resolves via profiles; jump works; hidden + not-synced stubs render; 0 page errors'
})

// ---------- T-119: presence ----------

await scenario('11. presence: dots for everyone, typing transitions, zero doc bytes, fast drop', async () => {
  // all three seats should be visible in awareness (heartbeats have long flowed)
  await a.until(`document.querySelector('.presenceLine')?.textContent.includes('3 here')`, 25_000, 'A counts 3 seats here')
  await a.eval(`document.querySelector('.presenceLine').click()`)
  await a.until(`document.querySelectorAll('.peopleDrawer .onlineDot').length >= 3`, 10_000, 'drawer shows 3 online dots')
  await a.eval(`document.querySelector('.peopleDrawer').click()`) // tap anywhere collapses

  // pure typing (no send) must move ZERO doc bytes. Baseline only once the
  // doc has settled — earlier scenarios' history moments land debounced and
  // would otherwise be misread as presence traffic
  let bytesBefore = await a.eval(`window.spool.export().length`)
  for (let i = 0; i < 8; i++) {
    await sleep(4_000)
    const now = await a.eval(`window.spool.export().length`)
    if (now === bytesBefore) break
    bytesBefore = now
  }
  await b.eval(`document.querySelector('.composerInput').focus()`)
  await b.call('Input.insertText', { text: 'thinking about what to say' })
  await a.until(`!!document.querySelector('.typingBubble')`, 8_000, 'A sees B typing')
  await a.until(`!document.querySelector('.typingBubble')`, 10_000, 'typing clears on idle (~3 s)')
  const bytesAfter = await a.eval(`window.spool.export().length`)
  if (bytesBefore !== bytesAfter) throw new Error(`typing moved the doc: ${bytesBefore} → ${bytesAfter} bytes`)
  // clear B's leftover draft so it doesn't pollute later sends
  await b.eval(`(() => {
    const input = document.querySelector('.composerInput')
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(input, '')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)

  // send clears typing immediately (the message says it all)
  await b.typeAndSend('done thinking')
  await a.until(
    `!document.querySelector('.typingBubble') && [...document.querySelectorAll('.bubble')].some(el => el.textContent === 'done thinking')`,
    8_000,
    'send clears typing and lands the message'
  )

  // clean tab close drops the seat fast (pagehide), long before the 30 s timeout
  await c.close()
  const t0 = Date.now()
  await a.until(`document.querySelector('.presenceLine')?.textContent.includes('2 here')`, 8_000, 'closed tab drops from presence')
  if (a.errors.length || b.errors.length) throw new Error(`page errors: ${[...a.errors, ...b.errors].join(' | ')}`)
  return `3 dots → typing bubble → idle clear (0 doc bytes moved) → send clears → close dropped in ~${((Date.now() - t0) / 1000).toFixed(1)} s`
})

// ---------- T-120: edit, hide (soft delete), the honest contract ----------

await scenario('12. edit-own, hide for everyone, restore, cross-writer honesty', async () => {
  // B edits its own message through the sheet: prefilled draft → rewrite
  await b.eval(`${bubbleSel('done thinking')}.click()`)
  await b.until(`[...document.querySelectorAll('.sheetAction')].some(el => el.textContent.includes('edit'))`, 5_000, 'own message offers edit')
  await b.eval(`[...document.querySelectorAll('.sheetAction')].find(el => el.textContent.includes('edit')).click()`)
  await b.until(`document.querySelector('.replyBanner')?.textContent.includes('editing')`, 5_000, 'edit banner shows')
  const prefilled = await b.eval(`document.querySelector('.composerInput').value`)
  if (prefilled !== 'done thinking') throw new Error(`draft not prefilled: "${prefilled}"`)
  await b.eval(`(() => {
    const input = document.querySelector('.composerInput')
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(input, 'done thinking twice')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.focus()
  })()`)
  await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', windowsVirtualKeyCode: 13 })
  await b.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  await a.until(
    `(() => { const bub = ${bubbleSel('done thinking twice')}; return !!bub && bub.querySelector('.editedMark')?.textContent.includes('edited') })()`,
    10_000,
    'A sees the edit + marker'
  )

  // B hides a message → tombstone on A, never a silent vanish. The label
  // says what the mechanism does (T-162): no user-facing string says remove
  await b.eval(`${bubbleSel('reply into the void')}.click()`)
  await b.until(`[...document.querySelectorAll('.sheetAction')].some(el => el.textContent.includes('hide for everyone'))`, 5_000, 'own message offers "hide for everyone"')
  const removeWord = await b.eval(`[...document.querySelectorAll('.sheetAction')].some(el => /remove/i.test(el.textContent))`)
  if (removeWord) throw new Error('the action sheet still says "remove" — T-162 says hide')
  await b.eval(`[...document.querySelectorAll('.sheetAction')].find(el => el.textContent.includes('hide for everyone')).click()`)
  await a.until(`!!document.querySelector('.tombstone')`, 10_000, 'tombstone renders on A')
  const tombstoneText = await a.eval(`document.querySelector('.tombstone').textContent`)
  if (tombstoneText !== 'hidden · anyone can restore') throw new Error(`tombstone reads "${tombstoneText}"`)
  // the first hide on a device explains itself, once (localStorage-gated)
  await b.until(
    `document.querySelector('.hideExplained')?.textContent.includes('every copy keeps it and rewind still shows it')`,
    5_000,
    'the one-time hide explainer shows on the hiding device'
  )
  const explained = await b.eval(`localStorage.getItem('room-hide-explained')`)
  if (explained !== '1') throw new Error(`room-hide-explained is ${explained}, expected "1"`)
  await b.eval(`document.querySelector('.noticeClose').click()`)
  const explainerGone = await b.eval(`!document.querySelector('.hideExplained')`)
  if (!explainerGone) throw new Error('the hide explainer did not dismiss')

  // anyone can restore from the tombstone's sheet (the honest contract cuts both ways)
  await a.eval(`document.querySelector('.tombstone').click()`)
  await a.until(`[...document.querySelectorAll('.sheetAction')].some(el => el.textContent.includes('restore'))`, 5_000, 'tombstone offers restore')
  await a.eval(`[...document.querySelectorAll('.sheetAction')].find(el => el.textContent.includes('restore')).click()`)
  await b.until(`!!${bubbleSel('reply into the void')}`, 10_000, 'restore round-trips to B')

  // cross-writer reality: A rewrites B's message (the protocol allows it;
  // the app just doesn't offer it) — rendering stays coherent + attributable
  await a.eval(`(() => {
    const target = window.spool.entries.find((e) => e.kind === 'message' && e.body === 'hello back from B')
    target.body = 'rewritten by someone else'
    window.spool.wind({ kind: 'room:edit', parent: target.id, data: { seat: localStorage.getItem('spool-seat') } })
  })()`)
  await b.until(
    `(() => { const bub = ${bubbleSel('rewritten by someone else')}; return !!bub?.querySelector('.editedMark') })()`,
    10_000,
    "B sees its own message rewritten, marked edited"
  )
  const attributed = await b.eval(`${bubbleSel('rewritten by someone else')}.querySelector('.editedMark').title`)
  if (!attributed.includes('zora')) throw new Error(`edit not attributed to the editor: "${attributed}"`)

  // the honest sentence, findable where members look
  await a.eval(`document.querySelector('.headerTitle').click()`)
  await a.until(
    `document.querySelector('.finePrint')?.textContent.includes('anyone with the link can edit or delete anything')`,
    5_000,
    'the honest sentence is in settings'
  )
  await a.eval(`document.querySelector('.headerBtn').click()`)
  if (a.errors.length || b.errors.length) throw new Error(`page errors: ${[...a.errors, ...b.errors].join(' | ')}`)
  return `edit prefilled+marked; hide → "hidden · anyone can restore" → restore round-trip; explainer shown once; cross-writer edit attributed ("${attributed}"); honest sentence present`
})

// ---------- T-121: ephemeral read receipts (the D4 decision) ----------

await scenario('13. seen markers: ephemeral, positioned, vanish with the tab, zero doc entries', async () => {
  // only the front tab is document.visibilityState === 'visible' in one
  // browser — bring each side forward before expecting its marker
  await b.call('Page.bringToFront')
  await sleep(2_500) // read broadcasts are throttled to one per 2 s
  const markerAtNewest = `(() => {
    const rows = [...document.querySelectorAll('.seenRow')]
    if (rows.length === 0) return false
    const wrappers = [...document.querySelectorAll('[data-rid]')]
    return rows.every((r) => r.closest('[data-rid]') === wrappers[wrappers.length - 1])
  })()`
  await a.until(markerAtNewest, 10_000, "A shows B's marker under the newest message")

  // the amended D3, structurally: NOTHING about reading is in the doc
  const cleanDoc = await a.eval(
    `window.spool.entries.every((e) => e.kind !== 'room:read') && !window.spool.export().includes('room:read')`
  )
  if (!cleanDoc) throw new Error('a room:read entry leaked into the doc — D4 says awareness only')

  // A reads too — B sees A's marker land on the newest message
  await a.call('Page.bringToFront')
  await sleep(2_500)
  await b.until(markerAtNewest, 10_000, "B shows A's marker under the newest message")

  // close B: its marker vanishes from A (presence removal, not a timeout)
  await b.close()
  await a.until(`document.querySelectorAll('.seenRow').length === 0`, 8_000, "B's marker vanishes with its tab")
  if (a.errors.length) throw new Error(`page errors: ${a.errors.join(' | ')}`)
  return "markers at the newest message both ways; zero room:read entries in the doc; marker died with B's tab"
})

// ---------- T-122: room name (shared) + themes (per-device) ----------

await scenario('14. shared name renames live + audited; themes never leave the device', async () => {
  // scenario 3 wound room:name "the lounge" — the header should show it
  await a.until(`document.querySelector('.headerTitle')?.textContent === 'the lounge'`, 8_000, 'existing room:name renders in the header')

  // A renames through settings; commit on blur
  await a.eval(`document.querySelector('.headerTitle').click()`)
  await a.until(`!!document.querySelector('.roomNameInput')`, 5_000, 'name input in settings')
  await a.eval(`(() => {
    const input = document.querySelector('.roomNameInput')
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    input.focus()
    setter.call(input, 'midnight picnic')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.blur()
  })()`)
  await a.eval(`document.querySelector('.headerBtn').click()`)
  await a.until(`document.querySelector('.headerTitle')?.textContent === 'midnight picnic'`, 8_000, 'A header renamed')
  const title = await a.eval('document.title')
  if (title !== 'midnight picnic') throw new Error(`document.title is "${title}"`)

  // B reopens (fresh load ≙ reload): sees the shared name + the audit line
  b = await Tab.open(linkFor(ORIGINS[1]))
  await b.ready()
  await b.until(`document.querySelector('.headerTitle')?.textContent === 'midnight picnic'`, 10_000, 'B sees the shared name')
  await b.eval(`document.querySelector('.headerTitle').click()`)
  await b.until(`document.querySelector('.settingsBody')?.textContent.includes('named by zora')`, 5_000, 'audit line names the renamer')

  // theme: B picks terminal — instant, persistent, and never A's problem
  await b.eval(`[...document.querySelectorAll('.themeCard')].find(el => el.textContent.includes('terminal')).click()`)
  const bBg = await b.eval(`getComputedStyle(document.body).backgroundColor`)
  if (bBg !== 'rgb(10, 13, 10)') throw new Error(`B background after terminal pick: ${bBg}`)
  // same-URL navigate is a same-document no-op when a fragment is involved —
  // Page.reload forces the real thing; the marker proves it happened
  await b.eval(`window.__oldPage = true`)
  await b.call('Page.reload')
  await b.until(`!window.__oldPage && !!window.spool`, 15_000, 'B truly reloaded')
  const bBg2 = await b.eval(`getComputedStyle(document.body).backgroundColor`)
  if (bBg2 !== 'rgb(10, 13, 10)') throw new Error(`B theme did not survive reload: ${bBg2}`)
  const aBg = await a.eval(`getComputedStyle(document.body).backgroundColor`)
  if (aBg !== 'rgb(0, 0, 0)') throw new Error(`A's theme moved: ${aBg} — themes must not sync`)

  // concurrent renames converge newest-wins on both devices
  await Promise.all([
    a.eval(`window.spool.wind({ kind: 'room:name', body: 'name a', data: { seat: localStorage.getItem('spool-seat') } })`),
    b.eval(`window.spool.wind({ kind: 'room:name', body: 'name b', data: { seat: localStorage.getItem('spool-seat') } })`),
  ])
  await sleep(1500)
  const names = [
    await a.eval(`document.querySelector('.headerTitle').textContent`),
    await b.eval(`document.querySelector('.headerTitle').textContent`),
  ]
  if (names[0] !== names[1]) throw new Error(`headers diverged: ${names.join(' vs ')}`)
  if (a.errors.length || b.errors.length) throw new Error(`page errors: ${[...a.errors, ...b.errors].join(' | ')}`)
  return `rename live + audited; theme per-device (survived reload, never synced); concurrent renames agree on "${names[0]}"`
})

// ---------- T-123: unread + in-tab notifications ----------

await scenario('15. background badge, unread divider on open, opt-in only, mute, honest sentence', async () => {
  // A goes to the background; B sends → A's title carries the count
  await b.call('Page.bringToFront')
  await sleep(400)
  const noAmbush = await a.eval(`typeof Notification === 'undefined' || Notification.permission === 'default'`)
  if (!noAmbush) throw new Error('notification permission was requested without the user asking')
  await b.typeAndSend('unseen one')
  await b.typeAndSend('unseen two')
  await a.until(`document.title.startsWith('(2) ')`, 10_000, 'A badges (2) while hidden')
  const favicon = await a.eval(`document.querySelector('link[rel="icon"]')?.href.startsWith('data:image/png')`)
  if (!favicon) throw new Error('favicon badge missing')

  // focus clears the badge
  await a.call('Page.bringToFront')
  await a.until(`!document.title.startsWith('(')`, 8_000, 'badge clears on focus')

  // fresh open on the same device: the divider sits before the first unseen
  // message. A's durable last-seen predates them because A was hidden when
  // they arrived — background it again BEFORE closing so nothing gets seen.
  await b.call('Page.bringToFront')
  await sleep(300)
  await b.typeAndSend('unseen three')
  await sleep(800)
  await a.close()
  const d = await Tab.open(linkFor(ORIGINS[0]))
  await d.ready()
  await d.until(
    `(() => {
      const div = document.querySelector('.unreadDivider')
      if (!div) return false
      const wrapper = div.closest('[data-rid]')
      return !!wrapper && wrapper.textContent.includes('unseen three')
    })()`,
    10_000,
    'divider lands before the first message A never saw (one+two were seen at the badge-clear focus)'
  )

  // mute is a per-device toggle; the honest closed-tab sentence is findable
  await d.eval(`document.querySelector('.headerTitle').click()`)
  await d.until(`!!document.querySelector('.settingsBody')`, 5_000, 'settings open')
  const honest = await d.eval(
    `document.querySelector('.settingsBody').textContent.includes('there is no server to call you back')`
  )
  if (!honest) throw new Error('the honest closed-tab sentence is missing')
  const enableThere = await d.eval(
    `[...document.querySelectorAll('button')].some(el => el.textContent === 'enable notifications')`
  )
  if (!enableThere) throw new Error('notifications are not an explicit opt-in button')
  await d.eval(`[...document.querySelectorAll('button')].find(el => el.textContent.includes('mute this device')).click()`)
  const mutedStored = await d.eval(`localStorage.getItem('room-muted')`)
  if (mutedStored !== '1') throw new Error('mute did not persist')
  await d.eval(`document.querySelector('.headerBtn').click()`)
  if (d.errors.length || b.errors.length) throw new Error(`page errors: ${[...d.errors, ...b.errors].join(' | ')}`)
  a = d // the closing block takes it from here
  return 'badge (2) while hidden + favicon; cleared on focus; divider before first unseen on reopen; opt-in button + mute + honest sentence'
})

// ---------- T-117: arrival ----------

await scenario('7. cold open on a sleeping room: checking beat → content from the pocket', async () => {
  const code2 = `sleepy-room-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  const key2 = randomBytes(32).toString('base64url')
  const link2 = (o) => `http://localhost:${o}/#spool=${code2}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}&k=${key2}`

  // someone chatted here yesterday and left — the pocket holds the room
  const w = await Tab.open(link2(ORIGINS[0]))
  await w.ready()
  await w.eval(`(async () => {
    const seat = localStorage.getItem('spool-seat')
    window.spool.wind({ kind: 'message', body: 'first', data: { seat } })
    window.spool.wind({ kind: 'message', body: 'second', data: { seat } })
    window.spool.wind({ kind: 'message', body: 'third', data: { seat } })
    await window.spool.leave()
  })()`)
  await w.close()

  // a fresh device opens with NOBODY online. The invariant (AC): at no
  // rendered moment does a populated room show a bare empty feed — every
  // frame has either the arrival overlay or content. (On a fast pocket the
  // content can beat the overlay entirely — that's the ideal case, not a
  // failure; the overlay narrates waiting, and there was none.)
  const BARE_EMPTY_WATCH = `
    window.__bareEmptyFrames = 0
    window.__overlaySeen = false
    const check = () => {
      if (document.querySelector('.arrival')) window.__overlaySeen = true
      const feed = document.querySelector('.feed')
      if (feed && !document.querySelector('.bubble') && !document.querySelector('.arrival')) {
        window.__bareEmptyFrames++
      }
    }
    new MutationObserver(check).observe(document, { childList: true, subtree: true })
  `
  const d = await Tab.open(link2(ORIGINS[1]), { patch: BARE_EMPTY_WATCH })
  await d.until(`document.querySelectorAll('.bubble').length === 3`, 15_000, 'pocket content renders')
  const bare = await d.eval('window.__bareEmptyFrames')
  const overlaySeen = await d.eval('window.__overlaySeen')
  const phase = await d.eval(`window.spool.pocket?.phase`)
  if (bare > 0) throw new Error(`${bare} rendered mutation(s) showed a bare empty feed with no overlay`)
  if (phase !== 'applied') throw new Error(`pocket phase ${phase}, expected applied`)
  if (d.errors.length) throw new Error(`page errors: ${d.errors.join(' | ')}`)
  await d.close()
  return `3 bubbles from the pocket, zero bare-empty frames (overlay ${overlaySeen ? 'narrated the wait' : 'not needed — content beat it'}), phase=applied`
})

await scenario('8. truly empty room: calm verdict, invite affordance, non-blocking naming', async () => {
  const code3 = `empty-room-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  const key3 = randomBytes(32).toString('base64url')
  const e = await Tab.open(
    `http://localhost:${ORIGINS[2]}/#spool=${code3}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}&k=${key3}`
  )
  await e.until(
    `document.querySelector('.arrival')?.textContent.includes('nobody else here')`,
    10_000,
    'overlay reports nobody here'
  )
  await e.until(
    `document.querySelector('.arrival')?.textContent.includes('really is empty')`,
    10_000,
    'overlay reaches the empty verdict'
  )
  await e.until(`!document.querySelector('.arrival')`, 10_000, 'overlay closes by itself')
  const inviteThere = await e.eval(
    `!!document.querySelector('.inviteBtn') && document.querySelector('.honestLine').textContent.includes('reads everything')`
  )
  if (!inviteThere) throw new Error('empty room lacks the invite affordance + honest sentence')
  // the naming prompt is present but never a gate: the composer works right now
  const promptThere = await e.eval(`!!document.querySelector('.namePrompt')`)
  await e.typeAndSend('unnamed and talking anyway')
  await e.until(
    `[...document.querySelectorAll('.bubble')].some(el => el.textContent === 'unnamed and talking anyway')`,
    10_000,
    'unnamed seat can speak immediately'
  )
  await e.eval(`document.querySelector('.namePromptClose').click()`)
  const promptGone = await e.eval(`!document.querySelector('.namePrompt')`)
  if (!promptThere || !promptGone) throw new Error(`name prompt present=${promptThere}, dismissed=${promptGone}`)
  if (e.errors.length) throw new Error(`page errors: ${e.errors.join(' | ')}`)
  await e.close()
  return 'nobody-here → really-empty → invite + honest sentence; naming prompt ignorable and dismissible'
})

// ---------- T-163: keepsake — export, and the one hard delete ----------

await scenario('16. keepsake: export round-trips through importSpool; forget removes the database and the stash row', async () => {
  await a.eval(`document.querySelector('.headerTitle').click()`)
  await a.until(`!!document.querySelector('.settingsBody')`, 5_000, 'settings open')
  const permanence = await a.eval(
    `document.querySelector('.finePrint').textContent.includes('kept by everyone in the room, for as long as they keep it')`
  )
  if (!permanence) throw new Error('the permanence sentence is missing from the fine print')

  // export: capture the anchor download instead of letting headless Chrome
  // write a file, then read the blob back inside the page
  await a.eval(`(() => {
    window.__download = null
    HTMLAnchorElement.prototype.click = function () { window.__download = { href: this.href, name: this.download } }
  })()`)
  await a.eval(`[...document.querySelectorAll('button')].find(el => el.textContent === 'export this room').click()`)
  await a.until(`!!window.__download`, 5_000, 'export produced a download')
  const fileName = await a.eval(`window.__download.name`)
  if (fileName !== `${code}.spool.json`) throw new Error(`download named "${fileName}"`)
  const text = await a.eval(`fetch(window.__download.href).then(r => r.text())`)
  const file = JSON.parse(text)
  if (file.format !== 'spool-export' || file.code !== code) throw new Error(`bad export header: ${file.format} / ${file.code}`)
  if (text.includes(keyB64)) throw new Error('the key is in the export file')
  const live = await a.eval(`({ n: window.spool.entries.length, d: window.spool.deleted.length, msgs: window.spool.entries.filter(e => e.kind === 'message').map(e => e.body).sort() })`)
  const back = await importSpool(text, { persist: false })
  const backMsgs = back.entries.filter((e) => e.kind === 'message').map((e) => e.body).sort()
  const same = back.entries.length === live.n && back.deleted.length === live.d && JSON.stringify(backMsgs) === JSON.stringify(live.msgs)
  await back.leave()
  if (!same) throw new Error(`import differs: ${back.entries.length}/${back.deleted.length} vs live ${live.n}/${live.d}`)

  // forget: confirm twice, the second step typed. Nothing happens until the
  // code matches; the seat survives; the room-local last-seen goes
  const seatBefore = await a.eval(`localStorage.getItem('spool-seat')`)
  const seenBefore = await a.eval(`localStorage.getItem('room-seen:${code}')`)
  if (!seenBefore) throw new Error('precondition: A has no room-seen key to clear')
  const dbsBefore = await a.eval(`indexedDB.databases().then(l => l.map(d => d.name))`)
  if (!dbsBefore.includes(code)) throw new Error('precondition: the room database is not there to forget')
  await a.eval(`[...document.querySelectorAll('button')].find(el => el.textContent === 'forget this room on this device').click()`)
  await a.until(`document.querySelector('.confirmCard')?.textContent.includes('gone from this device only')`, 5_000, 'first confirmation carries the honest copy')
  await a.eval(`[...document.querySelectorAll('button')].find(el => el.textContent === 'yes, forget it').click()`)
  await a.until(`!!document.querySelector('.codeInput')`, 5_000, 'second confirmation asks for the room code')
  const setCode = (value) => a.eval(`(() => { const input = document.querySelector('.codeInput'); (${SET_INPUT})(input, ${JSON.stringify(value)}) })()`)
  if (!(await a.eval(`document.querySelector('.forgetBtn').disabled`))) throw new Error('forget enabled before any code was typed')
  await setCode('wrong-code-000')
  if (!(await a.eval(`document.querySelector('.forgetBtn').disabled`))) throw new Error('forget enabled on a wrong code')
  await setCode(code)
  await a.until(`!document.querySelector('.forgetBtn').disabled`, 2_000, 'the typed code arms the button')
  await a.eval(`document.querySelector('.forgetBtn').click()`)
  // the bare URL opens a fresh room on the SAME (local) relay — never the default
  await a.until(`!!window.spool && window.spool.code !== '${code}' && location.hash.includes('spool=')`, 20_000, 'a fresh room opened on the bare url')
  const newLink = decodeURIComponent(await a.eval(`window.spool.share()`))
  if (!newLink.includes(`relay=ws://localhost:${RELAY_PORT}/yjs`)) throw new Error(`the fresh room left the local relay: ${newLink}`)
  const after = await a.eval(`({
    seat: localStorage.getItem('spool-seat'),
    seen: localStorage.getItem('room-seen:${code}'),
    stash: Object.keys(JSON.parse(localStorage.getItem('spools:stash') ?? '{}')),
  })`)
  if (after.seat !== seatBefore) throw new Error('spool-seat changed across forget')
  if (after.seen !== null) throw new Error('room-seen key survived forget')
  if (after.stash.includes(code)) throw new Error('stash registry row survived forget')
  const dbsAfter = await a.eval(`indexedDB.databases().then(l => l.map(d => d.name))`)
  if (dbsAfter.includes(code)) throw new Error('the room database survived forget')
  // everyone else keeps their copy: B is untouched, and the old link still
  // opens on this device — the room comes back from B / the pocket
  const bCount = await b.eval(`window.spool.entries.filter(e => e.kind === 'message').length`)
  if (bCount === 0) throw new Error("B's copy vanished")
  const again = await Tab.open(linkFor(ORIGINS[0]))
  await again.until(`document.querySelectorAll('.bubble').length > 0`, 20_000, 'the old link reopens from the others')
  if (again.errors.length || a.errors.length) throw new Error(`page errors: ${[...again.errors, ...a.errors].join(' | ')}`)
  await again.close()
  return `export ${fileName} (${text.length} B, key absent) reopened in Node with ${back.entries.length}+${back.deleted.length} entries; forget: db + stash row + room-seen gone, seat kept, fresh room on the local relay, old link reopens`
})

await a?.close()
await b?.close()
await c?.close()

console.log('\n| # | Scenario | Result | Measured |')
console.log('|---|---|---|---|')
for (const r of results) console.log(`| ${r.name.split('.')[0]} | ${r.name.slice(r.name.indexOf(' ') + 1)} | ${r.pass ? '✔' : '✘'} | ${r.detail} |`)

chrome.kill('SIGKILL')
relay.kill('SIGKILL')
for (const s of servers) s.close()
process.exit(results.every((r) => r.pass) ? 0 : 1)
