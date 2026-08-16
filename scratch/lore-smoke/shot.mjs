// Screenshot + console-error probe for the lore shell.
// usage: node shot.mjs <url> <outPng> [ms] [--tap-through]
import { chromium } from 'playwright-core'

const [url, out, msArg, ...flags] = process.argv.slice(2)
const ms = Number(msArg) || 2500

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: [
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
  ],
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(ms)
if (flags.includes('--tap-through')) {
  const arrival = page.locator('.arrival')
  if (await arrival.count()) {
    await arrival.click()
    await page.waitForTimeout(400)
  }
}
await page.screenshot({ path: out })
console.log('URL after load:', page.url().slice(0, 120))
console.log('console errors:', errors.length ? errors.join('\n---\n') : 'none')
await browser.close()
