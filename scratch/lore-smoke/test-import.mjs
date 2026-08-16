// T-158 acceptance: file import via the picker lands a take with provenance;
// the drop path (same code path, called with a constructed File) places at
// the given lane; a non-audio file fails with a sentence; line-in without a
// share errors honestly (live tab capture is a real-hardware row).
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

// through the real sheet + picker
await page.evaluate(() => lore.engine.seek(1.0))
await page.click('#importBtn')
await page.setInputFiles('.sheet input[type="file"]', 'grandma-392.wav')
await page.waitForTimeout(1200)
const picked = await page.evaluate(() => {
  const t = lore.reel().takes[0]
  return t ? { at: +t.tape.at.toFixed(2), track: t.tape.track, dur: +t.tape.dur.toFixed(2), source: t.source, held: lore.store.hasSync(t.audio.sha256) } : null
})
console.log('picker import:', JSON.stringify(picked))

// the drop path: same function, dropped-at coordinates (track 2, t=3)
const dropped = await page.evaluate(async () => {
  const res = await fetch('grandma-392.wav').catch(() => null)
  // no server copy of the wav — synthesize the same file client-side instead
  const sr = 22050
  const n = Math.floor(sr * 0.8)
  const buf = new ArrayBuffer(44 + n * 2)
  const v = new DataView(buf)
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
  ws(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  ws(36, 'data'); v.setUint32(40, n * 2, true)
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin((i / sr) * 660 * 2 * Math.PI) * 12000, true)
  const f = new File([buf], 'the-song-they-danced-to.wav', { type: 'audio/wav' })
  await lore.importFiles([f], 3.0, 2)
  const t = lore.reel().takes.find((k) => k.tape.track === 2)
  return t ? { at: t.tape.at, track: t.tape.track, name: t.source && t.source.name } : null
})
console.log('drop-path import:', JSON.stringify(dropped))

// a file that is not audio fails with a sentence, not a crash
const badFile = await page.evaluate(async () => {
  const f = new File([new Uint8Array([1, 2, 3, 4])], 'notes.txt', { type: 'text/plain' })
  await lore.importFiles([f], 0, 0)
  const toast = document.querySelector('.toast')
  return toast ? toast.textContent : null
})
console.log('bad file toast:', JSON.stringify(badFile))

// line-in in a headless session: expect the honest failure sentence (real
// tab capture is a hardware row in TESTING.md)
const lineIn = await page.evaluate(async () => {
  try {
    await lore.engine.punchIn(0, 'line')
    return 'captured (unexpected in headless)'
  } catch (err) {
    return err.message
  }
})
console.log('line-in headless:', JSON.stringify(lineIn))
await page.screenshot({ path: 'imported.png' })
await browser.close()
