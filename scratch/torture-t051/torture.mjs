// T-051 encrypted torture harness: the full T-021 checklist rerun with an
// ENCRYPTED spool (every link carries k=), against the real packages/
// spools-relay, plus S7: encrypted rtc-only sync (the /yjs sync path dead
// from birth, signaling alive, y-webrtc password channel carries the doc).
// Executes in headless Chrome via CDP. Zero npm deps — Node 24 built-ins
// only; the relay brings its own `ws`.
//
// Run: node scratch/torture-t051/torture.mjs
// Needs: Chrome at CHROME_BIN or the macOS default path; workspace installed,
// vendor bundle rebuilt (tsup --config tsup.client.config.ts).
//
// Origins stand in for devices: each port gets its own IndexedDB and
// localStorage, and cross-origin tabs share no BroadcastChannel — so any
// convergence below is genuine network sync. "Offline" = the relay process
// is SIGKILLed (severs established sockets, which DevTools offline does not).
// Scenarios 1–5 run with WebRTC disabled (patched out pre-load): the one-URL
// convention gives local relays signaling, and an established rtc mesh would
// otherwise carry sync straight through a relay kill and fake the results.
// S6 is the scenario where that redundancy is the thing being proven.

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
  relayProc = spawn(process.execPath, [new URL('../../packages/spools-relay/server.js', here).pathname], {
    stdio: ['ignore', 'pipe', 'inherit'],
    env: { ...process.env, PORT: String(RELAY_PORT), HOST: '127.0.0.1' },
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
  /** open a tab; opts.patch runs before any page script (e.g. to delete RTCPeerConnection) */
  static async open(url, opts = {}) {
    const info = await (
      await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' })
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

// injected before page scripts in scenarios 1–5: no WebRTC, so killing the
// relay process is a true total outage (see header comment)
const RTC_OFF = 'delete window.RTCPeerConnection; delete window.webkitRTCPeerConnection;'

// injected for S7: reroute the /yjs sync socket to a dead port so websocket
// sync never exists, while root-path signaling still reaches the relay —
// convergence can then only come from the encrypted y-webrtc channel
const WS_SYNC_OFF = `{
  const RealWS = window.WebSocket
  window.WebSocket = class extends RealWS {
    constructor(url, protocols) {
      const s = String(url)
      super(s.includes('/yjs/') ? s.replace(/:\\d+\\/yjs\\//, ':1/yjs/') : s, protocols)
    }
  }
}`

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

// one key for the whole run, URL-safe unpadded base64 as k= carries it
const KEY = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url')

const linkFor = (origin, code) =>
  `http://localhost:${origin}/#spool=${code}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}&k=${KEY}`

const freshCode = () => `torture-sealed-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

const ENTRY_COUNT = 'window.spool.entries.length'

// ---------- run ----------

const servers = await Promise.all(ORIGINS.map(serveClient))
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${join(tmpdir(), `t051-profile-${Date.now()}`)}`,
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
    tabA = await Tab.open(linkFor(ORIGINS[0], code1), { patch: RTC_OFF })
    await tabA.ready()
    await tabA.eval(`for (let i = 1; i <= 5; i++) void window.spool.wind({ kind: 'note', body: 'entry ' + i })`)
    await tabA.until(`${ENTRY_COUNT} === 5`, 5_000)
    await sleep(1_000) // let y-indexeddb flush
    await relayDown()
    await tabA.reload()
    await tabA.ready()
    const n = await tabA.eval(ENTRY_COUNT)
    const status = await tabA.eval('window.spool.status')
    const fp = await tabA.eval('window.spool.keyFingerprint')
    if (n !== 5) throw new Error(`expected 5 entries from IDB, got ${n}`)
    if (status === 'connected') throw new Error('status says connected but the relay is dead — IDB not proven')
    if (!fp) throw new Error('keyFingerprint is null — the k= key did not reach the spool')
    return `5/5 entries with status '${status}' (relay dead), key ${fp}…`
  })

  // S2 — offline wind, then reconnect converges (relay restart heals via resync)
  await scenario('S2 offline wind → reconnect converges', async () => {
    await relayUp()
    await tabA.until(`window.spool.status === 'connected'`, 15_000)
    tabB = await Tab.open(linkFor(ORIGINS[1], code1), { patch: RTC_OFF })
    await tabB.ready()
    await tabB.until(`${ENTRY_COUNT} === 5`, 30_000, 'B converges to 5')
    await relayDown()
    await tabA.until(`window.spool.status !== 'connected'`, 10_000, 'A notices the outage')
    await tabA.eval(`for (let i = 1; i <= 3; i++) void window.spool.wind({ kind: 'note', body: 'offline ' + i })`)
    const n = await tabA.eval(ENTRY_COUNT)
    if (n !== 8) throw new Error(`offline wind broke locally: ${n}/8`)
    const rows = await tabA.eval(`document.querySelectorAll('[data-id]').length`)
    if (rows !== 8) throw new Error(`UI did not render offline entries: ${rows}/8 rows`)
    await relayUp()
    const ms = await tabB.until(`${ENTRY_COUNT} === 8`, 60_000, 'B converges to 8 after reconnect')
    return `B caught up ${Math.round(ms / 1000)} s after relay restart (resync interval 20 s)`
  })

  // S3 — both sides diverge offline, same entry body, character-level merge
  await scenario('S3 both diverge offline → merge, no lost characters', async () => {
    await relayUp() // scenarios own their starting relay state (a failed predecessor may leave it down)
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
    await relayUp()
    await tabA.eval(`for (let i = ${ENTRY_COUNT}; i < 20; i++) void window.spool.wind({ kind: 'note', body: 'filler ' + i })`)
    await tabA.until(`${ENTRY_COUNT} === 20`, 5_000)
    const tabC = await Tab.open(linkFor(ORIGINS[2], code1), { patch: RTC_OFF })
    await tabC.ready()
    const ms = await tabC.until(`${ENTRY_COUNT} === 20`, 30_000, 'C converges to 20')
    await tabC.close()
    return `fresh origin converged 20/20 in ${(ms / 1000).toFixed(1)} s`
  })

  // S5 — nobody home: clean empty state, no error spiral; converges when a peer arrives
  await scenario('S5 nobody home → quiet wait → peer arrives', async () => {
    await relayUp()
    const code2 = freshCode()
    const tabC = await Tab.open(linkFor(ORIGINS[2], code2), { patch: RTC_OFF })
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

  // S6 — relay process dies mid-session, established WebRTC keeps syncing.
  // The one-URL convention gives the local relay signaling, so this now runs
  // fully against spools-relay: SIGKILL takes down sync AND rendezvous (the
  // honest single-host outage) and the already-formed mesh carries on.
  await scenario('S6 relay outage mid-session → WebRTC carries on', async () => {
    await relayUp()
    for (const tab of [tabA, tabB]) await tab.close()
    const code = freshCode()
    tabA = await Tab.open(linkFor(ORIGINS[0], code)) // no RTC_OFF: rtc is the subject here
    await tabA.ready()
    tabB = await Tab.open(linkFor(ORIGINS[1], code))
    await tabB.ready()
    await tabA.eval(`void window.spool.wind({ kind: 'note', body: 'baseline over the relay' })`)
    await tabB.until(`${ENTRY_COUNT} === 1`, 30_000, 'baseline sync')
    await sleep(10_000) // give the webrtc mesh time to form after signaling
    await relayDown() // SIGKILL: sync ws + signaling both die for real
    await tabA.eval(`void window.spool.wind({ kind: 'note', body: 'through the side door' })`)
    const ms = await tabB.until(`${ENTRY_COUNT} === 2`, 25_000, 'entry crosses without the relay')
    const statusB = await tabB.eval('window.spool.status')
    return `relay SIGKILLed; entry crossed in ${(ms / 1000).toFixed(1)} s; B status '${statusB}'`
  })

  // S7 — encrypted rtc-only: the /yjs sync socket is dead from birth (rerouted
  // to a closed port), signaling alive; sync must come entirely through the
  // encrypted y-webrtc data channel (the T-051 "rtc-only" transport proof)
  await scenario('S7 encrypted rtc-only (ws sync dead from birth)', async () => {
    await relayUp()
    for (const tab of [tabA, tabB]) await tab.close()
    const code = freshCode()
    tabA = await Tab.open(linkFor(ORIGINS[0], code), { patch: WS_SYNC_OFF })
    await tabA.ready()
    tabB = await Tab.open(linkFor(ORIGINS[1], code), { patch: WS_SYNC_OFF })
    await tabB.ready()
    await sleep(10_000) // mesh formation via signaling (T-021 note: <8 s can race)
    await tabA.eval(`void window.spool.wind({ kind: 'note', body: 'rtc only, sealed' })`)
    const ms = await tabB.until(`${ENTRY_COUNT} === 1`, 30_000, 'entry crosses rtc-only')
    const statusB = await tabB.eval('window.spool.status')
    if (statusB !== 'connected') throw new Error(`expected rtc to report connected, got '${statusB}'`)
    return `entry crossed in ${(ms / 1000).toFixed(1)} s with the sync socket dead; B status '${statusB}'`
  })
} finally {
  await relayDown()
  chrome.kill()
  for (const srv of servers) srv.close()
}

// ---------- report ----------

console.log('\n══ T-051 encrypted torture results ══')
for (const r of results) console.log(` ${r.pass ? '✔' : '✘'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`)
const failed = results.filter((r) => !r.pass)
process.exit(failed.length === 0 ? 0 : 1)
