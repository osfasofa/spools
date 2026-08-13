// T-090 smoke: the built mixtape app (dist/, as it would be hosted), two
// origins as two devices, a local spools-relay between them. Winds a track
// on A, converges on B, reacts, rewinds, and screenshots the result for
// design review. CDP plumbing per prior scratch checks.
//
// Run: node scratch/mixtape-t090/check.mjs [screenshot-dir]

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const SHOT_DIR = process.argv[2]
const CHROME = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CDP_PORT = 9337
const RELAY_PORT = 9405
const ORIGINS = [8785, 8786]
const here = new URL('.', import.meta.url)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const serveDist = (port) =>
  new Promise((resolve) => {
    const root = new URL('../../apps/mixtape/dist/', import.meta.url)
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

const relayProc = spawn(process.execPath, [new URL('../../packages/spools-relay/server.js', here).pathname], {
  stdio: ['ignore', 'pipe', 'inherit'],
  env: { ...process.env, PORT: String(RELAY_PORT), HOST: '127.0.0.1' },
})
await new Promise((resolve) => relayProc.stdout.once('data', resolve))

class Tab {
  static async open(url) {
    const info = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' })).json()
    const tab = new Tab()
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
        if (await this.eval(expression)) return
      } catch { /* mid-navigation */ }
      await sleep(300)
    }
    throw new Error(`timeout waiting for: ${label}`)
  }
  async shot(name) {
    if (!SHOT_DIR) return
    const { data } = await this.call('Page.captureScreenshot', { format: 'png' })
    await writeFile(join(SHOT_DIR, name), Buffer.from(data, 'base64'))
  }
}

// UI helpers: the app has no window.spool escape hatch on purpose? — it
// should. We drive the real UI: type into inputs via native setters so React
// sees the changes.
const typeInto = (placeholder, value) => `{
  const input = [...document.querySelectorAll('input')].find((i) => i.placeholder === ${JSON.stringify(placeholder)})
  if (!input) throw new Error('no input with placeholder: ' + ${JSON.stringify(placeholder)})
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(input, ${JSON.stringify(value)})
  input.dispatchEvent(new Event('input', { bubbles: true }))
}`

if (SHOT_DIR) await mkdir(SHOT_DIR, { recursive: true })
const servers = await Promise.all(ORIGINS.map(serveDist))
const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', `--remote-debugging-port=${CDP_PORT}`,
   `--user-data-dir=${join(tmpdir(), `t090-profile-${Date.now()}`)}`,
   '--window-size=620,900', '--no-first-run', '--hide-scrollbars'],
  { stdio: 'ignore' }
)
for (let i = 0; i < 40; i++) {
  try { await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`); break } catch { await sleep(250) }
}

const fail = (msg) => { console.error(`✘ ${msg}`); process.exitCode = 1 }
const ok = (msg) => console.log(`✔ ${msg}`)

try {
  // A starts a fresh tape — the app writes the share link into the URL
  const tabA = await Tab.open(`http://localhost:${ORIGINS[0]}/`)
  await tabA.until(`location.hash.includes('spool=')`, 15_000, 'A created a tape')
  // rewrite the link's relay to the local one so the test is self-contained
  const hash = await tabA.eval(`location.hash`)
  const params = new URLSearchParams(hash.slice(1))
  params.set('relay', `ws://localhost:${RELAY_PORT}/yjs`)
  const localHash = `#${params.toString()}`
  await tabA.eval(`location.hash = ${JSON.stringify(localHash)}`) // hashchange → reload onto local relay
  // the old page satisfies hash checks synchronously before the reload lands —
  // wait for the NEW page's form to be interactive, not just the cassette
  await tabA.until(
    `location.hash.includes('${RELAY_PORT}') && [...document.querySelectorAll('input')].some((i) => i.placeholder === 'song url')`,
    15_000,
    'A reloaded onto local relay, form ready'
  )
  ok('fresh tape created; cassette rendered')

  // wind a track through the real form
  await tabA.eval(typeInto('song url', 'https://songs.example/taillights'))
  await tabA.eval(typeInto('title', 'Taillights'))
  await tabA.eval(typeInto('artist', 'Motel Coffee'))
  await tabA.eval(typeInto('why this one? (optional)', 'windows down for this one'))
  await tabA.eval(`[...document.querySelectorAll('button')].find((b) => b.textContent === 'wind it on').click()`)
  await tabA.until(`document.querySelectorAll('.track').length === 1`, 10_000, 'track rendered on A')
  ok('track wound through the form')

  // B opens the same link on a different origin — a second device
  const link = `http://localhost:${ORIGINS[1]}/${localHash}`
  const tabB = await Tab.open(link)
  await tabB.until(`document.querySelectorAll('.track').length === 1`, 30_000, 'B converged')
  const title = await tabB.eval(`document.querySelector('.trackTitle').textContent`)
  if (!title.includes('Taillights')) fail(`B shows wrong track: ${title}`)
  else ok('second device converged through the relay')

  // react on B, count appears on A
  await tabB.eval(`document.querySelector('.reactBtn').click()`)
  await tabA.until(`document.querySelectorAll('.reactionCount').length === 1`, 15_000, 'reaction crossed')
  ok('reaction crossed B → A')

  // status LEDs agree
  const led = await tabA.eval(`!!document.querySelector('.led-connected')`)
  if (!led) fail('A status LED not connected')
  else ok('status LED shows connected (reels spinning)')

  // rewind on A once a moment exists (moments land ~2 s after writes; the
  // button reads history fresh on click, so just retry the click)
  await tabA.until(
    `(() => { const b = [...document.querySelectorAll('.deckBtn')].find((x) => x.textContent.includes('rewind') || x.textContent.includes('memory')); if (b) b.click(); return !!document.querySelector('.memoryBar') })()`,
    20_000,
    'rewind engages once a moment is recorded'
  )
  const formsGone = await tabA.eval(`document.querySelectorAll('.addTrack').length === 0`)
  if (!formsGone) fail('add-track form visible while rewinding')
  else ok('rewind mode: memory bar up, write UI gone')
  await tabA.shot('rewind.png')
  await tabA.eval(`[...document.querySelectorAll('.deckBtn')].find((b) => b.textContent.includes('back to now')).click()`)
  await tabA.until(`document.querySelectorAll('.addTrack').length === 1`, 5_000, 'back to live')
  ok('back to live')

  await tabA.shot('live.png')
  const errs = [...tabA.errors, ...tabB.errors]
  if (errs.length) fail(`page errors: ${errs[0]}`)
  else ok('zero page errors on both devices')
} finally {
  chrome.kill()
  relayProc.kill('SIGKILL')
  for (const s of servers) s.close()
}
console.log(process.exitCode ? '\n✘ T-090 mixtape smoke FAILED' : '\n✔ T-090 mixtape smoke passed')
