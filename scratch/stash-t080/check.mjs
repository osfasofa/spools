// T-080 stash/export sanity check in the real client: stash lists keepsakes
// (labels, links), forget is a two-click ceremony that provably deletes the
// database, and the full keepsake story holds — export the file, forget the
// spool, import the file, everything is back with no relay needed.
// Plumbing copied from scratch/scrub-t061.
//
// Run: node scratch/stash-t080/check.mjs

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CDP_PORT = 9336
const RELAY_PORT = 9404
const ORIGIN = 8783
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
}

const KEY = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url')
const code = `stash-check-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
const relayParam = encodeURIComponent(`ws://localhost:${RELAY_PORT}/yjs`)
const link = `http://localhost:${ORIGIN}/#spool=${code}&relay=${relayParam}&k=${KEY}`

const server = await serveClient(ORIGIN)
const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', `--remote-debugging-port=${CDP_PORT}`,
   `--user-data-dir=${join(tmpdir(), `t080-profile-${Date.now()}`)}`, '--no-first-run'],
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
  await tab.eval(`
    void window.spool.wind({ kind: 'note', body: 'keepsake one' })
    void window.spool.wind({ kind: 'note', body: 'keepsake two' })
    void window.spool.wind({ kind: 'track', body: '', data: { url: 'https://x.example/1', title: 'Taillights', artist: 'Motel Coffee' } })
  `)
  await sleep(800) // let y-indexeddb flush

  // --- stash lists the current spool, with its sealed link
  await tab.eval(`document.getElementById('stashBtn').click()`)
  await tab.until(`document.querySelectorAll('#stashList li').length >= 1`, 5_000, 'stash row')
  const row = await tab.eval(`(async () => {
    const rows = await window.spools.stash.list()
    return rows.find((r) => r.code === ${JSON.stringify(code)})
  })()`)
  if (!row) fail('current spool missing from stash')
  else {
    if (!row.stored) fail('stash row not marked stored')
    if (!row.link || !row.link.includes('k=')) fail('stash row link lost the key')
    else ok('stash lists the keepsake: stored, sealed link intact')
  }

  // --- label it
  await tab.eval(`{
    const input = document.querySelector('#stashList li input.label')
    input.value = 'the check tape'
    input.dispatchEvent(new Event('change'))
  }`)
  const labeled = await tab.eval(`(async () => (await window.spools.stash.list()).find((r) => r.code === ${JSON.stringify(code)}).label)()`)
  if (labeled !== 'the check tape') fail(`label didn't persist: ${labeled}`)
  else ok('labeling works')

  // --- the keepsake story: export the file, forget the spool, import it back
  const file = await tab.eval(`window.spool.export()`)
  const parsed = JSON.parse(file)
  if (parsed.entries.length !== 3 || parsed.format !== 'spool-export') fail('export file malformed')
  else ok(`export file readable: ${parsed.entries.length} entries, format ${parsed.format}`)

  // forget ceremony: first click arms, second executes (current spool → fresh page)
  await tab.eval(`{
    const forget = [...document.querySelectorAll('#stashList li button')].find((b) => b.textContent === 'forget')
    forget.click()
  }`)
  const armedText = await tab.eval(`[...document.querySelectorAll('#stashList li button')].find((b) => b.dataset.armed === '1')?.textContent`)
  if (armedText !== 'really forget forever?') fail(`ceremony not armed: ${armedText}`)
  else ok('forget arms first — no single-click destruction')
  await tab.eval(`[...document.querySelectorAll('#stashList li button')].find((b) => b.dataset.armed === '1').click()`)
  await tab.until(`window.spool && window.spool.code !== ${JSON.stringify(code)}`, 20_000, 'fresh spool after forget')
  const gone = await tab.eval(`(async () => !(await indexedDB.databases()).some((d) => d.name === ${JSON.stringify(code)}))()`)
  if (!gone) fail('forgotten spool database still exists')
  else ok('forget provably removed the IndexedDB database')

  // import the file back — no relay in play for the import itself
  await tab.eval(`(async () => {
    const s = await window.spools.importSpool(${JSON.stringify(file)}, { author: 'checker' })
    await s.leave()
  })()`)
  await tab.eval(`location.hash = '#spool=${code}'`) // hashchange → reload → opens from IDB
  await tab.until(`window.spool && window.spool.code === ${JSON.stringify(code)} && window.spool.entries.length === 3`, 20_000, 'imported spool restored')
  const bodies = await tab.eval(`window.spool.entries.map((e) => e.body ?? '')`)
  if (!bodies.includes('keepsake one')) fail('imported content wrong')
  else ok('import restored the keepsake from the file alone — entries all present')

  if (tab.errors.length) fail(`page errors: ${tab.errors[0]}`)
  else ok('zero page errors throughout')
} finally {
  chrome.kill()
  relayProc.kill('SIGKILL')
  server.close()
}
console.log(process.exitCode ? '\n✘ T-080 stash check FAILED' : '\n✔ T-080 stash check passed')
