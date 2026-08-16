// T-156 acceptance: cut shares one blob across two takes and tombstones the
// original; a lift-drag lands a mend (append-only, original wind untouched);
// sayings pin at the head; glosses thread under takes.
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
  const a = await lore.store.put(mkWav(440, 4), { dur: 4 })
  lore.wind({ kind: 'take', body: 'the long story', data: { audio: a, tape: { track: 0, at: 0.5, offset: 0, dur: 4, gain: 1, rate: 1 } } })
})
await page.waitForTimeout(400)

// --- cut via the sheet: park the head inside, tap the take, cut ---
await page.evaluate(() => lore.engine.seek(2.0))
const tapeBox = await page.locator('#tape').boundingBox()
// take on track 0 (first lane); tap inside it (x of tape-time 1.0)
const laneTop = tapeBox.y + 36
const xAtOne = await page.evaluate(() => {
  const w = document.getElementById('tape').getBoundingClientRect().width
  return (1.0 - lore.engine.pos()) * LoreTape.pxPerSec + w * 0.38
})
await page.mouse.click(tapeBox.x + xAtOne, laneTop + 40)
await page.waitForTimeout(400)
const sheetVisible = await page.locator('.sheet').count()
await page.click('.sheetBtn:has-text("cut at head")')
await page.waitForTimeout(500)

const afterCut = await page.evaluate(async () => {
  const takes = lore.reel().takes
  const usage = await lore.store.usage()
  return {
    takes: takes.map((t) => ({ at: +t.tape.at.toFixed(2), dur: +t.tape.dur.toFixed(2), off: +t.tape.offset.toFixed(2), sha: t.audio.sha256.slice(0, 6), origin: !!t.origin, caption: t.caption })),
    blobs: usage.blobs,
    tombstones: lore.spool.deleted.length,
  }
})
console.log('sheet opened:', sheetVisible, '— after cut:', JSON.stringify(afterCut, null, 1))

// --- lift-drag the right half to track 3: hold still 600ms, then drag down ---
const xRight = await page.evaluate(() => {
  const w = document.getElementById('tape').getBoundingClientRect().width
  const t = lore.reel().takes.find((k) => k.tape.at > 1.9)
  return (t.tape.at + 0.4 - lore.engine.pos()) * LoreTape.pxPerSec + w * 0.38
})
await page.mouse.move(tapeBox.x + xRight, laneTop + 40)
await page.mouse.down()
await page.waitForTimeout(650) // the lift
await page.mouse.move(tapeBox.x + xRight + 60, laneTop + 40 + 3 * (tapeBox.height - 36) / 4, { steps: 8 })
await page.mouse.up()
await page.waitForTimeout(400)

const afterMove = await page.evaluate(() => {
  const moved = lore.reel().takes.find((t) => t.mended)
  const mends = lore.spool.entries.filter((e) => e.kind === 'mend')
  return moved
    ? { track: moved.tape.track, at: +moved.tape.at.toFixed(2), woundAt: +moved.wound.at.toFixed(2), woundTrack: moved.wound.track, mends: mends.length }
    : { moved: null, mends: mends.length }
})
console.log('after lift-drag:', JSON.stringify(afterMove))

// --- words: pin a saying at the head ---
await page.evaluate(() => lore.engine.seek(0.5))
await page.click('#wordsBtn')
await page.fill('textarea.sheetInput', 'the night of the flat tire')
await page.click('.sheetBtn.primary')
await page.waitForTimeout(300)

// --- gloss the left half via its sheet ---
const xLeft = await page.evaluate(() => {
  const w = document.getElementById('tape').getBoundingClientRect().width
  const t = lore.reel().takes.find((k) => k.tape.at < 1.9)
  return (t.tape.at + 0.3 - lore.engine.pos()) * LoreTape.pxPerSec + w * 0.38
})
await page.mouse.click(tapeBox.x + xLeft, laneTop + 40)
await page.waitForTimeout(400)
await page.fill('.sheet input[placeholder*="gloss"]', 'grandma tells it with two tires')
await page.click('.sheetBtn:has-text("gloss")')
await page.waitForTimeout(300)

const final = await page.evaluate(() => {
  const r = lore.reel()
  return {
    sayings: r.sayings.map((s) => ({ at: +s.at.toFixed(2), body: s.body })),
    glossed: r.takes.map((t) => t.glosses.map((g) => g.body)),
    kinds: [...new Set(lore.spool.entries.map((e) => e.kind))].sort(),
  }
})
console.log('final:', JSON.stringify(final, null, 1))
await page.screenshot({ path: 'cut-words.png' })
await browser.close()
