// A lived-in reel for the record: two mic takes, two brought-in sounds, a
// saying, a title — and the rewind-bar-hidden fix verified on the way.
import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-proxy-server', '--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message))
await page.goto('http://localhost:8765/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)
if (await page.locator('.arrival').count()) await page.locator('.arrival').click()

const barHidden = await page.evaluate(() => getComputedStyle(document.getElementById('rewindBar')).display === 'none')
console.log('rewind bar hidden when live:', barHidden)

// two mic takes (fake device beeps) on tracks 1 and 2
await page.click('#recBtn')
await page.waitForTimeout(1700)
await page.click('#recBtn')
await page.waitForTimeout(900)
await page.click('.trackBtn:nth-child(2)')
await page.evaluate(() => lore.engine.seek(0.6))
await page.click('#recBtn')
await page.waitForTimeout(1500)
await page.click('#recBtn')
await page.waitForTimeout(900)
await page.click('#stopBtn')

// two brought-in sounds on tracks 3 and 4 + words + a title
await page.evaluate(async () => {
  const mkWav = (freq, secs, amMul, sr = 22050) => {
    const n = Math.floor(sr * secs)
    const buf = new ArrayBuffer(44 + n * 2)
    const v = new DataView(buf)
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
    ws(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ')
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
    ws(36, 'data'); v.setUint32(40, n * 2, true)
    for (let i = 0; i < n; i++) {
      const env = 0.25 + 0.75 * Math.abs(Math.sin((i / sr) * amMul))
      v.setInt16(44 + i * 2, Math.sin((i / sr) * freq * 2 * Math.PI) * 13000 * env, true)
    }
    return new Blob([buf], { type: 'audio/wav' })
  }
  const c = await lore.store.put(mkWav(196, 2.6, 2.1), { dur: 2.6 })
  const d = await lore.store.put(mkWav(660, 1.4, 5.3), { dur: 1.4 })
  await lore.importFiles([new File([await c.sha256, ''], 'x')].slice(0, 0), 0, 0) // no-op, keeps importFiles honest
  lore.wind({ kind: 'take', data: { audio: c, tape: { track: 2, at: 0.2, offset: 0, dur: 2.6, gain: 0.9, rate: 1 }, source: { type: 'file', name: 'porch-hum.wav' } } })
  lore.wind({ kind: 'take', data: { audio: d, tape: { track: 3, at: 2.1, offset: 0, dur: 1.4, gain: 1, rate: 1 }, source: { type: 'line' } } })
  lore.wind({ kind: 'saying', body: 'the night of the flat tire', data: { tape: { at: 0.9 } } })
  lore.wind({ kind: 'lore:reel', data: { title: 'the family reel' } })
})
await page.waitForTimeout(900)
await page.evaluate(() => lore.engine.seek(1.6))
await page.waitForTimeout(600)
await page.screenshot({ path: 'hero.png' })

// the settings sheet: keepsakes + the fine print
await page.click('#menuBtn')
await page.waitForTimeout(500)
await page.screenshot({ path: 'hero-settings.png' })
console.log('hero shots taken')
await browser.close()
