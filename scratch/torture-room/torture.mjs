// T-126: the room's own torture rows — the group-scale scenarios the T-021
// checklist never needed. Ground rules inherited wholesale: distinct origins
// (same-origin tabs cheat via BroadcastChannel + shared IDB), kill the relay
// PROCESS for offline (DevTools offline lies), WebRTC off for offline
// scenarios (a surviving RTC mesh keeps syncing after the relay dies).
//
//  T1  reaction toggle race: both devices react, then both un-react,
//      concurrently — converged, never a double-count.
//  T2  offline divergence: relay killed mid-conversation, both sides write,
//      relay restarts → union everywhere, zero lost messages.
//  T3  5-seat midnight vs PRODUCTION: five app devices write and leave() on
//      DEFAULT_RELAY; a cold sixth — the DEPLOYED client at
//      osfasofa.github.io — reconstructs the union from the pocket alone
//      (milestone acceptance #5 + #7's union half, through the real app).
//
// The rest of the automated set lives in room-smoke.mjs (races 6/9/10,
// presence 11/13, arrival 7/8), room-scale.mjs (5 000 messages), and
// ring.mjs (K=8 ring semantics). apps/room/TESTING.md is the ledger.
//
// Run (repo root, after `pnpm build` in apps/room):
//   mise x -- node scratch/torture-room/torture.mjs

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CDP_PORT = 9373
const RELAY_PORT = 9493
const ORIGINS = [8811, 8812, 8813, 8814, 8815] // five app devices
const DEPLOYED = 'https://osfasofa.github.io/spools/room/'
const DEFAULT_RELAY = 'wss://spools-relay-production.up.railway.app/yjs'
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

const startRelay = () => {
  const proc = spawn(process.execPath, [new URL('../../packages/spools-relay/server.js', here).pathname], {
    stdio: ['ignore', 'pipe', 'inherit'],
    env: { ...process.env, PORT: String(RELAY_PORT), HOST: '127.0.0.1' },
  })
  return new Promise((resolve) => proc.stdout.once('data', () => resolve(proc)))
}

class Tab {
  static async open(url, { patch } = {}) {
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
    if (patch) await tab.call('Page.addScriptToEvaluateOnNewDocument', { source: patch })
    await tab.call('Page.navigate', { url })
    return tab
  }
  call(method, params = {}, timeoutMs = 15_000) {
    const id = ++this.msgId
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`${method}: no CDP reply in ${timeoutMs} ms`))
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
  ready(timeoutMs = 20_000) {
    return this.until('!!window.spool', timeoutMs, 'app ready')
  }
  async close() {
    this.ws.close()
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${this.id}`)
  }
}

const RTC_OFF = 'delete window.RTCPeerConnection; delete window.webkitRTCPeerConnection;'

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

const freshCode = () => `torture-room-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

// ---------- boot ----------

const servers = await Promise.all(ORIGINS.map(serveDist))
let relay = await startRelay()
const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${join(tmpdir(), `t126-${Date.now()}`)}`, '--no-first-run'],
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

const localLink = (o, code, key) => `http://localhost:${o}/#spool=${code}&relay=${encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)}&k=${key}`

// ---------- T1: reaction toggle race ----------

await scenario('T1. reaction toggle race across two devices — converged, never doubled', async () => {
  const code = freshCode()
  const key = randomBytes(32).toString('base64url')
  const a = await Tab.open(localLink(ORIGINS[0], code, key))
  await a.ready()
  const b = await Tab.open(localLink(ORIGINS[1], code, key))
  await b.ready()
  await a.eval(`window.spool.wind({ kind: 'message', body: 'react to me', data: { seat: localStorage.getItem('spool-seat') } })`)
  await b.until(`window.spool.entries.some((e) => e.body === 'react to me')`, 10_000, 'B has the message')

  const react = (tab) =>
    tab.eval(`(() => {
      const t = window.spool.entries.find((e) => e.body === 'react to me')
      window.spool.wind({ kind: 'reaction', parent: t.id, body: '👍', data: { seat: localStorage.getItem('spool-seat') } })
    })()`)
  await Promise.all([react(a), react(b)]) // the race: both at once
  const countExpr = `(() => {
    const t = window.spool.entries.find((e) => e.body === 'react to me')
    const seats = new Set(window.spool.entries.filter((e) => e.kind === 'reaction' && e.parent === t.id).map((e) => e.data.seat))
    return seats.size
  })()`
  await a.until(`${countExpr} === 2`, 10_000, 'both reactions land')
  await b.until(`${countExpr} === 2`, 10_000, 'both reactions land on B')
  const chipOnce = await a.eval(`(() => {
    const bub = [...document.querySelectorAll('.bubble')].find((el) => el.textContent.includes('react to me'))
    const chips = bub.parentElement.querySelectorAll('.reactionChip')
    return chips.length === 1 && chips[0].textContent.includes('2')
  })()`)
  if (!chipOnce) throw new Error('reaction chips fragmented or double-counted')

  const unreact = (tab) =>
    tab.eval(`(() => {
      const t = window.spool.entries.find((e) => e.body === 'react to me')
      const mine = window.spool.entries.find((e) => e.kind === 'reaction' && e.parent === t.id && e.data.seat === localStorage.getItem('spool-seat'))
      mine.delete()
    })()`)
  await Promise.all([unreact(a), unreact(b)]) // the race, reversed
  await a.until(`${countExpr} === 0`, 10_000, 'both un-reactions land')
  await b.until(`${countExpr} === 0`, 10_000, 'both un-reactions land on B')
  if (a.errors.length || b.errors.length) throw new Error(`page errors: ${[...a.errors, ...b.errors].join(' | ')}`)
  await a.close()
  await b.close()
  return 'concurrent react → one chip ×2 on both; concurrent un-react → clean zero on both'
})

// ---------- T2: offline divergence, relay killed and reborn ----------

await scenario('T2. offline divergence: relay dies, both write, relay returns → union, zero lost', async () => {
  const code = freshCode()
  const key = randomBytes(32).toString('base64url')
  const a = await Tab.open(localLink(ORIGINS[0], code, key), { patch: RTC_OFF })
  await a.ready()
  const b = await Tab.open(localLink(ORIGINS[1], code, key), { patch: RTC_OFF })
  await b.ready()
  await a.eval(`window.spool.wind({ kind: 'message', body: 'before the outage', data: { seat: localStorage.getItem('spool-seat') } })`)
  await b.until(`window.spool.entries.length === 1`, 10_000, 'baseline synced')

  relay.kill('SIGKILL') // the real thing — DevTools offline lies
  await a.until(`window.spool.status !== 'connected'`, 20_000, 'A notices the outage')
  await b.until(`window.spool.status !== 'connected'`, 20_000, 'B notices the outage')
  await a.eval(`(() => { for (let i = 0; i < 3; i++) window.spool.wind({ kind: 'message', body: 'A offline ' + i, data: { seat: localStorage.getItem('spool-seat') } }) })()`)
  await b.eval(`(() => { for (let i = 0; i < 3; i++) window.spool.wind({ kind: 'message', body: 'B offline ' + i, data: { seat: localStorage.getItem('spool-seat') } }) })()`)

  relay = await startRelay() // rebirth on the same port
  await a.until(`window.spool.entries.length === 7 && window.spool.status === 'connected'`, 40_000, 'A converges post-outage')
  await b.until(`window.spool.entries.length === 7`, 40_000, 'B converges post-outage')
  const union = await a.eval(`window.spool.entries.filter((e) => e.kind === 'message').map((e) => e.body).sort().join('|')`)
  const unionB = await b.eval(`window.spool.entries.filter((e) => e.kind === 'message').map((e) => e.body).sort().join('|')`)
  if (union !== unionB) throw new Error('devices converged to different worlds')
  if (a.errors.length || b.errors.length) throw new Error(`page errors: ${[...a.errors, ...b.errors].join(' | ')}`)
  await a.close()
  await b.close()
  return 'both wrote through the outage; reconnect converged both to the 7-entry union'
})

// ---------- T3: 5-seat midnight vs production, cold joiner = the deployed client ----------

await scenario('T3. five seats write + leave on DEFAULT_RELAY; the DEPLOYED client cold-opens the union', async () => {
  const code = freshCode()
  const key = randomBytes(32).toString('base64url')
  const prodLink = (base) => `${base}#spool=${code}&relay=${encodeURIComponent(DEFAULT_RELAY)}&k=${key}`

  for (let i = 0; i < 5; i++) {
    const t = await Tab.open(prodLink(`http://localhost:${ORIGINS[i]}/`))
    await t.ready()
    await t.until(`window.spool.status === 'connected'`, 25_000, `seat ${i + 1} reaches production`)
    await t.eval(`(async () => {
      const seat = localStorage.getItem('spool-seat')
      for (let m = 0; m < 3; m++) window.spool.wind({ kind: 'message', body: 'seat ${i + 1} says ' + m, data: { seat } })
      await window.spool.leave()
    })()`)
    await t.close() // everyone's asleep by midnight
  }

  const cold = await Tab.open(prodLink(DEPLOYED))
  await cold.ready()
  await cold.until(`window.spool.entries.filter((e) => e.kind === 'message').length === 15`, 30_000, 'deployed client reconstructs all 15 from the pocket')
  const phase = await cold.eval(`window.spool.pocket?.phase`)
  if (phase !== 'applied') throw new Error(`pocket phase ${phase}, expected applied`)
  const seats = await cold.eval(`new Set(window.spool.entries.filter((e) => e.kind === 'message').map((e) => e.data.seat)).size`)
  if (seats !== 5) throw new Error(`only ${seats}/5 worldviews present`)
  if (cold.errors.length) throw new Error(`page errors: ${cold.errors.join(' | ')}`)
  await cold.close()
  return `15/15 messages from 5 seats via the production pocket; phase=applied; cold joiner was the deployed client`
})

// ---------- report ----------

console.log('\n| # | Scenario | Result | Measured |')
console.log('|---|---|---|---|')
for (const r of results) console.log(`| ${r.name.split('.')[0]} | ${r.name.slice(r.name.indexOf(' ') + 1)} | ${r.pass ? '✔' : '✘'} | ${r.detail} |`)

chrome.kill('SIGKILL')
relay.kill('SIGKILL')
for (const s of servers) s.close()
process.exit(results.every((r) => r.pass) ? 0 : 1)
