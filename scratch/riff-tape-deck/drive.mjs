// Replays README's five-minute script in two headless tabs and screenshots
// each beat. Needs the page served (python3 -m http.server 8765 in this dir)
// and playwright-core somewhere requireable.
//
//   DECK_URL  page url            (default http://localhost:8765/)
//   PW_CORE   playwright-core dir (default: resolve 'playwright-core')
//   CHROME    chromium binary     (default: playwright's own)
//   SHOTS     output dir          (default: ./shots beside this file)
//   CHROME_ARGS extra chromium flags (a root container wants --no-sandbox)
//
// Run: node scratch/riff-tape-deck/drive.mjs

import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PW_CORE ?? 'playwright-core')
const base = process.env.DECK_URL ?? 'http://localhost:8765/'
const shots = process.env.SHOTS ?? fileURLToPath(new URL('./shots/', import.meta.url))
mkdirSync(shots, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const say = (s) => console.log(`  ${s}`)

const browser = await chromium.launch({
  executablePath: process.env.CHROME || undefined,
  args: process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(' ') : [], // e.g. --no-sandbox in a root container
})
const ctx = await browser.newContext({ viewport: { width: 980, height: 940 }, colorScheme: 'dark' })
const open = async (url) => {
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error('page error:', e.message))
  await page.goto(url)
  await page.waitForFunction(() => window.deck)
  return page
}
const packets = (page) => page.$$eval('#tape .pk:not(.ghost)', (els) => els.length)
const text = (page, sel) => page.$eval(sel, (el) => el.textContent.trim())
const shot = async (page, name) => {
  await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true })
  say(`shot ${name}`)
}
const until = async (fn, ms = 4000) => {
  const t0 = Date.now()
  while (!(await fn())) {
    if (Date.now() - t0 > ms) throw new Error('timed out waiting')
    await sleep(50)
  }
}

console.log('— 1. two hands —')
const ana = await open(`${base}?me=ana`)
const ben = await open(await ana.$eval('#other', (a) => a.href)) // the second-hand link, as a person would
await ana.click('button[data-color="blue"]')
await until(async () => (await packets(ben)) === 1)
say('ana wound blue; it landed on ben')
await shot(ben, '1-arrived')

console.log('— 2. unplug one hand, wind concurrently —')
await ben.click('#plug')
await ana.click('#plus') // count first, then color: the first step back then lands between the two colors
await ana.click('button[data-color="green"]')
await ben.click('#plus')
await ben.click('button[data-color="pink"]')
await sleep(300)
say(`ana sees ${await packets(ana)} packets, ben sees ${await packets(ben)} — two worldviews`)
await shot(ben, '2-unplugged')

console.log('— 3. plug back in —')
await ben.click('#plug')
await until(async () => (await packets(ana)) === 5 && (await packets(ben)) === 5)
const tapeA = await ana.$$eval('#tape .pk', (els) => els.map((e) => e.title.split(' · ')[0] + ':' + e.textContent).join(' '))
const tapeB = await ben.$$eval('#tape .pk', (els) => els.map((e) => e.title.split(' · ')[0] + ':' + e.textContent).join(' '))
say(tapeA === tapeB ? 'both tapes read the same, in the same order' : `TAPES DIFFER\n   ${tapeA}\n   ${tapeB}`)

console.log('— 4. step the head back once —')
await ana.click('#back')
await sleep(100)
say(`replayed: ${await text(ana, '#fwd-read')}`)
say(`walked back: ${await text(ana, '#back-read')}`)
say(`verdict: ${await text(ana, '#verdict')}`)
await shot(ana, '3-from-lie')

console.log('— 5. undo mine, softly —')
await ana.click('#to-end')
await ana.click('#undo')
await ana.check('#ghosts')
await sleep(100)
say(`ana: ${await text(ana, '#tape-stats')}`)
await shot(ana, '4-ghost')

console.log('— 6. rewind and put it back —')
await sleep(2200) // let the moments land
const before = await ana.$eval('#scrub', (el) => +el.max + 1)
say(`${before} moments on the tape`)
await ana.$eval('#scrub', (el) => { el.value = 0; el.dispatchEvent(new Event('input')) })
await sleep(100)
say(`scrubbed to: ${await text(ana, '#scrub-label')}`)
await shot(ana, '5-rewind')
await ana.click('#put-back')
await sleep(2200) // the rollback's own moment
await until(async () => (await ana.$eval('#scrub', (el) => +el.max + 1)) > before)
say(`after put-back: ${await text(ana, '#tape-stats')} · ${await text(ana, '#stats')}`)
await ana.$eval('#scrub', (el) => { el.value = el.max; el.dispatchEvent(new Event('input')) })
await sleep(100)
say(`latest moment: ${await text(ana, '#scrub-label')}`)
say(`ben converged: ${await text(ben, '#tape-stats')}`)
await shot(ana, '6-footprints')

await browser.close()
console.log(`\nshots in ${shots}`)
