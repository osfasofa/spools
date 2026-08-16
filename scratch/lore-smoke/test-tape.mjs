// T-154 acceptance: takes on two tracks play mixed and aligned; ghosts stay
// silent and honest; the playhead advances at ~1x against the wall clock.
import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message))
await page.goto('http://localhost:8765/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1800)
const arrival = page.locator('.arrival')
if (await arrival.count()) await arrival.click()

const seeded = await page.evaluate(async () => {
  // two tones: 330 Hz on track 1 (0..2s), 550 Hz on track 2 (0.8..2.3s)
  const mkWav = (freq, secs, sr = 22050) => {
    const n = Math.floor(sr * secs)
    const buf = new ArrayBuffer(44 + n * 2)
    const v = new DataView(buf)
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
    ws(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ')
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
    ws(36, 'data'); v.setUint32(40, n * 2, true)
    for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin((i / sr) * freq * 2 * Math.PI) * 16000 * (0.4 + 0.6 * Math.abs(Math.sin(i / sr * 3))), true)
    return new Blob([buf], { type: 'audio/wav' })
  }
  const a = await lore.store.put(mkWav(330, 2.0), { dur: 2.0 })
  const b = await lore.store.put(mkWav(550, 1.5), { dur: 1.5 })
  lore.wind({ kind: 'take', data: { audio: a, tape: { track: 0, at: 0, offset: 0, dur: 2.0, gain: 1, rate: 1 }, source: { type: 'file', name: 'tone-330' } } })
  lore.wind({ kind: 'take', data: { audio: b, tape: { track: 1, at: 0.8, offset: 0, dur: 1.5, gain: 1, rate: 1 }, source: { type: 'file', name: 'tone-550' } } })
  // a ghost: a pointer whose bytes this device does not hold
  lore.wind({ kind: 'take', data: { audio: { sha256: 'f'.repeat(64), size: 999, mime: 'audio/wav', dur: 1 }, tape: { track: 2, at: 0.4, offset: 0, dur: 1, gain: 1, rate: 1 } } })
  return { takes: lore.reel().takes.length }
})
console.log('seeded:', JSON.stringify(seeded))

await page.waitForTimeout(600)
const run = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  lore.engine.seek(0)
  const wall0 = performance.now()
  lore.engine.play()
  await sleep(1200) // inside both takes
  const mid = {
    pos: lore.engine.pos(),
    playing: lore.engine.playing(),
    ctxState: lore.engine.ensureCtx().state,
    active: lore.engine._buffers.size,
  }
  await sleep(1900) // past every take (2.3s reel)
  const end = { pos: lore.engine.pos(), wallSecs: (performance.now() - wall0) / 1000 }
  lore.engine.stop()
  await sleep(500)
  const stopped = { pos: lore.engine.pos(), rate: lore.engine.rate() }
  const drift = Math.abs(end.pos - end.wallSecs)
  return { mid, end, stopped, drift }
})
console.log(JSON.stringify(run, null, 2))
await page.screenshot({ path: 'tape-takes.png' })

// seek + replay from the middle: sources restart cleanly
const reseek = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  lore.engine.seek(1.0)
  lore.engine.play()
  await sleep(600)
  const pos = lore.engine.pos()
  lore.engine.stop()
  return { posAfter600ms: pos }
})
console.log(JSON.stringify(reseek))
await browser.close()
