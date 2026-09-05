// Replays README's five-minute script on the rig, headless, and screenshots
// each beat. Needs the page served (python3 -m http.server 8765 in this dir)
// or a single-file build, and playwright-core somewhere requireable.
//
//   DECK_URL  page url            (default http://localhost:8765/)
//   PW_CORE   playwright-core dir (default: resolve 'playwright-core')
//   CHROME    chromium binary     (default: playwright's own)
//   CHROME_ARGS extra chromium flags (a root container wants --no-sandbox)
//   SHOTS     output dir          (default: ./shots beside this file)
//
// Run: node scratch/riff-tape-deck/drive.mjs

import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PW_CORE ?? 'playwright-core')
const url = process.env.DECK_URL ?? 'http://localhost:8765/'
const shots = process.env.SHOTS ?? fileURLToPath(new URL('./shots/', import.meta.url))
mkdirSync(shots, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const say = (s) => console.log(`  ${s}`)

const browser = await chromium.launch({
  executablePath: process.env.CHROME || undefined,
  args: process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(' ') : [],
})
const page = await browser.newPage({ viewport: { width: 1100, height: 1000 }, colorScheme: 'dark' })
page.on('pageerror', (e) => console.error('page error:', e.message))
await page.goto(url)
await page.waitForFunction(() => window.deck)

const A = '#hand-ana'
const B = '#hand-ben'
const packets = (hand) => page.$$eval(`${hand} .tape:not(.then) .pk:not(.ghost)`, (els) => els.length)
const text = (hand, sel) => page.$eval(`${hand} ${sel}`, (el) => el.textContent.trim())
const tape = (hand) => page.$$eval(`${hand} .tape:not(.then) .pk`, (els) => els.map((e) => e.title.split(' · ')[0] + ':' + e.textContent).join(' '))
const shot = async (name) => {
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
await page.click(`${A} button[data-color="gold"]`) // the tape opens seeded: blue from ana, +1 from ben
await until(async () => (await packets(B)) === 3)
say('ana wound gold; it landed on ben')
await sleep(700) // a beat, so the first moment records the tape as it is now
await shot('1-arrived')

console.log('— 2. unplug, wind concurrently —')
await page.click('#plug')
await page.click(`${A} .plus`) // count first, then color: the first step back then lands between the two colors
await page.click(`${A} button[data-color="green"]`)
await page.click(`${B} .plus`)
await page.click(`${B} button[data-color="pink"]`)
await sleep(200)
say(`ana sees ${await packets(A)} packets, ben sees ${await packets(B)} — two worldviews, side by side`)
await shot('2-unplugged')

console.log('— 3. plug back in —')
await page.click('#plug')
await until(async () => (await packets(A)) === 7 && (await packets(B)) === 7)
say((await tape(A)) === (await tape(B)) ? 'both tapes read the same, in the same order' : `TAPES DIFFER\n   ${await tape(A)}\n   ${await tape(B)}`)

console.log('— 4. step a head back once —')
await page.click(`${A} .back`)
await sleep(100)
say(`replayed: ${await text(A, '.fwd-read')}`)
say(`walked back: ${await text(A, '.back-read')}`)
say(`verdict: ${await text(A, '.verdict')}`)
await shot('3-from-lie')

console.log('— 5. undo mine, softly —')
await page.click(`${A} .to-end`)
await page.click(`${A} .undo`)
await page.check(`${A} .ghosts`)
await sleep(100)
say(`ana: ${await text(A, '.stats')}`)
await shot('4-ghost')

console.log('— 6. rewind and put it back —')
await sleep(2200) // let the moments land
const before = await page.$eval(`${A} .scrub`, (el) => +el.max + 1)
say(`${before} moments on ana's copy`)
await page.$eval(`${A} .scrub`, (el) => { el.value = 0; el.dispatchEvent(new Event('input')) })
await sleep(100)
say(`scrubbed to: ${await text(A, '.scrub-label')}`)
await shot('5-rewind')
await page.click(`${A} .put-back`)
await until(async () => (await page.$eval(`${A} .scrub`, (el) => +el.max + 1)) > before, 6000)
say(`after put-back: ana ${await text(A, '.stats')}`)
await page.$eval(`${A} .scrub`, (el) => { el.value = el.max; el.dispatchEvent(new Event('input')) })
await sleep(100)
say(`latest moment: ${await text(A, '.scrub-label')}`)
say(`ben converged: ${await text(B, '.stats')}`)
await shot('6-footprints')

await browser.close()
console.log(`\nshots in ${shots}`)
