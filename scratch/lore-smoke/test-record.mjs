// T-153 acceptance: punch in on the fake mic, punch out, a `take` entry lands
// with pointer + placement + punch stamps; blob in the reel store; the doc
// carries no audio bytes; a second recording lands on another track.
import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: [
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream', // gUM yields a generated tone — perfect for a tape test
    '--autoplay-policy=no-user-gesture-required',
  ],
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message))
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE:', m.text().slice(0, 120)) })
await page.goto('http://localhost:8765/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1800)
const arrival = page.locator('.arrival')
if (await arrival.count()) await arrival.click()

// take one: track 1 via the real button, ~1.4s
await page.click('#recBtn')
await page.waitForTimeout(1400)
const during = await page.evaluate(() => ({
  rec: lore.engine.recording(),
  playing: lore.engine.playing(),
  level: lore.engine.level(),
  mode: document.getElementById('lcdMode').textContent,
}))
console.log('during:', JSON.stringify(during))
await page.click('#recBtn')
await page.waitForTimeout(1200) // flush + decode + wind

// take two: arm track 2 (second pill), record over the first
await page.evaluate(() => { lore.engine.seek(0) })
await page.click('.trackBtn:nth-child(2)')
await page.click('#recBtn')
await page.waitForTimeout(1000)
await page.click('#recBtn')
await page.waitForTimeout(1200)
await page.click('#stopBtn')
await page.waitForTimeout(400)

const after = await page.evaluate(async () => {
  const takes = lore.reel().takes
  const usage = await lore.store.usage()
  const exportStr = lore.spool.export()
  const parsed = JSON.parse(exportStr)
  const takeEntries = parsed.entries.filter((e) => e.kind === 'take')
  return {
    takes: takes.map((t) => ({
      track: t.tape.track,
      at: t.tape.at.toFixed(3),
      dur: t.tape.dur.toFixed(3),
      rate: t.tape.rate,
      sha: t.audio.sha256.slice(0, 10),
      size: t.audio.size,
      mime: t.audio.mime,
      punch: t.punch ? { span: t.punch.out - t.punch.in, speed: t.punch.speed } : null,
      source: t.source,
      held: lore.store.hasSync(t.audio.sha256),
    })),
    usage,
    exportBytes: exportStr.length,
    docCarriesPointersOnly: takeEntries.every((e) => !JSON.stringify(e.data).includes('base64') && JSON.stringify(e.data).length < 800),
  }
})
console.log(JSON.stringify(after, null, 2))
await page.screenshot({ path: 'recorded.png' })

// refresh: the reel and both takes survive; peaks render from cache
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2000)
const reloaded = await page.evaluate(() => ({
  takes: lore.reel().takes.length,
  held: lore.reel().takes.every((t) => lore.store.hasSync(t.audio.sha256)),
}))
console.log('after reload:', JSON.stringify(reloaded))
await page.screenshot({ path: 'recorded-reloaded.png' })
await browser.close()
