// T-157 acceptance: the bake renders the placed takes (audio where the tape
// says, silence where it doesn't), a ghost stays out and is counted, the
// telling is wound with a pointer, and pack → wipe → unpack returns the reel
// whole — takes, words, and sound.
import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
})
const ctx1 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, acceptDownloads: true })
const page = await ctx1.newPage()
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message))
await page.goto('http://localhost:8765/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1600)
if (await page.locator('.arrival').count()) await page.locator('.arrival').click()

const bakeResult = await page.evaluate(async () => {
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
  const a = await lore.store.put(mkWav(330, 1.0), { dur: 1.0 })
  const b = await lore.store.put(mkWav(550, 1.0), { dur: 1.0 })
  // track 1: 0..1 at unity; track 2: 2..2.5 at double rate (1s of source in
  // half a tape-second — the tape trick's fingerprint in the bake)
  lore.wind({ kind: 'take', data: { audio: a, tape: { track: 0, at: 0, offset: 0, dur: 1.0, gain: 1, rate: 1 } } })
  lore.wind({ kind: 'take', data: { audio: b, tape: { track: 1, at: 2.0, offset: 0, dur: 0.5, gain: 1, rate: 2 } } })
  lore.wind({ kind: 'take', data: { audio: { sha256: 'e'.repeat(64), size: 5, mime: 'audio/wav', dur: 1 }, tape: { track: 2, at: 1.2, offset: 0, dur: 1, gain: 1, rate: 1 } } })
  lore.wind({ kind: 'saying', body: 'the toast', data: { tape: { at: 0.2 } } })
  await new Promise((r) => setTimeout(r, 300))

  const { rendered, baked, ghosts, dur } = await lore.engine.bake(lore.reel())
  const ch = rendered.getChannelData(0)
  const rms = (t0, t1) => {
    const i0 = Math.floor(t0 * rendered.sampleRate)
    const i1 = Math.min(ch.length, Math.floor(t1 * rendered.sampleRate))
    let s = 0
    for (let i = i0; i < i1; i++) s += ch[i] * ch[i]
    return Math.sqrt(s / Math.max(1, i1 - i0))
  }
  return {
    baked,
    ghosts,
    dur: +dur.toFixed(2),
    rmsTake1: +rms(0.1, 0.9).toFixed(3),
    rmsGap: +rms(1.2, 1.9).toFixed(4), // the ghost's window — must be silence
    rmsTake2: +rms(2.05, 2.45).toFixed(3),
    rmsTail: +rms(2.6, 2.75).toFixed(4),
  }
})
console.log('bake:', JSON.stringify(bakeResult))

// the full UI bake winds a telling and downloads a wav
const dl = page.waitForEvent('download')
await page.click('#bakeBtn')
const download = await dl
console.log('download:', download.suggestedFilename())
await page.waitForTimeout(800)
const telling = await page.evaluate(() => {
  const t = lore.reel().tellings[0]
  return t ? { sha: t.audio.sha256.slice(0, 8), dur: +t.audio.dur.toFixed(2), takes: t.baked.takes.length, held: lore.store.hasSync(t.audio.sha256) } : null
})
console.log('telling wound:', JSON.stringify(telling))

// pack, then unpack into a fresh browser context (a device that had nothing)
const packed = await page.evaluate(async () => {
  const { text, missing } = await lore.packReelText()
  return { text, missing, code: lore.spool.code, takes: lore.reel().takes.length, sayings: lore.reel().sayings.length }
})
console.log('packed:', packed.text.length, 'bytes, missing:', packed.missing)

const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page2 = await ctx2.newPage()
page2.on('pageerror', (e) => console.log('P2 PAGEERROR:', e.message))
await page2.goto('http://localhost:8765/', { waitUntil: 'domcontentloaded' })
await page2.waitForTimeout(1600)
if (await page2.locator('.arrival').count()) await page2.locator('.arrival').click()
const unpacked = await page2.evaluate(async (text) => {
  const r = await lore.unpackText(text)
  return r
}, packed.text)
console.log('unpacked:', JSON.stringify(unpacked))
await page2.goto(`http://localhost:8765/#spool=${packed.code}`, { waitUntil: 'domcontentloaded' })
await page2.reload({ waitUntil: 'domcontentloaded' }) // hash-only goto skips the load; the UI flow reloads itself
await page2.waitForTimeout(2200)
const restored = await page2.evaluate(() => ({
  code: lore.spool.code,
  takes: lore.reel().takes.length,
  sayings: lore.reel().sayings.map((s) => s.body),
  tellings: lore.reel().tellings.length,
  allHeld: lore.reel().takes.filter((t) => !t.audio.sha256.startsWith('eee')).every((t) => lore.store.hasSync(t.audio.sha256)),
}))
console.log('restored on a bare device:', JSON.stringify(restored))
await page2.screenshot({ path: 'unpacked.png' })
await browser.close()
