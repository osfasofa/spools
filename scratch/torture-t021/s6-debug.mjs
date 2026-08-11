// S6 debug: did the webrtc mesh ever form? y-webrtc logs via lib0/logging
// when localStorage.log is set; capture everything.
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CDP_PORT = 9334
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const serveClient = (port) =>
  new Promise((resolve) => {
    const root = new URL('../../apps/client/', import.meta.url)
    const srv = createServer(async (req, res) => {
      const path = req.url === '/' ? 'index.html' : req.url.slice(1).split('?')[0]
      try {
        const data = await readFile(new URL(path, root))
        res.setHeader('content-type', path.endsWith('.html') ? 'text/html' : 'text/javascript')
        res.end(data)
      } catch {
        res.statusCode = 404
        res.end()
      }
    })
    srv.listen(port, () => resolve(srv))
  })

class Tab {
  static async open(url) {
    const info = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json()
    const tab = new Tab()
    tab.logs = []
    tab.ws = new WebSocket(info.webSocketDebuggerUrl)
    await new Promise((r) => tab.ws.addEventListener('open', r))
    tab.msgId = 0
    tab.pending = new Map()
    tab.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && tab.pending.has(msg.id)) {
        tab.pending.get(msg.id)(msg)
        tab.pending.delete(msg.id)
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        tab.logs.push(`[${msg.params.type}] ` + msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
      } else if (msg.method === 'Runtime.exceptionThrown') {
        tab.logs.push('[exception] ' + (msg.params.exceptionDetails?.exception?.description ?? '').split('\n')[0])
      }
    })
    const call = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++tab.msgId
        tab.pending.set(id, (m) => (m.error ? reject(new Error(m.error.message)) : resolve(m.result)))
        tab.ws.send(JSON.stringify({ id, method, params }))
      })
    tab.call = call
    await call('Runtime.enable')
    await call('Page.enable')
    return tab
  }
  async eval(expression) {
    const { result, exceptionDetails } = await this.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'page exception')
    return result.value
  }
  async until(expression, timeoutMs) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      try {
        if (await this.eval(expression)) return
      } catch {}
      await sleep(400)
    }
    throw new Error('timeout: ' + expression)
  }
}

const PATCH = `(() => {
  try { localStorage.log = '*' } catch {}
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

const servers = await Promise.all([serveClient(8781), serveClient(8782)])
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${join(tmpdir(), `s6dbg-${Date.now()}`)}`, '--no-first-run'], { stdio: 'ignore' })
for (let i = 0; i < 40; i++) {
  try { await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`); break } catch { await sleep(250) }
}

try {
  const tabA = await Tab.open('about:blank')
  await tabA.call('Page.addScriptToEvaluateOnNewDocument', { source: PATCH })
  await tabA.call('Page.navigate', { url: 'http://localhost:8781/' })
  await tabA.until('!!window.spool', 15000)
  const share = await tabA.eval('window.spool.share()')
  const fragment = share.slice(share.indexOf('#'))

  const tabB = await Tab.open('about:blank')
  await tabB.call('Page.addScriptToEvaluateOnNewDocument', { source: PATCH })
  await tabB.call('Page.navigate', { url: `http://localhost:8782/${fragment}` })
  await tabB.until('!!window.spool', 15000)

  await tabA.eval(`void window.spool.wind({ kind: 'note', body: 'baseline' })`)
  await tabB.until('window.spool.entries.length === 1', 30000)
  console.log('baseline synced; waiting 10 s for mesh…')
  await sleep(10000)

  const cutA = await tabA.eval(`window.__wsOutage(['foshoio'])`)
  const cutB = await tabB.eval(`window.__wsOutage(['foshoio'])`)
  console.log(`cut sockets: A=${cutA} B=${cutB}`)
  await sleep(2000)
  console.log('statusA after cut:', await tabA.eval('window.spool.status'))
  console.log('statusB after cut:', await tabB.eval('window.spool.status'))

  await tabA.eval(`void window.spool.wind({ kind: 'note', body: 'side door' })`)
  try {
    await tabB.until('window.spool.entries.length === 2', 20000)
    console.log('RESULT: entry crossed without relay — webrtc works')
  } catch {
    console.log('RESULT: entry did NOT cross')
  }

  console.log('\n--- tabA logs (webrtc-related) ---')
  for (const l of tabA.logs.filter((l) => /webrtc|signal|peer|rtc/i.test(l)).slice(0, 40)) console.log(l)
  console.log('\n--- tabB logs (webrtc-related) ---')
  for (const l of tabB.logs.filter((l) => /webrtc|signal|peer|rtc/i.test(l)).slice(0, 40)) console.log(l)
  console.log('\n--- tabA all logs (first 20) ---')
  for (const l of tabA.logs.slice(0, 20)) console.log(l)
} finally {
  chrome.kill()
  for (const s of servers) s.close()
}
