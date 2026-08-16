// T-155 acceptance: varispeed glides (no restart), scrub is audible (grains
// fire) in both directions, rew/ff spool audibly, stop sags, detent returns 1×.
import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true })
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message))
await page.goto('http://localhost:8765/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1600)
if (await page.locator('.arrival').count()) await page.locator('.arrival').click()

await page.evaluate(async () => {
  const mkWav = (freq, secs, sr = 22050) => {
    const n = Math.floor(sr * secs)
    const buf = new ArrayBuffer(44 + n * 2)
    const v = new DataView(buf)
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
    ws(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ')
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
    ws(36, 'data'); v.setUint32(40, n * 2, true)
    for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin((i / sr) * freq * 2 * Math.PI) * 16000, true)
    return new Blob([buf], { type: 'audio/wav' })
  }
  const a = await lore.store.put(mkWav(220, 6), { dur: 6 })
  lore.wind({ kind: 'take', data: { audio: a, tape: { track: 0, at: 0, offset: 0, dur: 6, gain: 1, rate: 1 } } })
})
await page.waitForTimeout(500)

// varispeed: play at 1×, ramp to 1.8× — position advances faster, sources glide
const vari = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  lore.engine.seek(0)
  lore.engine.play()
  await sleep(800)
  const p1 = lore.engine.pos()
  lore.engine.setSpeed(1.8)
  await sleep(1000)
  const p2 = lore.engine.pos()
  const gained = (p2 - p1) // ≈ 1.8 · 1.0 minus a slice of ramp
  lore.engine.setSpeed(1)
  lore.engine.stop()
  await sleep(600)
  return { p1: p1.toFixed(3), p2: p2.toFixed(3), gained: gained.toFixed(3), rateAfterStop: lore.engine.rate().toFixed(4) }
})
console.log('varispeed:', JSON.stringify(vari))

// scrub: drag the canvas — pos moves opposite the drag, grains fire both ways
const scrub = await page.evaluate(() => { lore.engine.seek(2); return lore.engine._grains() })
const tape = page.locator('#tape')
const box = await tape.boundingBox()
const cy = box.y + box.height * 0.5
await page.mouse.move(box.x + 300, cy)
await page.mouse.down()
for (let i = 0; i < 12; i++) await page.mouse.move(box.x + 300 - i * 18, cy, { steps: 2 })
await page.mouse.up()
await page.waitForTimeout(200)
const afterFwd = await page.evaluate(() => ({ pos: lore.engine.pos().toFixed(3), grains: lore.engine._grains() }))
await page.mouse.move(box.x + 60, cy)
await page.mouse.down()
for (let i = 0; i < 12; i++) await page.mouse.move(box.x + 60 + i * 14, cy, { steps: 2 })
await page.mouse.up()
await page.waitForTimeout(200)
const afterBack = await page.evaluate(() => ({ pos: lore.engine.pos().toFixed(3), grains: lore.engine._grains() }))
console.log('scrub fwd-drag:', JSON.stringify(afterFwd), 'back-drag:', JSON.stringify(afterBack), 'grains before:', scrub)

// rew hold: spooling backwards, audibly
const rew = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  lore.engine.seek(4)
  const g0 = lore.engine._grains()
  lore.engine.windHold(-1)
  await sleep(700)
  const during = { pos: lore.engine.pos(), rate: lore.engine.rate() }
  lore.engine.windRelease()
  await sleep(500)
  return { g0, during: { pos: during.pos.toFixed(2), rate: during.rate.toFixed(2) }, after: { pos: lore.engine.pos().toFixed(2), rate: lore.engine.rate().toFixed(3) }, g1: lore.engine._grains() }
})
console.log('rew:', JSON.stringify(rew))

// the knob: keyboard up ×5 from 1× then Home back to the detent
await page.focus('#speedKnob')
for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowUp')
const knobUp = await page.evaluate(() => document.getElementById('speedKnob').getAttribute('aria-valuenow'))
await page.keyboard.press('Home')
const knobHome = await page.evaluate(() => document.getElementById('speedKnob').getAttribute('aria-valuenow'))
console.log('knob after 5×up:', knobUp, '— after Home:', knobHome)
await browser.close()
