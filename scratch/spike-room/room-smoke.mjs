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
  static async open(url, { width = 375, height = 667, patch, network = false } = {}) {
    const info = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' })).json()
    const tab = new Tab()
    tab.id = info.id
    tab.errors = []
    /** every http(s) request url + every websocket url, when opened with { network: true } (T-166) */
    tab.requests = []
    tab.sockets = []
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
      } else if (msg.method === 'Network.requestWillBeSent') {
        tab.requests.push(msg.params.request.url)
      } else if (msg.method === 'Network.webSocketCreated') {
        tab.sockets.push(msg.params.url)
      }
    })
    await tab.call('Runtime.enable')
    await tab.call('Page.enable')
    if (network) await tab.call('Network.enable')
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
// ONLY=22,23 runs just those scenarios (the T-187 ones stand alone; most earlier ones chain)
const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const scenario = async (name, fn) => {
  if (only && !only.has(name.split('.')[0])) return
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

  // "renamed by" resolves to a person (T-172): B is unnamed, so C's people
  // list credits the rename to B's seat suffix — never "anonymous"
  const bSuffix = `#${(await b.eval(`localStorage.getItem('spool-seat')`)).slice(-4).toLowerCase()}`
  await c.eval(`document.querySelector('.headerTitle').click()`)
  await c.until(
    `(() => {
      const row = [...document.querySelectorAll('.personRow')].find(r => r.querySelector('.personSeatId').textContent.startsWith('${suffix}'))
      return row?.querySelector('.personAudit')?.textContent === 'renamed by ${bSuffix}'
    })()`,
    10_000,
    `C's people list says A was renamed by ${bSuffix}`
  )
  await c.eval(`document.querySelector('.headerBtn').click()`)

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
  return `renamed via UI on B; retroactive on cold C; message entries clean; survived reload; audit says "renamed by ${bSuffix}"`
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

  // T-172, both halves. Those raw winds carried no data.by (the pre-T-172
  // shape), so the audit falls back to the entry's author — "anonymous"…
  const bRow = `[...document.querySelectorAll('.personRow')].find(r => r.querySelector('.personSeatId').textContent.startsWith('#${bSeat.slice(-4).toLowerCase()}'))`
  await a.eval(`document.querySelector('.headerTitle').click()`)
  await a.until(`${bRow}?.querySelector('.personAudit')?.textContent === 'renamed by anonymous'`, 10_000, 'old-shape entries fall back to the author')
  // …and a rename through the UI stamps the renamer's seat: A (named "zora"
  // by B in scenario 5) renames B, and C's people list credits zora
  await a.eval(`(() => {
    const input = ${bRow}.querySelector('.personName')
    input.focus()
    ;(${SET_INPUT})(input, 'zed')
    input.blur()
  })()`)
  await a.eval(`document.querySelector('.headerBtn').click()`)
  await c.eval(`document.querySelector('.headerTitle').click()`)
  await c.until(`${bRow}?.querySelector('.personAudit')?.textContent === 'renamed by zora'`, 10_000, 'C sees "renamed by zora"')
  const stampedBy = await c.eval(`(() => {
    const profs = window.spool.entries.filter(e => e.kind === 'room:profile' && e.data?.seat === '${bSeat}')
    return profs[profs.length - 1].data.by
  })()`)
  const aSeatNow = await a.eval(`localStorage.getItem('spool-seat')`)
  if (stampedBy !== aSeatNow) throw new Error(`data.by is ${stampedBy}, expected A's seat`)
  await c.eval(`document.querySelector('.headerBtn').click()`)
  if (a.errors.length || b.errors.length || c.errors.length) {
    throw new Error(`page errors: ${[...a.errors, ...b.errors, ...c.errors].join(' | ')}`)
  }
  return `all three devices agree on "${names[0]}" (newest-wins), DOM matches; old-shape audit → "anonymous", UI rename → "renamed by zora" on C; 0 page errors`
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
  // the "link copied" toast says where the key goes (T-165) — read it while
  // the feed is still empty; a hidden message keeps its slot, so the invite
  // affordance never comes back once something has been said
  await e.eval(`navigator.clipboard.writeText = () => Promise.resolve()`)
  await e.eval(`document.querySelector('.inviteBtn').click()`)
  await e.until(
    `document.querySelector('.linkCopied')?.textContent.includes('your browser may sync this address to its maker; send the link over something end-to-end encrypted, or in person.')`,
    5_000,
    'the link-copied toast carries the key-travels sentence'
  )
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
  return 'nobody-here → really-empty → invite + honest sentence; naming prompt ignorable and dismissible; link-copied toast says where the key goes'
})

// ---------- T-163: keepsake — export, and the one hard delete ----------

await scenario('16. keepsake: export round-trips through importSpool; forget removes the database and the stash row', async () => {
  await a.eval(`document.querySelector('.headerTitle').click()`)
  await a.until(`!!document.querySelector('.settingsBody')`, 5_000, 'settings open')
  const permanence = await a.eval(
    `document.querySelector('.finePrint').textContent.includes('kept by everyone in the room, for as long as they keep it')`
  )
  if (!permanence) throw new Error('the permanence sentence is missing from the fine print')
  const keyTravels = await a.eval(`(() => {
    const s = 'your browser may sync this address to its maker; send the link over something end-to-end encrypted, or in person.'
    return document.querySelector('.finePrint').textContent.includes(s) && document.querySelector('.keyTravels')?.textContent === s
  })()`)
  if (!keyTravels) throw new Error('the key-travels sentence is missing from the fine print or the link caption (T-165)')

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

// ---------- T-164: start a new room ----------

await scenario('17. start a new room: one tap lands in a fresh keyed room with its link copied; the old room still opens', async () => {
  // B is still in the original room. Headless Chrome has no clipboard to
  // speak of — record what the app hands it, where the next document can read it
  await b.eval(`navigator.clipboard.writeText = (t) => { localStorage.setItem('__copied', t); return Promise.resolve() }`)
  await b.eval(`document.querySelector('.headerTitle').click()`)
  await b.until(`!!document.querySelector('.settingsBody')`, 5_000, 'settings open')
  const sentence = await b.eval(
    `document.querySelector('.finePrint').textContent.includes('there is no way to remove someone. make a new room and hand the new link only to the people you want.')`
  )
  if (!sentence) throw new Error('the no-removal sentence is missing from the fine print')
  await b.eval(`[...document.querySelectorAll('button')].find(el => el.textContent === 'start a new room').click()`)
  await b.until(`!!window.spool && window.spool.code !== '${code}' && location.hash.includes('spool=')`, 20_000, 'a fresh room opened')
  const fresh = await b.eval(`({ link: window.spool.share(), copied: localStorage.getItem('__copied'), came: sessionStorage.getItem('room-came-from') })`)
  await b.eval(`localStorage.removeItem('__copied')`)
  if (fresh.copied !== fresh.link) throw new Error(`copied "${fresh.copied}" is not the new room's link "${fresh.link}"`)
  const decoded = decodeURIComponent(fresh.link)
  if (!decoded.includes(`relay=ws://localhost:${RELAY_PORT}/yjs`)) throw new Error(`the new room left the local relay: ${decoded}`)
  if (!/[&#]k=[A-Za-z0-9_-]{43}$/.test(fresh.link)) throw new Error(`the new room is not keyed: ${fresh.link}`)
  if (fresh.came !== null) throw new Error('the arrival flag was not consumed on read')
  await b.until(`document.querySelector('.cameFrom')?.textContent.includes('your old room is still on this device.')`, 10_000, 'arrival notice shows')
  const copiedLine = await b.eval(`document.querySelector('.cameFrom').textContent.includes('the new link is copied')`)
  if (!copiedLine) throw new Error('arrival notice does not say the link was copied')
  await b.eval(`document.querySelector('.cameFrom .noticeClose').click()`)
  if (await b.eval(`!!document.querySelector('.cameFrom')`)) throw new Error('arrival notice did not dismiss')
  // the old room still opens from its old link, on the same device, from its own database
  const old = await Tab.open(linkFor(ORIGINS[1]))
  await old.until(`document.querySelectorAll('.bubble').length > 0`, 15_000, 'the old room reopens from its link')
  if (old.errors.length || b.errors.length) throw new Error(`page errors: ${[...old.errors, ...b.errors].join(' | ')}`)
  await old.close()
  return `fresh keyed room ${(await b.eval('window.spool.code'))} on the local relay, link copied verbatim, arrival notice shown + dismissed, old room reopens`
})

// ---------- T-166: zero third-party requests ----------

await scenario('18. a fresh room load contacts only its own origin and the relay (self-hosted font)', async () => {
  // a cold open on the third origin with the network panel on: every request
  // must be the page origin (html, js, css, woff2) or the relay (pocket
  // http + websocket). STUN is UDP and not a request — T-175's question.
  const n = await Tab.open(linkFor(ORIGINS[2]), { network: true })
  await n.ready()
  await n.until(`document.querySelectorAll('.bubble').length > 0`, 20_000, 'content lands')
  await sleep(3_000) // let late loads (font faces, pocket, reconnects) show up
  const pageOrigin = `http://localhost:${ORIGINS[2]}/`
  const relayHttp = `http://localhost:${RELAY_PORT}/`
  const relayWs = `ws://localhost:${RELAY_PORT}/`
  const foreign = [
    ...n.requests.filter((u) => !u.startsWith(pageOrigin) && !u.startsWith(relayHttp) && !u.startsWith('data:') && !u.startsWith('blob:')),
    ...n.sockets.filter((u) => !u.startsWith(relayWs)),
  ]
  const fonts = n.requests.filter((u) => u.endsWith('.woff2'))
  const fontOk = fonts.length > 0 && fonts.every((u) => u.startsWith(`${pageOrigin}fonts/JetBrainsMono-`))
  const google = [...n.requests, ...n.sockets].filter((u) => /googleapis|gstatic/.test(u))
  await n.close()
  if (google.length) throw new Error(`google fonts still requested: ${google.join(', ')}`)
  if (foreign.length) throw new Error(`requests beyond the page origin + relay: ${foreign.join(', ')}`)
  if (!fontOk) throw new Error(`font faces not loaded from the page origin: ${fonts.join(', ') || '(none requested)'}`)
  return `${n.requests.length} requests + ${n.sockets.length} sockets, all on the page origin or the relay; ${fonts.length} woff2 from ./fonts`
})

// ---------- T-173: notification text stays out of the OS ----------

await scenario('19. notifications carry the name, not the text, unless this device opts in', async () => {
  // a stand-in Notification that records what the app hands the OS, installed
  // before the app reads Notification.permission; the reader tab opens on
  // C's origin, the sender on B's, both back in the original room
  const NOTIF_STUB = `
    window.__notifs = []
    window.Notification = class {
      constructor(title, opts) { window.__notifs.push({ title, body: opts?.body ?? '' }) }
      static get permission() { return 'granted' }
      static requestPermission() { return Promise.resolve('granted') }
    }
  `
  const reader = await Tab.open(linkFor(ORIGINS[2]), { patch: NOTIF_STUB })
  await reader.ready()
  await reader.until(`document.querySelectorAll('.bubble').length > 0`, 20_000, 'reader has the room')
  const sender = await Tab.open(linkFor(ORIGINS[1]))
  await sender.ready()
  await sender.until(`document.querySelectorAll('.bubble').length > 0`, 20_000, 'sender has the room')
  await sender.call('Page.bringToFront')
  await sleep(500)
  await reader.eval(`window.__notifs = []`)
  await sender.typeAndSend('the secret ingredient is love')
  await reader.until(`window.__notifs.length > 0`, 10_000, 'a notification fires for the hidden reader')
  const first = await reader.eval(`window.__notifs[window.__notifs.length - 1]`)
  if (!/ said something$/.test(first.body)) throw new Error(`default body is "${first.body}", expected "<name> said something"`)
  if (/secret|love/.test(first.body) || /secret|love/.test(first.title)) throw new Error(`message text leaked into the notification: ${JSON.stringify(first)}`)

  // opt in, per device: the toggle in settings, then the same message shape carries the text
  await reader.call('Page.bringToFront')
  await sleep(300)
  await reader.eval(`document.querySelector('.headerTitle').click()`)
  await reader.until(`!!document.querySelector('.notifTextToggle')`, 5_000, 'toggle in settings')
  const caption = await reader.eval(`document.querySelector('.settingsBody').textContent.includes('notifications go through your OS and may be kept in its history.')`)
  if (!caption) throw new Error('the OS-history caption is missing')
  await reader.eval(`document.querySelector('.notifTextToggle').click()`)
  const stored = await reader.eval(`localStorage.getItem('room-notif-text')`)
  if (stored !== '1') throw new Error(`room-notif-text is ${stored}`)
  await reader.eval(`document.querySelector('.headerBtn').click()`)
  await sender.call('Page.bringToFront')
  await sleep(500)
  await reader.eval(`window.__notifs = []`)
  await sender.typeAndSend('the second secret is butter')
  await reader.until(`window.__notifs.length > 0`, 10_000, 'a notification fires after opting in')
  const second = await reader.eval(`window.__notifs[window.__notifs.length - 1]`)
  if (!second.body.includes('the second secret is butter')) throw new Error(`opted-in body is "${second.body}"`)
  if (reader.errors.length || sender.errors.length) throw new Error(`page errors: ${[...reader.errors, ...sender.errors].join(' | ')}`)
  await sender.close()
  await reader.close()
  return `default body "${first.body}" (no text); after opting in: "${second.body}"`
})

// ---------- T-176: copy without the Clipboard API ----------

await scenario('20. copy without the Clipboard API: execCommand fallback, then the long-press hint', async () => {
  // plain http on a LAN is not a secure context: navigator.clipboard is
  // simply absent. Stand in for that, and for execCommand's verdict
  const NO_CLIPBOARD = `
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    window.__exec = []
    document.execCommand = (cmd) => { window.__exec.push(cmd); return window.__execOk !== false }
  `
  const t = await Tab.open(linkFor(ORIGINS[2]), { patch: NO_CLIPBOARD })
  await t.ready()
  await t.eval(`document.querySelector('.headerTitle').click()`)
  await t.until(`!!document.querySelector('.settingsBody')`, 5_000, 'settings open')
  const copyBtn = `[...document.querySelectorAll('.copyBtn')].find(el => el.textContent === 'copy')`
  await t.eval(`${copyBtn}.click()`)
  await t.until(`[...document.querySelectorAll('.copyBtn')].some(el => el.textContent === 'copied ✓')`, 5_000, 'the execCommand path reports copied')
  const execs = await t.eval(`window.__exec`)
  if (!execs.includes('copy')) throw new Error(`execCommand('copy') was not used: ${JSON.stringify(execs)}`)
  const focusBack = await t.eval(`document.activeElement === ${copyBtn} || document.activeElement === document.body`)
  if (!focusBack) throw new Error('the off-screen textarea kept focus')
  // nothing works at all: the whole link is shown, pre-selected, with the hint
  await t.eval(`window.__execOk = false`)
  await sleep(1_700) // "copied ✓" reverts to "copy"
  await t.eval(`${copyBtn}.click()`)
  await t.until(`document.querySelector('.settingsBody').textContent.includes('long-press or select the link to copy it')`, 5_000, 'the hint shows')
  const shown = await t.eval(`document.querySelector('.linkFull')?.textContent === window.spool.share()`)
  if (!shown) throw new Error('the full link is not shown for a manual copy')
  const selected = await t.eval(`getSelection().toString() === window.spool.share()`)
  if (!selected) throw new Error('the shown link is not pre-selected')
  if (t.errors.length) throw new Error(`page errors: ${t.errors.join(' | ')}`)
  await t.close()
  return 'no navigator.clipboard → execCommand("copy") → "copied ✓"; execCommand false → full link shown + selected + hint; 0 page errors'
})

await scenario('21. a full room says so: the 65th seat sees the line within seconds, and gets in when one frees (T-169)', async () => {
  // its own room, so the count is exact: 64 raw sockets take every seat the
  // relay allows (MAX_CONNS_PER_ROOM, a constant), and the app is the 65th
  const fullCode = `full-room-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  const raw = []
  for (let i = 0; i < 64; i++) raw.push(new WebSocket(`ws://127.0.0.1:${RELAY_PORT}/yjs/${fullCode}`))
  await sleep(1_500)
  const open = raw.filter((w) => w.readyState === WebSocket.OPEN).length
  if (open !== 64) throw new Error(`expected 64 raw seats open, got ${open}`)
  const link = `http://localhost:${ORIGINS[2]}/#spool=${fullCode}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}&k=${keyB64}`
  // WebRTC off: the SDK derives signaling from the relay's host, and the local
  // relay's signaling endpoint has no room cap — with it on, `status` would
  // read connected (signaling reached) while the relay leg is refused. The
  // line is rendered from roomFull either way; this pins the ws-only contract
  const t = await Tab.open(link, { patch: 'delete window.RTCPeerConnection; delete window.webkitRTCPeerConnection;' })
  try {
    await t.ready()
  } catch (err) {
    throw new Error(`${err.message}; page errors: ${t.errors.join(' | ') || 'none'}; status text: ${await t.eval(`document.body.innerText.slice(0, 300)`)}`)
  }
  const shownMs = await t.until(`document.querySelector('.notice.roomFull')?.textContent.startsWith('this room is full')`, 10_000, 'the room-full line')
  const status = await t.eval(`window.spool.status`)
  if (status !== 'offline') throw new Error(`status while full should read offline, got ${status}`)
  const full = await t.eval(`window.spool.roomFull`)
  if (!full) throw new Error('spool.roomFull is not true while the line shows')
  // the SDK stands back ~30 s; the raw seats leave now, so its next try is admitted
  for (const w of raw) w.close()
  const inMs = await t.until(`window.spool.status === 'connected' && !document.querySelector('.notice.roomFull')`, 45_000, 'admitted after a seat frees, line gone')
  if (t.errors.length) throw new Error(`page errors: ${t.errors.join(' | ')}`)
  await t.close()
  return `64 raw seats; the 65th showed the line ${shownMs} ms after the app was ready; status offline + roomFull true meanwhile; seats freed → connected and the line gone after ${inMs} ms`
})

// ---------- T-187: the reel — the cut, the tape counter, full is a cut ----------

const reelCode = `reel-room-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
const reelKey = randomBytes(32).toString('base64url')
const reelLinkFor = (origin) =>
  `http://localhost:${origin}/#spool=${reelCode}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}&k=${reelKey}`
// real keystrokes into a controlled input, then Enter (the room commits the
// reel length on Enter → blur) — the composer's idiom, not synthetic events
const typeInput = async (tab, sel, value) => {
  await tab.eval(`(() => { const i = document.querySelector(${JSON.stringify(sel)}); i.focus(); i.select() })()`)
  await tab.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8, nativeVirtualKeyCode: 8 })
  await tab.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8, nativeVirtualKeyCode: 8 })
  if (value) await tab.call('Input.insertText', { text: value })
  await tab.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', windowsVirtualKeyCode: 13 })
  await tab.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
}
const reelDiag = (tab) =>
  tab.eval(`JSON.stringify({ reels: window.spool.entries.filter((e) => e.kind === 'room:reel').map((e) => e.body), line: document.querySelector('.tape .tapeLine')?.textContent, input: document.querySelector('#reelLength')?.value, active: document.activeElement?.id })`)
let r1, r2

await scenario('22. the cut: a new reel from a message on — identity kept, the orphan reply flattened, the orphan reaction dropped, names carried, the old room whole, a cold peer sees the reel', async () => {
  r1 = await Tab.open(reelLinkFor(ORIGINS[0]))
  await r1.ready()
  r2 = await Tab.open(reelLinkFor(ORIGINS[1]))
  await r2.ready()
  // the world: four messages, a reply to the first wound after the third, a
  // reaction on the first and one on the fourth, a hidden message, and a name
  // a beat between winds: entries wound in one millisecond sort by id, and the
  // cut is by the SDK's order — the fixture wants that order to be the story's
  const world = await r1.eval(`(async () => {
    const seat = localStorage.getItem('spool-seat')
    const beat = () => new Promise((r) => setTimeout(r, 5))
    const w = async (input) => { const id = window.spool.wind({ ...input, data: { ...(input.data ?? {}), seat } }).id; await beat(); return id }
    window.spool.wind({ kind: 'room:profile', body: 'ren', data: { seat, by: seat } })
    await beat()
    const one = await w({ kind: 'message', body: 'one' })
    const two = await w({ kind: 'message', body: 'two' })
    const hidden = await w({ kind: 'message', body: 'never mind' })
    const three = await w({ kind: 'message', body: 'three' })
    const reOne = await w({ kind: 'message', body: 're one', parent: one })
    const four = await w({ kind: 'message', body: 'four' })
    const rOne = await w({ kind: 'reaction', body: '👍', parent: one })
    const rFour = await w({ kind: 'reaction', body: '🔥', parent: four })
    window.spool.entries.find((e) => e.id === hidden).delete()
    return { seat, one, two, three, reOne, four, rOne, rFour, hidden }
  })()`)
  await r2.until(`document.querySelectorAll('.bubble').length >= 5`, 15_000, 'r2 sees the world')
  await r1.eval(`navigator.clipboard.writeText = (t) => { localStorage.setItem('__copied', t); return Promise.resolve() }`)
  // tap "three" → the sheet → the cut → the confirm line → cut
  await r1.eval(`${bubbleSel('three')}.click()`)
  await r1.until(`!!document.querySelector('.sheet')`, 5_000, 'sheet opens')
  await r1.eval(`[...document.querySelectorAll('.sheetAction')].find(el => el.textContent.includes('start a new reel from here')).click()`)
  await r1.until(`document.querySelector('.cutConfirm')?.textContent.includes('start a new reel from this message on.')`, 5_000, 'the confirm line')
  const sentenceOk = await r1.eval(`(() => { const t = document.querySelector('.cutConfirm').textContent; return t.includes('replies to what you cut become plain entries') && t.includes('the new reel has no past') && t.includes('the old reel stays whole') && t.includes('your browser may sync this address') })()`)
  if (!sentenceOk) throw new Error('the confirm line is missing part of the sentence')
  const cutAt = Date.now()
  await r1.eval(`[...document.querySelectorAll('.cutConfirm button')].find(el => el.textContent === 'cut').click()`)
  await r1.until(`!!window.spool && window.spool.code !== '${reelCode}' && location.hash.includes('spool=')`, 30_000, 'the new reel opened')
  await r1.until(`window.spool.entries.length >= 3`, 10_000, 'the reel has its entries')
  const reel = await r1.eval(`({
    code: window.spool.code,
    link: window.spool.share(),
    copied: localStorage.getItem('__copied'),
    entries: window.spool.entries.map((e) => ({ id: e.id, kind: e.kind, parent: e.parent ?? null, body: e.body, data: e.data ?? null })),
    deleted: window.spool.deleted.length,
    history: window.spool.history,
    bubbles: document.querySelectorAll('.bubble').length,
    came: sessionStorage.getItem('room-came-from'),
  })`)
  await r1.eval(`localStorage.removeItem('__copied')`)
  if (reel.copied !== reel.link) throw new Error(`copied "${reel.copied}" is not the reel's link "${reel.link}"`)
  if (!decodeURIComponent(reel.link).includes(`relay=ws://localhost:${RELAY_PORT}/yjs`)) throw new Error('the reel left the local relay')
  const byId = new Map(reel.entries.map((e) => [e.id, e]))
  const want = { [world.three]: 'three', [world.reOne]: 're one', [world.four]: 'four' }
  for (const [id, body] of Object.entries(want)) {
    if (byId.get(id)?.body !== body) throw new Error(`"${body}" did not cross with its id`)
  }
  for (const id of [world.one, world.two, world.hidden, world.rOne]) {
    if (byId.has(id)) throw new Error(`entry ${id} crossed and should not have (before the cut, hidden, or an orphan reaction)`)
  }
  if (byId.get(world.reOne).parent !== null) throw new Error('the orphan reply was not flattened')
  if (byId.get(world.rFour)?.parent !== world.four) throw new Error('the reaction on "four" did not cross with its parent')
  if (!reel.entries.some((e) => e.kind === 'room:profile' && e.body === 'ren')) throw new Error('the name did not carry')
  if (!reel.entries.some((e) => e.kind === 'room:home' && e.data?.code === reelCode && !('k' in (e.data ?? {})))) throw new Error('room:home is missing or carries a key')
  if (reel.deleted !== 0) throw new Error('a hidden message crossed')
  if (reel.bubbles !== 3) throw new Error(`expected 3 bubbles in the reel, got ${reel.bubbles}`)
  if (reel.history.some((t) => t < cutAt - 1000)) throw new Error('the reel carries a moment from before the cut')
  if (reel.came !== null) throw new Error('the arrival flag was not consumed')
  await r1.until(`!!document.querySelector('.cameFrom')`, 10_000, 'the arrival line')
  const arrival = await r1.eval(`document.querySelector('.cameFrom').textContent`)
  if (!arrival.includes('a new reel: 3 messages came along, 1 reply became plain entries; rewind starts here.')) throw new Error(`arrival line: ${arrival}`)
  if (!arrival.includes('your old room is still on this device.') || !arrival.includes('the new link is copied')) throw new Error(`arrival line: ${arrival}`)
  // settings says where it was cut from
  await r1.eval(`document.querySelector('.headerTitle').click()`)
  await r1.until(`document.querySelector('.tape')?.textContent.includes('cut from ${reelCode}')`, 5_000, 'settings names the home reel')
  await r1.eval(`[...document.querySelectorAll('button')].find(el => el.getAttribute('aria-label') === 'Back').click()`)
  // the old room is whole on r2, and reopens on r1's origin from its own database
  const oldCount = await r2.eval(`window.spool.entries.filter((e) => e.kind === 'message').length`)
  if (oldCount !== 5) throw new Error(`the old room changed: ${oldCount} live messages`)
  const old = await Tab.open(reelLinkFor(ORIGINS[0]))
  await old.until(`document.querySelectorAll('.bubble').length >= 5`, 15_000, 'the old room reopens from its link')
  await old.close()
  // a cold peer on a third origin opens the reel from the pocket
  const cold = await Tab.open(`http://localhost:${ORIGINS[2]}/${reel.link.slice(reel.link.indexOf('#'))}`)
  await cold.until(`document.querySelectorAll('.bubble').length === 3`, 20_000, 'a cold peer sees the reel')
  const coldIds = await cold.eval(`window.spool.entries.filter((e) => e.kind === 'message').map((e) => e.id)`)
  if (JSON.stringify(coldIds) !== JSON.stringify([world.three, world.reOne, world.four])) throw new Error(`cold peer's ids: ${coldIds}`)
  if (cold.errors.length || r1.errors.length || r2.errors.length) throw new Error(`page errors: ${[...cold.errors, ...r1.errors, ...r2.errors].join(' | ')}`)
  await cold.close()
  return `reel ${reel.code}: three/re one/four crossed with their ids, the reply flattened, the orphan reaction dropped, the hidden one stayed, the name carried, room:home without a key, history from the cut, arrival line, old room whole (5 live), cold peer converged`
})

await scenario("23. the tape counter reads the relay's cap, and the reel length is a newest-wins custom", async () => {
  // r2 is still in the old room; r1 is in the new reel — both on the local relay
  await r2.eval(`document.querySelector('.headerTitle').click()`)
  const n = await r2.eval(`window.spool.entries.filter((e) => e.kind === 'message').length`)
  await r2.until(`document.querySelector('.tape .tapeLine')?.textContent.includes(' · ${n} messages')`, 10_000, `the counter measured ${n} messages (line: ' + document.querySelector('.tape .tapeLine')?.textContent + ')`)
  const line = await r2.eval(`document.querySelector('.tape .tapeLine').textContent`)
  if (!/^\d[\d.]* [KM]B of 8\.00 MB · \d+ messages$/.test(line)) throw new Error(`tape line: "${line}"`)
  const health = await (await fetch(`http://127.0.0.1:${RELAY_PORT}/`)).json()
  if (health.pocket.maxBytes !== 8 * 1024 * 1024) throw new Error(`the local relay advertises ${health.pocket.maxBytes}`)
  const caption = await r2.eval(`document.querySelector('.tape').textContent`)
  if (!caption.includes('full is a cut, not a wall')) throw new Error('the counter is missing its sentence')
  if (!caption.includes('a custom, not a lock')) throw new Error('the reel length is missing its advisory')
  // set the custom on r2 (named "rio" first); a third tab on the old room sees it, newest-wins, with the setter's name
  await r2.eval(`(() => { const seat = localStorage.getItem('spool-seat'); window.spool.wind({ kind: 'room:profile', body: 'rio', data: { seat, by: seat } }) })()`)
  await typeInput(r2, '#reelLength', '5')
  try {
    await r2.until(`document.querySelector('.tape .tapeLine').textContent.includes('messages of 5')`, 5_000, 'the custom shows on r2')
  } catch (err) {
    throw new Error(`${err.message} — ${await reelDiag(r2)}`)
  }
  const peer = await Tab.open(reelLinkFor(ORIGINS[2]))
  await peer.ready()
  await peer.eval(`document.querySelector('.headerTitle').click()`)
  await peer.until(`document.querySelector('.tape')?.textContent.includes('messages of 5') && document.querySelector('.tape').textContent.includes('set by rio')`, 15_000, 'the custom arrives with its setter')
  if (await peer.eval(`!!document.querySelector('.tapeFill.over')`)) throw new Error('5 messages of a 5-message reel reads over')
  await peer.eval(`window.spool.wind({ kind: 'message', body: 'six', data: { seat: localStorage.getItem('spool-seat') } })`)
  await peer.until(`!!document.querySelector('.tapeFill.over')`, 10_000, 'the sixth message tips the bar')
  // clear the custom from the peer: an empty body is a clear, newest wins
  await typeInput(peer, '#reelLength', '')
  await r2.until(`!document.querySelector('.tape .tapeLine').textContent.includes(' of 5')`, 15_000, 'the clear arrives on r2')
  if (peer.errors.length || r2.errors.length) throw new Error(`page errors: ${[...peer.errors, ...r2.errors].join(' | ')}`)
  await peer.close()
  return `"${line}" against the relay's advertised 8 MiB; custom 5 set by rio seen on a third tab, over at six, cleared newest-wins`
})

await scenario("24. full is a cut, not a wall: a room that outgrows its relay's pocket is offered the cut", async () => {
  // a relay with a tiny pocket cap: the first deposit after the room passes it
  // comes back 413, the SDK latches too-big, and the line offers the cut
  const smallPort = RELAY_PORT + 1
  const small = spawn(process.execPath, [new URL('../../packages/spools-relay/server.js', here).pathname], {
    stdio: ['ignore', 'pipe', 'inherit'],
    env: { ...process.env, PORT: String(smallPort), HOST: '127.0.0.1', POCKET_MAX_BYTES: '1500' },
  })
  await new Promise((resolve) => small.stdout.once('data', resolve))
  try {
    const link = `http://localhost:${ORIGINS[2]}/#spool=small-reel-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}&relay=${encodeURIComponent(`ws://localhost:${smallPort}/yjs`)}&k=${keyB64}`
    const t = await Tab.open(link)
    await t.ready()
    await t.eval(`(() => { const seat = localStorage.getItem('spool-seat'); for (let i = 0; i < 12; i++) window.spool.wind({ kind: 'message', body: 'a message long enough to matter, number ' + i, data: { seat } }) })()`)
    await t.eval(`document.querySelector('.headerTitle').click()`)
    await t.until(`document.querySelector('.tape')?.textContent.includes('of 1.5 KB')`, 10_000, "the counter reads the small relay's cap")
    await t.until(`!!document.querySelector('.tapeFill.over')`, 10_000, 'the bar reads over past the cap')
    await t.eval(`[...document.querySelectorAll('button')].find(el => el.getAttribute('aria-label') === 'Back').click()`)
    const ms = await t.until(`document.querySelector('.notice.warn')?.textContent.includes("outgrown the relay's pocket") && document.querySelector('.notice.warn').textContent.includes('full is a cut, not a wall')`, 40_000, 'the too-big line offers the cut')
    if (t.errors.length) throw new Error(`page errors: ${t.errors.join(' | ')}`)
    await t.close()
    return `cap 1.5 KB read from the small relay, the bar over, the too-big line with the cut offered after ${ms} ms`
  } finally {
    small.kill('SIGKILL')
  }
})

// ---------- T-165 (C): the address bar drops the key once the stash holds it ----------

await scenario('25. the address bar drops the key once the stash holds it; a bare link reopens through the stash; blocked storage keeps the key in the bar; a never-held bare link says so', async () => {
  const c165 = `key-bar-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  const k165 = randomBytes(32).toString('base64url')
  const full = `http://localhost:${ORIGINS[0]}/#spool=${c165}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}&k=${k165}`
  const t = await Tab.open(full)
  await t.ready()
  await t.eval(`window.spool.wind({ kind: 'message', body: 'kept on this device', data: { seat: localStorage.getItem('spool-seat') } })`)
  await t.until(`!location.hash.includes('k=')`, 5_000, 'the bar dropped the key')
  const bar = await t.eval(`({ hash: location.hash, share: window.spool.share(''), row: JSON.parse(localStorage.getItem('spools:stash'))['${c165}']?.link })`)
  if (!bar.hash.includes(`spool=${c165}`) || !bar.hash.includes('relay=')) throw new Error(`the bar lost more than the key: ${bar.hash}`)
  if (!bar.share.includes(`k=${k165}`)) throw new Error('share() no longer carries the key')
  if (!bar.row?.includes(`k=${k165}`)) throw new Error('the stash row does not hold the full link')
  // a reload is a bare link now: it must reopen keyed, through the stash
  await t.eval(`location.reload()`)
  await sleep(500)
  await t.ready()
  await t.until(`document.querySelectorAll('.bubble').length === 1`, 15_000, 'reopened from the bare link with its content')
  const again = await t.eval(`({ fp: window.spool.keyFingerprint, share: window.spool.share(''), hash: location.hash, bare: !!document.querySelector('.notice.bareOpen') })`)
  if (!again.fp || !again.share.includes(`k=${k165}`)) throw new Error('the reload did not reopen keyed')
  if (again.hash.includes('k=')) throw new Error('the bar carries the key again after reload')
  if (again.bare) throw new Error('the room called a stashed reopen a bare open')
  await t.close()
  // blocked storage: the registry write is swallowed → the guard keeps the key in the bar
  const c2 = `key-jar-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  const full2 = `http://localhost:${ORIGINS[1]}/#spool=${c2}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}&k=${k165}`
  const blocked = await Tab.open(full2, { patch: `const set = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'spools:stash') return; return set.call(this, k, v) }` })
  await blocked.ready()
  await sleep(1_500)
  if (!(await blocked.eval(`location.hash.includes('k=')`))) throw new Error('blocked storage: the bar dropped the key with nowhere else to keep it')
  await blocked.close()
  // a bare link for a room this device never held opens keyless and says so —
  // the keyed peer's frames are ignored, and the line names the reason
  const holder = await Tab.open(full2.replace(`${ORIGINS[1]}`, `${ORIGINS[0]}`))
  await holder.ready()
  await holder.eval(`window.spool.wind({ kind: 'message', body: 'sealed', data: { seat: localStorage.getItem('spool-seat') } })`)
  const stranger = await Tab.open(`http://localhost:${ORIGINS[2]}/#spool=${c2}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}`)
  await stranger.ready()
  await holder.eval(`window.spool.wind({ kind: 'message', body: 'still sealed', data: { seat: localStorage.getItem('spool-seat') } })`)
  await stranger.until(`document.querySelector('.notice.bareOpen')?.textContent.includes('this link has no key, and this device never held this room')`, 15_000, 'the bare-open line')
  const strangerSaw = await stranger.eval(`document.querySelectorAll('.bubble').length`)
  if (strangerSaw !== 0) throw new Error(`a keyless open rendered ${strangerSaw} sealed messages`)
  // the stranger's only errors are y-websocket failing to decode sealed frames
  // ("Unable to compute message") — that is the physics the line describes
  const strange = stranger.errors.filter((e) => !/Unable to compute message/.test(e))
  if (t.errors.length || blocked.errors.length || holder.errors.length || strange.length) throw new Error(`page errors: ${[...t.errors, ...blocked.errors, ...holder.errors, ...strange].join(' | ')}`)
  if (stranger.errors.length === 0) throw new Error('the keyless open received no sealed frames to fail on — the scenario proved nothing')
  await holder.close()
  await stranger.close()
  return `bar reads #spool=…&relay=… with no k=; share() and the stash row keep it; reload reopened keyed with its content; blocked storage kept k= in the bar; a never-held bare link opened keyless with the honest line and 0 sealed messages shown`
})


await r1?.close()
await r2?.close()


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
