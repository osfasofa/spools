// T-160 torture rows: two devices, one reel, a dumb local relay. The doc
// syncs sealed; the sound stays honest ghosts on the device that wasn't
// handed it. Then the naive reference client reads the same reel and
// degrades sanely (unknown kinds, body text).
import { chromium } from 'playwright-core'

const RELAY = 'ws://localhost:9876/yjs'
const relayParam = encodeURIComponent(RELAY)

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-proxy-server', '--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
})

// device A mints the reel on the local relay
const ctxA = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
const pageA = await ctxA.newPage()
pageA.on('pageerror', (e) => console.log('A PAGEERROR:', e.message))
await pageA.goto('http://localhost:8765/', { waitUntil: 'domcontentloaded' })
await pageA.waitForTimeout(1500)
if (await pageA.locator('.arrival').count()) await pageA.locator('.arrival').click()
const share = await pageA.evaluate(() => lore.spool.share())
const link = share.replace(/relay=[^&]+/, `relay=${relayParam}`)
console.log('the link:', link.slice(link.indexOf('#')))
await pageA.goto(link, { waitUntil: 'domcontentloaded' })
await pageA.reload({ waitUntil: 'domcontentloaded' })
await pageA.waitForTimeout(1800)

const statusA = await pageA.evaluate(() => lore.spool.status)
console.log('A status on local relay:', statusA)

// A winds a take and pins words
await pageA.evaluate(async () => {
  const sr = 22050
  const n = sr
  const buf = new ArrayBuffer(44 + n * 2)
  const v = new DataView(buf)
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
  ws(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  ws(36, 'data'); v.setUint32(40, n * 2, true)
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin((i / sr) * 262 * 2 * Math.PI) * 12000, true)
  const a = await lore.store.put(new Blob([buf], { type: 'audio/wav' }), { dur: 1 })
  lore.wind({ kind: 'take', body: 'as grandma told it', data: { audio: a, tape: { track: 0, at: 0, offset: 0, dur: 1, gain: 1, rate: 1 }, source: { type: 'mic' } } })
  lore.wind({ kind: 'saying', body: 'never on a tuesday', data: { tape: { at: 0.5 } } })
})

// device B opens the handed link — cold, nothing local
const ctxB = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
const pageB = await ctxB.newPage()
pageB.on('pageerror', (e) => console.log('B PAGEERROR:', e.message))
await pageB.goto(link, { waitUntil: 'domcontentloaded' })
await pageB.waitForTimeout(2500)
if (await pageB.locator('.arrival').count()) await pageB.locator('.arrival').click()

const onB = await pageB.evaluate(() => {
  const r = lore.reel()
  return {
    status: lore.spool.status,
    takes: r.takes.map((t) => ({ caption: t.caption, ghost: !lore.store.hasSync(t.audio.sha256) })),
    sayings: r.sayings.map((s) => s.body),
  }
})
console.log('B sees:', JSON.stringify(onB))
await pageB.screenshot({ path: 'device-b.png' })

// B glosses back; A sees it — the campfire goes both ways
await pageB.evaluate(() => {
  const take = lore.reel().takes[0]
  lore.wind({ kind: 'gloss', parent: take.id, body: 'my cousin swears it was a wednesday' })
})
await pageA.waitForTimeout(2000)
let backOnA = await pageA.evaluate(() => lore.reel().takes[0].glosses.map((g) => g.body))
console.log('A hears back (2s):', JSON.stringify(backOnA))
if (!backOnA.length) {
  // the §5 resync decision: a dumb relay can't answer a waiting peer, so
  // clients re-ask every 15–30s — give the heal path its window
  await pageA.waitForTimeout(28000)
  backOnA = await pageA.evaluate(() => lore.reel().takes[0].glosses.map((g) => g.body))
  console.log('A hears back (after resync window):', JSON.stringify(backOnA))
}
console.log('statuses now — A:', await pageA.evaluate(() => lore.spool.status), 'B:', await pageB.evaluate(() => lore.spool.status))

// the naive reference client reads the same reel — unknown kinds degrade to
// kind chips + body text (the forward-compatibility rule, watched live)
const pageC = await ctxA.newPage() // same device as A (shares idb)
await pageC.goto(`http://localhost:8767/client/index.html${link.slice(link.indexOf('#'))}`, { waitUntil: 'domcontentloaded' })
await pageC.waitForTimeout(2200)
const clientView = await pageC.evaluate(() => {
  // the list view renders every kind; switch to it
  const btn = [...document.querySelectorAll('nav [data-view]')].find((b) => b.dataset.view === 'list')
  if (btn) btn.click()
  return new Promise((resolve) => setTimeout(() => {
    resolve({ text: document.getElementById('view').textContent.slice(0, 400) })
  }, 400))
})
console.log('reference client list view:', JSON.stringify(clientView))
await pageC.screenshot({ path: 'client-degrade.png' })
await browser.close()
