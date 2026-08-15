// T-116: the feed at 5 000 messages — measured, not guessed.
//
// Seeds 5 000 realistic messages from 6 seats into a live room, then:
//   - times the spool.entries getter (the entry.ts full-sort suspicion)
//   - times a per-event render (wind → two rAFs = paint settled)
//   - counts DOM rows (is the window actually windowing?)
//   - scrolls up mid-history, winds from a second tab: no yank + the
//     "new messages" affordance appears
//   - forges a +3 min clock-skew message (Date.now patched around one wind):
//     feed stays sane, the future timestamp is annotated
//
// Run (repo root, after `pnpm build` in apps/room):
//   mise x -- node scratch/spike-room/room-scale.mjs

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CDP_PORT = 9351
const RELAY_PORT = 9475
const ORIGINS = [8797, 8798]
const here = new URL('.', import.meta.url)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const serveDist = (port) =>
  new Promise((resolve) => {
    const root = new URL('../../apps/room/dist/', import.meta.url)
    const types = { html: 'text/html', js: 'text/javascript', css: 'text/css' }
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

class Tab {
  static async open(url) {
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
      }
    })
    await tab.call('Runtime.enable')
    await tab.call('Page.enable')
    await tab.call('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true })
    await tab.call('Page.navigate', { url })
    return tab
  }
  call(method, params = {}, timeoutMs = 10_000) {
    const id = ++this.msgId
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`${method}: no CDP reply in ${timeoutMs} ms (page thread blocked?)`))
      }, timeoutMs)
      this.pending.set(id, (msg) => {
        clearTimeout(t)
        msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)
      })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
  async eval(expression) {
    const { result, exceptionDetails } = await this.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'page exception')
    return result.value
  }
  async until(expression, timeoutMs, label = expression) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      try {
        if (await this.eval(expression)) return Date.now() - (deadline - timeoutMs)
      } catch {}
      await sleep(300)
    }
    throw new Error(`timeout (${timeoutMs} ms): ${label}`)
  }
}

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
  ['--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${join(tmpdir(), `t116-${Date.now()}`)}`, '--no-first-run'],
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

const code = `scale-room-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
const keyB64 = randomBytes(32).toString('base64url')
const linkFor = (o) => `http://localhost:${o}/#spool=${code}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}&k=${keyB64}`

const a = await Tab.open(linkFor(ORIGINS[0]))
await a.until('!!window.spool', 15_000, 'A ready')

// ---------- seed 5 000 messages from 6 seats ----------
console.log('seeding 5 000 messages…')
const t0 = Date.now()
await a.eval(`(async () => {
  const BODIES = [
    'ok but have you actually listened to the b-side',
    'lol no', 'we should do this again next weekend, same place?',
    'I am five minutes away, order me whatever you are having',
    'that is the worst take I have ever heard and I respect it',
    'wait, scroll up, who said that', 'can someone resend the address',
  ]
  const seats = Array.from({ length: 6 }, (_, i) => 'seed-seat-' + i)
  for (let i = 0; i < 5000; i++) {
    window.spool.wind({ kind: 'message', body: BODIES[i % BODIES.length] + ' (#' + i + ')', data: { seat: seats[i % 6] } })
    if (i % 500 === 499) await new Promise((r) => setTimeout(r, 30)) // let the UI breathe
  }
})()`)
await a.until(`window.spool.entries.length >= 5000`, 30_000, '5 000 entries present')
console.log(`  seeded in ${((Date.now() - t0) / 1000).toFixed(1)} s`)
await sleep(1500)

// ---------- measurements ----------
const getterMs = await a.eval(`(() => {
  const t = performance.now()
  for (let i = 0; i < 10; i++) void window.spool.entries.length
  return (performance.now() - t) / 10
})()`)
const domRows = await a.eval(`document.querySelectorAll('.bubble').length`)
const renderMs = await a.eval(`new Promise((resolve) => {
  const t = performance.now()
  window.spool.wind({ kind: 'message', body: 'perf probe', data: { seat: 'seed-seat-0' } })
  requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - t)))
})`)
console.log(`entries getter @5k: ${getterMs.toFixed(1)} ms/read   DOM bubbles: ${domRows}   wind→paint: ${renderMs.toFixed(1)} ms`)

// ---------- scroll contract: no yank, affordance appears ----------
console.log("opening B…"); const b = await Tab.open(linkFor(ORIGINS[1])); console.log("B tab open")
try {
  await b.until('!!window.spool', 15_000, 'B ready')
  await b.until(`window.spool.entries.length >= 5000`, 60_000, 'B caught up')
} catch (err) {
  console.log('B stuck:', err.message, '— terminating execution to inspect')
  await b.call('Runtime.terminateExecution').catch(() => {})
  await sleep(500)
  console.log('  __renders:', await b.eval('window.__renders').catch((e) => `unreadable: ${e.message}`))
  console.log('  entries:', await b.eval('window.spool?.entries?.length').catch(() => '?'))
  console.log('  page errors:', b.errors.slice(0, 5).join(' | ') || 'none')
  throw err
}
await sleep(1000)

// scroll up and dispatch the scroll event explicitly. Two headless quirks
// make the honest paths unusable in this harness: idle frames never dispatch
// scroll events for programmatic scrollTop, and Input.dispatchMouseEvent
// (mouseWheel) never acks at all. Real user scrolling always produces frames
// and events; this exercises the component's exact listener+geometry contract.
await a.eval(`(() => {
  const f = document.querySelector('.feed')
  f.scrollTop = f.scrollHeight / 2
  f.dispatchEvent(new Event('scroll'))
})()`)
await sleep(400)
const before = await a.eval(`document.querySelector('.feed').scrollTop`)
const distFromBottom = await a.eval(
  `(() => { const f = document.querySelector('.feed'); return f.scrollHeight - f.scrollTop - f.clientHeight })()`
)
if (distFromBottom < 200) throw new Error(`wheel gestures left A at the bottom (dist ${distFromBottom}) — scroll didn't happen`)
await b.eval(`window.spool.wind({ kind: 'message', body: 'a new message while A reads history', data: { seat: 'seed-seat-1' } })`)
await a.until(`window.spool.entries.length > 5001`, 10_000, 'A received it')
await sleep(600)
const after = await a.eval(`document.querySelector('.feed').scrollTop`)
const yank = Math.abs(after - before)
const pill = await a.eval(`!!document.querySelector('.newMsgPill')`)
console.log(`scrolled-up reader: scrollTop moved ${yank.toFixed(0)} px on new message; "new messages" affordance: ${pill}`)

// ---------- clock skew: +3 min writer ----------
await b.eval(`(() => {
  const orig = Date.now
  Date.now = () => orig() + 180000
  try { window.spool.wind({ kind: 'message', body: 'my clock is three minutes ahead', data: { seat: 'seed-seat-2' } }) }
  finally { Date.now = orig }
})()`)
await a.eval(`(() => { const f = document.querySelector('.feed'); f.scrollTop = f.scrollHeight; f.dispatchEvent(new Event('scroll')) })()`)
await a.until(
  `[...document.querySelectorAll('.bubble')].some(el => el.textContent.includes('my clock is three minutes ahead'))`,
  10_000,
  'A renders the skewed message'
)
const annotated = await a.eval(`!!document.querySelector('.clockAhead')`)
// a normal message from A must still land AFTER it renders sanely (not lost above)
await a.eval(`window.spool.wind({ kind: 'message', body: 'present-time reply', data: { seat: localStorage.getItem('spool-seat') } })`)
await sleep(600)
const skewOk = await a.eval(`(() => {
  const bodies = [...document.querySelectorAll('.bubble')].map((el) => el.textContent)
  return bodies.includes('present-time reply') && bodies.some((t) => t.includes('three minutes ahead'))
})()`)
console.log(`clock-skew: future message annotated: ${annotated}; feed sane with present-time traffic: ${skewOk}`)

// ---------- show-earlier / windowing (post-implementation this exercises the prepend path) ----------
const earlier = await a.eval(`(async () => {
  const btn = document.querySelector('.showEarlier')
  if (!btn) return { present: false }
  const f = document.querySelector('.feed')
  f.scrollTop = 0
  f.dispatchEvent(new Event('scroll'))
  await new Promise((r) => setTimeout(r, 200))
  const anchor = [...document.querySelectorAll('.bubble')][0]?.textContent
  const beforeTop = f.scrollTop
  btn.click()
  await new Promise((r) => setTimeout(r, 400))
  const anchorEl = [...document.querySelectorAll('.bubble')].find((el) => el.textContent === anchor)
  const kept = anchorEl ? Math.abs(anchorEl.getBoundingClientRect().top) < window.innerHeight * 2 : false
  return { present: true, rows: document.querySelectorAll('.bubble').length, anchorKept: kept, beforeTop }
})()`)
console.log('show-earlier:', JSON.stringify(earlier))

if (a.errors.length || b.errors.length) console.log('PAGE ERRORS:', [...a.errors, ...b.errors].join(' | '))
else console.log('0 page errors')

chrome.kill('SIGKILL')
relay.kill('SIGKILL')
for (const s of servers) s.close()
process.exit(0)
