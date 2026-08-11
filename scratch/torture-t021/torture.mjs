// T-021 sync torture harness. Executes apps/client/TESTING.md scenarios
// against the real client (apps/client, vendor bundle included) in headless
// Chrome via CDP. Zero npm deps — Node 24 built-ins only; the relay child
// reuses the T-003 spike (which brings its own `ws`).
//
// Run: node scratch/torture-t021/torture.mjs
// Needs: Chrome at CHROME_BIN or the macOS default path; spike node_modules
// installed (scratch/spike-dumb-relay: pnpm install --ignore-workspace).
//
// Origins stand in for devices: each port gets its own IndexedDB and
// localStorage, and cross-origin tabs share no BroadcastChannel — so any
// convergence below is genuine network sync. "Offline" = the relay process
// is SIGKILLed (severs established sockets, which DevTools offline does not).

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CDP_PORT = 9333
const RELAY_PORT = 9401
const ORIGINS = [8771, 8772, 8773] // A, B, C — three "devices"
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

// ---------- relay lifecycle ----------

let relayProc = null
const relayUp = async () => {
  if (relayProc) return
  relayProc = spawn(process.execPath, [new URL('relay-server.mjs', here).pathname, String(RELAY_PORT)], {
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  await new Promise((resolve) => relayProc.stdout.once('data', resolve))
}
const relayDown = async () => {
  if (!relayProc) return
  relayProc.kill('SIGKILL')
  relayProc = null
  await sleep(300) // let the RSTs land
}

// ---------- minimal CDP ----------

class Tab {
  static async open(url) {
    const info = await (
      await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })
    ).json()
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
    return tab
  }

  call(method, params = {}) {
    const id = ++this.msgId
    return new Promise((resolve, reject) => {
      this.pending.set(id, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)))
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  /** evaluate an expression, await promises, return by value; throws on page exception */
  async eval(expression) {
    const { result, exceptionDetails } = await this.call('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'page exception')
    return result.value
  }

  /** poll until a page-side boolean expression is true */
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

  async navigate(url) {
    await this.call('Page.navigate', { url })
  }

  async reload() {
    await this.call('Page.reload')
  }

  /** ready = the client finished open/new (window.spool live) */
  ready(timeoutMs = 15_000) {
    return this.until('!!window.spool', timeoutMs, 'client ready')
  }

  async close() {
    this.ws.close()
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${this.id}`)
  }
}

// injected before page scripts (scenario 6): lets the harness sever live
// relay sockets and make new ones fail, like the relay host going dark.
// WebRTC is untouched — that's the point.
const WS_OUTAGE_PATCH = `(() => {
  const Orig = window.WebSocket
  const live = new Set()
  let blocked = []
  window.WebSocket = function (url, protocols) {
    if (blocked.some((p) => String(url).includes(p))) return new Orig('ws://127.0.0.1:1')
    const ws = protocols === undefined ? new Orig(url) : new Orig(url, protocols)
    live.add(ws)
    return ws
  }
  window.WebSocket.prototype = Orig.prototype
  for (const k of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) window.WebSocket[k] = Orig[k]
  window.__wsOutage = (patterns) => {
    blocked = patterns
    let cut = 0
    for (const ws of live) if (patterns.some((p) => ws.url.includes(p))) { ws.close(); cut++ }
    return cut
  }
})()`

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

const linkFor = (origin, code) =>
  `http://localhost:${origin}/#spool=${code}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}`)}`

const freshCode = () => `torture-relay-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

const ENTRY_COUNT = 'window.spool.entries.length'

// ---------- run ----------

const servers = await Promise.all(ORIGINS.map(serveClient))
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${join(tmpdir(), `t021-profile-${Date.now()}`)}`,
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

const code1 = freshCode()
let tabA, tabB
let divergedBody = ''

try {
  // S1 — refresh survives with the network dead: entries come from IndexedDB
  await scenario('S1 refresh-is-IndexedDB (5 entries, relay killed, hard reload)', async () => {
    await relayUp()
    tabA = await Tab.open(linkFor(ORIGINS[0], code1))
    await tabA.ready()
    await tabA.eval(`for (let i = 1; i <= 5; i++) void window.spool.wind({ kind: 'note', body: 'entry ' + i })`)
    await tabA.until(`${ENTRY_COUNT} === 5`, 5_000)
    await sleep(1_000) // let y-indexeddb flush
    await relayDown()
    await tabA.reload()
    await tabA.ready()
    const n = await tabA.eval(ENTRY_COUNT)
    const status = await tabA.eval('window.spool.status')
    if (n !== 5) throw new Error(`expected 5 entries from IDB, got ${n}`)
    if (status === 'connected') throw new Error('status says connected but the relay is dead — IDB not proven')
    return `5/5 entries with status '${status}' (relay dead)`
  })

  // S2 — offline wind, then reconnect converges (relay restart heals via resync)
  await scenario('S2 offline wind → reconnect converges', async () => {
    await relayUp()
    await tabA.until(`window.spool.status === 'connected'`, 15_000)
    tabB = await Tab.open(linkFor(ORIGINS[1], code1))
    await tabB.ready()
    await tabB.until(`${ENTRY_COUNT} === 5`, 30_000, 'B converges to 5')
    await relayDown()
    await tabA.until(`window.spool.status !== 'connected'`, 10_000, 'A notices the outage')
    await tabA.eval(`for (let i = 1; i <= 3; i++) void window.spool.wind({ kind: 'note', body: 'offline ' + i })`)
    const n = await tabA.eval(ENTRY_COUNT)
    if (n !== 8) throw new Error(`offline wind broke locally: ${n}/8`)
    const rows = await tabA.eval(`document.getElementById('list').children.length`)
    if (rows !== 8) throw new Error(`UI did not render offline entries: ${rows}/8 rows`)
    await relayUp()
    const ms = await tabB.until(`${ENTRY_COUNT} === 8`, 60_000, 'B converges to 8 after reconnect')
    return `B caught up ${Math.round(ms / 1000)} s after relay restart (resync interval 20 s)`
  })

  // S3 — both sides diverge offline, same entry body, character-level merge
  await scenario('S3 both diverge offline → merge, no lost characters', async () => {
    const id = await tabA.eval(`window.spool.wind({ kind: 'note', body: 'the quick brown fox' }).id`)
    await tabB.until(`window.spool.entries.some((e) => e.id === ${JSON.stringify(id)})`, 30_000, 'B has the target entry')
    await relayDown()
    await tabA.eval(`window.spool.entries.find((e) => e.id === ${JSON.stringify(id)}).text.insert(0, 'A> ')`)
    await tabA.eval(`void window.spool.wind({ kind: 'note', body: 'wound on A while offline' })`)
    await tabB.eval(`{ const t = window.spool.entries.find((e) => e.id === ${JSON.stringify(id)}).text; t.insert(t.length, ' <B') }`)
    await tabB.eval(`void window.spool.wind({ kind: 'note', body: 'wound on B while offline' })`)
    await relayUp()
    for (const tab of [tabA, tabB]) await tab.until(`${ENTRY_COUNT} === 11`, 60_000, 'all 11 entries everywhere')
    const bodyA = await tabA.eval(`window.spool.entries.find((e) => e.id === ${JSON.stringify(id)}).body`)
    const bodyB = await tabB.eval(`window.spool.entries.find((e) => e.id === ${JSON.stringify(id)}).body`)
    if (bodyA !== bodyB) throw new Error(`bodies disagree: ${JSON.stringify(bodyA)} vs ${JSON.stringify(bodyB)}`)
    if (bodyA !== 'A> the quick brown fox <B') throw new Error(`merge lost characters: ${JSON.stringify(bodyA)}`)
    divergedBody = bodyA
    return `merged to ${JSON.stringify(bodyA)} on both sides`
  })

  // S4 — cold late join through the dumb relay (peer online answers step1)
  await scenario('S4 cold late join (fresh device, 20 entries, peer online)', async () => {
    await tabA.eval(`for (let i = ${ENTRY_COUNT}; i < 20; i++) void window.spool.wind({ kind: 'note', body: 'filler ' + i })`)
    await tabA.until(`${ENTRY_COUNT} === 20`, 5_000)
    const tabC = await Tab.open(linkFor(ORIGINS[2], code1))
    await tabC.ready()
    const ms = await tabC.until(`${ENTRY_COUNT} === 20`, 30_000, 'C converges to 20')
    await tabC.close()
    return `fresh origin converged 20/20 in ${(ms / 1000).toFixed(1)} s`
  })

  // S5 — nobody home: clean empty state, no error spiral; converges when a peer arrives
  await scenario('S5 nobody home → quiet wait → peer arrives', async () => {
    const code2 = freshCode()
    const tabC = await Tab.open(linkFor(ORIGINS[2], code2))
    await tabC.ready()
    await sleep(10_000) // sit alone for a while
    const n = await tabC.eval(ENTRY_COUNT)
    const status = await tabC.eval('window.spool.status')
    if (n !== 0) throw new Error(`expected clean empty state, got ${n} entries`)
    if (tabC.errors.length > 0) throw new Error(`console errors while waiting: ${tabC.errors[0]}`)
    await tabB.navigate(linkFor(ORIGINS[1], code2))
    // hashchange → reload (client behavior); wait for the NEW spool, not the
    // old context that briefly survives the fragment navigation
    await tabB.until(`window.spool && window.spool.code === ${JSON.stringify(code2)}`, 20_000, 'B reloaded onto the new spool')
    await tabB.eval(`void window.spool.wind({ kind: 'note', body: 'anybody there?' })`)
    const ms = await tabC.until(`${ENTRY_COUNT} === 1`, 45_000, 'C hears the late peer')
    await tabC.close()
    return `10 s alone: 0 entries, 0 errors, status '${status}'; converged ${Math.round(ms / 1000)} s after peer wound`
  })

  // S6 — relay host dark, established WebRTC keeps syncing (fosho relay + signaling)
  await scenario('S6 relay outage mid-session → WebRTC carries on', async () => {
    for (const tab of [tabA, tabB]) await tab.close()
    tabA = await Tab.open('about:blank')
    await tabA.call('Page.addScriptToEvaluateOnNewDocument', { source: WS_OUTAGE_PATCH })
    await tabA.navigate(`http://localhost:${ORIGINS[0]}/`)
    await tabA.ready()
    const share = await tabA.eval(`window.spool.share()`)
    const fragment = share.slice(share.indexOf('#'))
    tabB = await Tab.open('about:blank')
    await tabB.call('Page.addScriptToEvaluateOnNewDocument', { source: WS_OUTAGE_PATCH })
    await tabB.navigate(`http://localhost:${ORIGINS[1]}/${fragment}`)
    await tabB.ready()
    await tabA.eval(`void window.spool.wind({ kind: 'note', body: 'baseline over the relay' })`)
    await tabB.until(`${ENTRY_COUNT} === 1`, 30_000, 'baseline sync')
    await sleep(10_000) // give the webrtc mesh time to form after signaling
    const cutA = await tabA.eval(`window.__wsOutage(['foshoio'])`)
    const cutB = await tabB.eval(`window.__wsOutage(['foshoio'])`)
    await tabA.eval(`void window.spool.wind({ kind: 'note', body: 'through the side door' })`)
    const ms = await tabB.until(`${ENTRY_COUNT} === 2`, 25_000, 'entry crosses without the relay')
    const statusB = await tabB.eval('window.spool.status')
    return `severed ${cutA}+${cutB} sockets (relay+signaling); entry crossed in ${(ms / 1000).toFixed(1)} s; B status '${statusB}'`
  })
} finally {
  await relayDown()
  chrome.kill()
  for (const srv of servers) srv.close()
}

// ---------- report ----------

console.log('\n══ T-021 torture results ══')
for (const r of results) console.log(` ${r.pass ? '✔' : '✘'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`)
const failed = results.filter((r) => !r.pass)
process.exit(failed.length === 0 ? 0 : 1)
