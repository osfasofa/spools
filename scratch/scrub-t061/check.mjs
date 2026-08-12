// T-061 scrubber sanity check: build a spool with winds, an edit, and a soft
// delete (waiting out the real moment cadence — 2 s debounce, 10 s min gap),
// then drive the actual client UI: enter rewind, drag to the first moment,
// switch views while rewound, come back to live. Headless Chrome via CDP,
// plumbing copied from scratch/torture-t051.
//
// Run: node scratch/scrub-t061/check.mjs   (~40 s: the moment cadence is real)

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CDP_PORT = 9334
const RELAY_PORT = 9402
const ORIGIN = 8781
const here = new URL('.', import.meta.url)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const serveClient = (port) =>
  new Promise((resolve) => {
    const root = new URL('../../apps/client/', import.meta.url)
    const types = { html: 'text/html', js: 'text/javascript' }
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
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        tab.errors.push(msg.params.args.map((a) => a.value ?? a.description ?? '?').join(' '))
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
      } catch {
        // context mid-navigation — keep polling
      }
      await sleep(300)
    }
    throw new Error(`timeout (${timeoutMs} ms) waiting for: ${label}`)
  }
}

const KEY = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url')
const code = `scrub-check-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
const link = `http://localhost:${ORIGIN}/#spool=${code}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}&k=${KEY}`

const server = await serveClient(ORIGIN)
const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', `--remote-debugging-port=${CDP_PORT}`,
   `--user-data-dir=${join(tmpdir(), `t061-profile-${Date.now()}`)}`, '--no-first-run'],
  { stdio: 'ignore' }
)
for (let i = 0; i < 40; i++) {
  try { await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`); break } catch { await sleep(250) }
}

const fail = (msg) => { console.error(`✘ ${msg}`); process.exitCode = 1 }
const ok = (msg) => console.log(`✔ ${msg}`)

try {
  const tab = await Tab.open(link)
  await tab.until('!!window.spool', 15_000, 'client ready')

  // --- phase 1: two entries → moment 1 (2 s debounce)
  await tab.eval(`
    window.e1 = window.spool.wind({ kind: 'track', body: 'the opener', data: { url: 'https://x.example/1', title: 'First Song', artist: 'The Demo' } })
    window.e2 = window.spool.wind({ kind: 'note', body: 'original note' })
  `)
  await tab.until('window.spool.history.length >= 1', 15_000, 'moment 1')

  // --- phase 2: edit + wind → moment 2 (10 s min gap)
  await tab.eval(`
    window.e2.body = 'edited note'
    void window.spool.wind({ kind: 'note', body: 'a later thought' })
  `)
  await tab.until('window.spool.history.length >= 2', 20_000, 'moment 2')

  // --- phase 3: soft delete → moment 3
  await tab.eval('window.e1.delete()')
  await tab.until('window.spool.history.length >= 3', 20_000, 'moment 3')
  ok('spool built: 3 moments (wind / edit+wind / delete)')

  // --- enter rewind
  await tab.eval(`document.getElementById('rewindBtn').click()`)
  if (!(await tab.eval(`document.body.classList.contains('rewinding')`))) fail('rewind mode class missing')
  if (await tab.eval(`document.getElementById('rewindBar').hidden`)) fail('rewind bar still hidden')
  ok('rewind mode entered, visually flagged')

  // latest moment: e1 deleted → not rendered; e2 shows edited text
  const latest = await tab.eval(`document.getElementById('view').textContent`)
  if (latest.includes('First Song')) fail('latest moment still shows the deleted track')
  if (!latest.includes('edited note')) fail('latest moment missing the edited note')

  // --- drag to the first moment
  await tab.eval(`{
    const s = document.getElementById('scrub')
    s.value = s.min
    s.dispatchEvent(new Event('input'))
  }`)
  const first = await tab.eval(`document.getElementById('view').textContent`)
  if (!first.includes('First Song')) fail('first moment missing the not-yet-deleted track')
  if (!first.includes('original note')) fail('first moment missing the pre-edit body')
  if (first.includes('edited note') || first.includes('a later thought')) fail('first moment leaks later state')
  ok('scrubbed to moment 1: pre-edit, pre-delete world renders')

  // write UI is really gone in memory
  const formVisible = await tab.eval(
    `[...document.querySelectorAll('#view form, #view button')].some((n) => getComputedStyle(n).display !== 'none')`
  )
  if (formVisible) fail('write UI visible while rewinding')
  else ok('memory is read-only: forms and buttons hidden')

  // --- switch views while rewound: memory is data, views are skins
  for (const view of ['chat', 'list']) {
    await tab.eval(`document.querySelector('nav [data-view="${view}"]').click()`)
    const text = await tab.eval(`document.getElementById('view').textContent`)
    if (!text.includes('original note')) fail(`${view} view lost the historical world`)
    else ok(`${view} view renders the same moment`)
  }

  // --- back to live: edited + deleted state, write UI back
  await tab.eval(`document.getElementById('backToLive').click()`)
  const live = await tab.eval(`document.getElementById('view').textContent`)
  if (!live.includes('edited note')) fail('live view missing present state')
  if (live.includes('First Song')) fail('live view resurrects the deleted track (list hides deleted by default)')
  if (await tab.eval(`document.body.classList.contains('rewinding')`)) fail('rewinding class not removed')
  const formBack = await tab.eval(
    `[...document.querySelectorAll('#view form')].every((n) => getComputedStyle(n).display !== 'none')`
  )
  if (!formBack) fail('write UI did not come back')
  else ok('back to live: present state, write UI restored')

  if (tab.errors.length) fail(`page errors: ${tab.errors[0]}`)
  else ok('zero page errors throughout')
} finally {
  chrome.kill()
  relayProc.kill('SIGKILL')
  server.close()
}
console.log(process.exitCode ? '\n✘ T-061 scrub check FAILED' : '\n✔ T-061 scrub check passed')
