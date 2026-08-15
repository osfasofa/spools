// T-104 midnight torture: the flagship async story, in a real browser.
// Device A (one origin) winds a keyed spool and leaves; device B (another
// origin, fresh IndexedDB, never overlapped with A) opens the link against
// an empty room and must render everything from the relay's pocket alone.
// Harness idiom copied from scratch/torture-t021 (raw CDP, zero npm deps).
//
// Run: node scratch/torture-t104/midnight.mjs
// Needs: Chrome at CHROME_BIN (defaults to the Playwright chromium path),
// workspace installed, vendor bundle current (pnpm run client:vendor).

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { createHash, randomBytes } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = process.env.CHROME_BIN ?? '/opt/pw-browsers/chromium'
const CDP_PORT = 9343
const RELAY_PORT = 9411
const OLD_RELAY_PORT = 9412
const ORIGINS = [8781, 8782] // device A, device B
const here = new URL('.', import.meta.url)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------- static file server (the client, as shipped) ----------

const serveClient = (port) =>
  new Promise((resolve) => {
    const root = new URL('../../apps/client/', import.meta.url)
    const types = { html: 'text/html', js: 'text/javascript', md: 'text/plain' }
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

// ---------- relays ----------

const startRelay = (script, port, cwd) => {
  const proc = spawn(process.execPath, [script], {
    stdio: ['ignore', 'pipe', 'inherit'],
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' },
    ...(cwd ? { cwd } : {}),
  })
  return new Promise((resolve) => proc.stdout.once('data', () => resolve(proc)))
}

// ---------- minimal CDP (verbatim idiom from torture-t021) ----------

class Tab {
  static async open(url, opts = {}) {
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
    if (opts.patch) await tab.call('Page.addScriptToEvaluateOnNewDocument', { source: opts.patch })
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
      await sleep(400)
    }
    throw new Error(`timeout (${timeoutMs} ms) waiting for: ${label}`)
  }

  ready(timeoutMs = 15_000) {
    return this.until('!!window.spool', timeoutMs, 'client ready')
  }

  async close() {
    this.ws.close()
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${this.id}`)
  }
}

const RTC_OFF = 'delete window.RTCPeerConnection; delete window.webkitRTCPeerConnection;'

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

const freshCode = () => `midnight-tape-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
const newKey = () => randomBytes(32)
const keyParam = (key) => key.toString('base64url')
const tokenFor = (key) =>
  createHash('sha512').update(Buffer.concat([Buffer.from('spool-pocket-v1'), key])).digest().subarray(0, 12).toString('base64url')
const linkFor = (origin, code, key, relayPort = RELAY_PORT) =>
  `http://localhost:${origin}/#spool=${code}&relay=${encodeURIComponent(`ws://localhost:${relayPort}/yjs`)}&k=${keyParam(key)}`

const depositCount = async (code, key) => {
  const res = await fetch(`http://127.0.0.1:${RELAY_PORT}/pocket/${code}/${tokenFor(key)}`)
  const json = await res.json()
  return (json.deposits ?? []).length
}

// ---------- run ----------

const servers = await Promise.all(ORIGINS.map(serveClient))
const relay = await startRelay(new URL('../../packages/spools-relay/server.js', here).pathname, RELAY_PORT)
const oldRelay = await startRelay(
  new URL('../spike-pocket/old-relay.js', here).pathname,
  OLD_RELAY_PORT,
  new URL('../spike-pocket/', here).pathname
)
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    // containerized/root environments (CI, remote sessions) refuse to start otherwise
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${join(tmpdir(), `t104-profile-${Date.now()}`)}`,
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

await scenario('7a. Midnight mixtape — deposit on leave(), cold open from the pocket alone', async () => {
  const code = freshCode()
  const key = newKey()

  // 9 pm: device A winds three tracks and closes the laptop. leave() must
  // flush the deposit well inside the 10 s debounce window.
  const a = await Tab.open(linkFor(ORIGINS[0], code, key), { patch: RTC_OFF })
  await a.ready()
  await a.eval(`(async () => {
    window.spool.wind({ kind: 'track', body: 'Track 1' })
    window.spool.wind({ kind: 'track', body: 'Track 2' })
    window.spool.wind({ kind: 'track', body: 'Track 3' })
    await window.spool.leave()
  })()`)
  await a.close()
  if ((await depositCount(code, key)) < 1) throw new Error('leave() left no deposit on the relay')

  // midnight: device B (fresh origin, fresh IndexedDB) opens the link. The
  // room is empty — anything it renders came from the pocket.
  const b = await Tab.open(linkFor(ORIGINS[1], code, key), { patch: RTC_OFF })
  await b.ready()
  const ms = await b.until('window.spool.entries.length === 3', 15_000, 'B renders all 3 tracks')
  const phase = await b.eval('window.spool.pocket?.phase')
  if (phase !== 'applied') throw new Error(`pocket phase is ${phase}, expected applied`)
  const beatSeen = await b.eval(`document.getElementById('pocket') !== null`)
  if (!beatSeen) throw new Error('the #pocket beat element is missing')
  if (b.errors.length) throw new Error(`page errors: ${b.errors.join(' | ')}`)
  await b.close()
  return `3/3 tracks in ~${ms} ms from an empty room; phase=applied; beat element present; 0 page errors`
})

await scenario('7b. Old relay — quiet unavailable, everything else works (the 200-trap, in vivo)', async () => {
  const code = freshCode()
  const key = newKey()
  const tab = await Tab.open(linkFor(ORIGINS[0], code, key, OLD_RELAY_PORT), { patch: RTC_OFF })
  await tab.ready()
  await tab.until(`window.spool.pocket?.phase === 'unavailable'`, 10_000, 'pocket settles unavailable')
  await tab.eval(`window.spool.wind({ kind: 'note', body: 'still fine on a v1 relay' })`)
  const count = await tab.eval('window.spool.entries.length')
  const beat = await tab.eval(`document.getElementById('pocket').textContent`)
  if (count !== 1) throw new Error('winding broke on an old relay')
  if (beat !== '') throw new Error(`beat should be silent on unavailable, showed: "${beat}"`)
  if (tab.errors.length) throw new Error(`page errors: ${tab.errors.join(' | ')}`)
  await tab.close()
  return 'phase=unavailable, beat silent, wind works, 0 page errors'
})

await scenario('7c. Nobody deposited yet — empty pocket is quiet, not an error', async () => {
  const code = freshCode()
  const key = newKey()
  const tab = await Tab.open(linkFor(ORIGINS[1], code, key), { patch: RTC_OFF })
  await tab.ready()
  await tab.until(`window.spool.pocket?.phase === 'empty'`, 10_000, 'pocket settles empty')
  const beat = await tab.eval(`document.getElementById('pocket').textContent`)
  if (beat !== '') throw new Error(`beat should be silent on empty, showed: "${beat}"`)
  if (tab.errors.length) throw new Error(`page errors: ${tab.errors.join(' | ')}`)
  await tab.close()
  return 'phase=empty, beat silent, 0 page errors'
})

// ---------- report ----------

console.log('\n| # | Scenario | Result | Measured |')
console.log('|---|---|---|---|')
for (const r of results) console.log(`| ${r.name.split('.')[0]} | ${r.name.slice(r.name.indexOf(' ') + 1)} | ${r.pass ? '✔' : '✘'} | ${r.detail} |`)

chrome.kill('SIGKILL')
relay.kill('SIGKILL')
oldRelay.kill('SIGKILL')
for (const s of servers) s.close()
process.exit(results.every((r) => r.pass) ? 0 : 1)
