// T-159 acceptance: the told-time log narrates the session; rewinding to
// before a cut shows — and plays — the uncut take; live returns untouched;
// no write path exists in memory.
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

// act 1: wind a 4s take, let the first history moment land
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
    for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin((i / sr) * 494 * 2 * Math.PI) * 14000, true)
    return new Blob([buf], { type: 'audio/wav' })
  }
  const a = await lore.store.put(mkWav(494, 4), { dur: 4 })
  lore.wind({ kind: 'take', body: 'before the cut', data: { audio: a, tape: { track: 0, at: 0, offset: 0, dur: 4, gain: 1, rate: 1 } } })
})
await page.waitForTimeout(3200) // idle → first moment

// act 2: past the 10s spacing, cut it; second moment lands
await page.waitForTimeout(8500)
const cut = await page.evaluate(async () => {
  lore.engine.seek(1.7)
  const take = lore.reel().takes[0]
  // the same cut the sheet performs
  const t = take.tape
  const pos = 1.7
  lore.wind({ kind: 'take', body: take.caption, data: { audio: take.audio, tape: { track: t.track, at: t.at, offset: t.offset, dur: pos - t.at, gain: t.gain, rate: t.rate }, origin: { take: take.id } } })
  lore.wind({ kind: 'take', data: { audio: take.audio, tape: { track: t.track, at: pos, offset: t.offset + (pos - t.at) * t.rate, dur: t.dur - (pos - t.at), gain: t.gain, rate: t.rate }, origin: { take: take.id } } })
  take.entry.delete()
  return { liveTakes: lore.reel().takes.length }
})
console.log('after cut:', JSON.stringify(cut))
await page.waitForTimeout(3200) // second moment

const moments = await page.evaluate(() => lore.spool.history.length)
console.log('history moments:', moments)

// the telling: open the log, read it back
await page.click('#tellingBtn')
await page.waitForTimeout(500)
const log = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('.logRow')].map((r) => ({
    gone: r.classList.contains('gone'),
    text: r.querySelector('.logBody').textContent.slice(0, 90),
    kind: r.querySelector('.logKind').textContent,
  }))
  return rows
})
console.log('the telling:', JSON.stringify(log, null, 1))
await page.screenshot({ path: 'telling.png' })

// memory: rewind to before the cut — the uncut take stands and PLAYS
await page.click('.sheetBtn:has-text("rewind the reel")')
await page.waitForTimeout(600)
await page.evaluate(() => {
  const scrub = document.getElementById('memoryScrub')
  scrub.value = scrub.min
  scrub.dispatchEvent(new Event('input'))
})
await page.waitForTimeout(600)
const past = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const takes = lore.reel ? null : null // service port serves the live reel; read the rendered one
  const mem = {
    mode: document.getElementById('lcdMode').textContent,
    label: document.getElementById('memoryLabel').textContent,
    rewindBarShown: !document.getElementById('rewindBar').hidden,
    transportHidden: getComputedStyle(document.querySelector('.transport')).display === 'none',
  }
  // play the past
  lore.engine.seek(0.2)
  lore.engine.play()
  await sleep(900)
  mem.posAdvanced = lore.engine.pos() > 0.8
  lore.engine.stop()
  // no write path: wind refuses
  mem.windRefused = lore.wind({ kind: 'saying', body: 'x', data: { tape: { at: 0 } } }) === null
  return mem
})
console.log('in memory:', JSON.stringify(past))
await page.screenshot({ path: 'memory.png' })

// back to now: the present tape is exactly as it was
await page.click('#backToNow')
await page.waitForTimeout(400)
const now = await page.evaluate(() => ({
  mode: document.getElementById('lcdMode').textContent,
  takes: lore.reel().takes.length,
  tombstones: lore.spool.deleted.length,
}))
console.log('back to now:', JSON.stringify(now))
await browser.close()
