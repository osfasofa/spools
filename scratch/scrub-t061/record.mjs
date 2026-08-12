// T-061 demo recording: build a real mixtape spool (30+ entries — tracks,
// notes, reactions — plus edits and deletes) at the real moment cadence,
// then film the scrub: live → rewind → un-grow to the first track → switch
// view mid-memory → back to live. Headless Chrome via CDP; PNG frames land
// in FRAMES_DIR for gif.py to assemble.
//
// Run: node scratch/scrub-t061/record.mjs /path/to/frames

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const FRAMES_DIR = process.argv[2]
if (!FRAMES_DIR) throw new Error('usage: node record.mjs <frames-dir>')
await mkdir(FRAMES_DIR, { recursive: true })

const CHROME = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CDP_PORT = 9335
const RELAY_PORT = 9403
const ORIGIN = 8782
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
  static async open(url, patch) {
    const info = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' })).json()
    const tab = new Tab()
    tab.ws = new WebSocket(info.webSocketDebuggerUrl)
    await new Promise((r) => tab.ws.addEventListener('open', r))
    tab.msgId = 0
    tab.pending = new Map()
    tab.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && tab.pending.has(msg.id)) {
        tab.pending.get(msg.id)(msg)
        tab.pending.delete(msg.id)
      }
    })
    await tab.call('Runtime.enable')
    await tab.call('Page.enable')
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
        if (await this.eval(expression)) return
      } catch { /* keep polling */ }
      await sleep(300)
    }
    throw new Error(`timeout waiting for: ${label}`)
  }
}

const KEY = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url')
const code = 'amber-cassette-042'
const link = `http://localhost:${ORIGIN}/#spool=${code}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}&k=${KEY}`

const server = await serveClient(ORIGIN)
const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', `--remote-debugging-port=${CDP_PORT}`,
   `--user-data-dir=${join(tmpdir(), `t061-rec-${Date.now()}`)}`,
   '--window-size=760,860', '--no-first-run', '--force-device-scale-factor=1', '--hide-scrollbars'],
  { stdio: 'ignore' }
)
for (let i = 0; i < 40; i++) {
  try { await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`); break } catch { await sleep(250) }
}

const tab = await Tab.open(link, `localStorage.setItem('spool-author', 'ana'); localStorage.setItem('spool-view', 'mixtape')`)
await tab.until('!!window.spool && window.spool.code === ' + JSON.stringify(code), 15_000, 'client ready')

// ---------- build: one burst ≈ one moment (2 s debounce, 10 s min gap) ----------

const TRACKS = [
  ['Taillights', 'Motel Coffee'],
  ['Slow Lane Hymn', 'The Odometers'],
  ['Gas Station Roses', 'Vera Vale'],
  ['Exit 40', 'Motel Coffee'],
  ['Night Radio', 'Analog Heart'],
  ['Coast Starlight', 'The Odometers'],
  ['Last Toll', 'Junia'],
  ['Porchlight', 'Vera Vale'],
  ['Odometer Sunset', 'Analog Heart'],
  ['Home in Four Songs', 'Junia'],
]
const wind = (js) => tab.eval(js)
const track = (i, note = '') =>
  wind(`void window.spool.wind({ kind: 'track', body: ${JSON.stringify(note)}, data: { url: 'https://songs.example/${i}', title: ${JSON.stringify(TRACKS[i][0])}, artist: ${JSON.stringify(TRACKS[i][1])} } })`)
const note = (body) => wind(`void window.spool.wind({ kind: 'note', body: ${JSON.stringify(body)} })`)
const react = (n, emoji) =>
  wind(`{ const t = window.spool.entries.filter((e) => e.kind === 'track')[${n}]; if (t) void window.spool.wind({ kind: 'reaction', parent: t.id, body: ${JSON.stringify(emoji)} }) }`)

let expected = 0
const burst = async (label, fn) => {
  await fn()
  expected += 1
  await tab.until(`window.spool.history.length >= ${expected}`, 25_000, `moment ${expected} (${label})`)
  process.stdout.write(`  moment ${expected}: ${label}\n`)
}

console.log('building the mixtape (real moment cadence — takes ~2.5 min)…')
await burst('side a begins', async () => { await note('songs for the drive home 🚗'); await track(0, 'windows down for this one') })
await burst('track 2', async () => { await track(1); await react(0, '😭') })
await burst('track 3 + first reactions', async () => { await track(2); await react(0, '🔥'); await react(0, '💜'); await note('this is already so good') })
await burst('track 4', async () => { await track(3, 'the bridge!! wait for it'); await react(1, '👀'); await react(2, '💜') })
await burst('track 5 + note', async () => { await track(4); await note('ok the middle stretch needs to be slower'); await react(3, '🔥') })
await burst('edit + track 6', async () => {
  await wind(`{ const n = window.spool.entries.find((e) => e.kind === 'note' && e.body.startsWith('ok the middle')); if (n) n.body = 'the middle stretch: slower, like dusk' }`)
  await track(5)
  await react(4, '💜')
})
await burst('track 7 + reactions', async () => { await track(6); await react(4, '😭'); await react(5, '💜'); await react(2, '🔥') })
await burst('track 8', async () => { await track(7, 'for the toll booth wave'); await react(6, '👀'); await react(6, '🔥') })
await burst('a track comes off', async () => {
  await wind(`{ const t = window.spool.entries.filter((e) => e.kind === 'track')[2]; if (t) t.delete() }`)
  await note('cut gas station roses — wrong mood, sorry vera')
})
await burst('track 9 + 10', async () => { await track(8); await track(9, 'and… home'); await react(7, '😭') })
await burst('closing reactions', async () => { await react(7, '💜'); await react(8, '🔥'); await react(8, '😭'); await note('almost home, don\\u2019t skip the last one') })
await burst('liner sign-off', async () => { await note('side a complete. play it in order or not at all 💛') })

const counts = await tab.eval(`({ live: window.spool.entries.length, deleted: window.spool.deleted.length, moments: window.spool.history.length })`)
console.log(`built: ${counts.live} live + ${counts.deleted} deleted entries, ${counts.moments} moments`)
if (counts.live + counts.deleted < 30) console.warn('⚠ under 30 entries!')

// ---------- film ----------

let filming = true
let frameN = 0
const capture = (async () => {
  while (filming) {
    const t0 = Date.now()
    try {
      const { data } = await tab.call('Page.captureScreenshot', { format: 'png' })
      await writeFile(join(FRAMES_DIR, `f${String(frameN++).padStart(4, '0')}.png`), Buffer.from(data, 'base64'))
    } catch { /* mid-navigation blip */ }
    await sleep(Math.max(0, 110 - (Date.now() - t0))) // ~9 fps
  }
})()

const sweep = async (from, to, steps, totalMs) => {
  for (let i = 1; i <= steps; i++) {
    const v = from + ((to - from) * i) / steps
    await tab.eval(`{ const s = document.getElementById('scrub'); s.value = ${v}; s.dispatchEvent(new Event('input')) }`)
    await sleep(totalMs / steps)
  }
}

console.log('filming…')
await tab.eval(`window.scrollTo(0, 0)`)
await sleep(2000) // live mixtape, hold
await tab.eval(`document.getElementById('rewindBtn').click()`) // sepia: you're in memory
await sleep(1200)
const [lo, hi] = await tab.eval(`[Number(document.getElementById('scrub').min), Number(document.getElementById('scrub').max)]`)
await sweep(hi, lo, 36, 9000) // the tape un-grows to the first track
await sleep(2200) // hold at the beginning
await sweep(lo, lo + (hi - lo) * 0.55, 14, 3200) // partway back
await sleep(900)
await tab.eval(`document.querySelector('nav [data-view="chat"]').click()`) // same moment, chat skin
await sleep(2400)
await tab.eval(`document.querySelector('nav [data-view="mixtape"]').click()`)
await sleep(1200)
await sweep(lo + (hi - lo) * 0.55, hi, 16, 3000) // forward to the newest moment
await sleep(900)
await tab.eval(`document.getElementById('backToLive').click()`) // color comes back
await sleep(1500)
await tab.eval(`void window.spool.wind({ kind: 'note', body: 'and we are back in the present ✨' })`) // alive again
await sleep(2600)

filming = false
await capture
console.log(`filmed ${frameN} frames → ${FRAMES_DIR}`)

chrome.kill()
relayProc.kill('SIGKILL')
server.close()
