// T-152 acceptance: reel-store round trip, dedup, wrong-hash-url refusal, peaks.
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage()
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message))
await page.goto('http://localhost:8765/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)

const result = await page.evaluate(async () => {
  const out = {}
  // a tiny mono WAV (0.5s 440Hz) built by hand
  const sr = 8000
  const n = sr / 2
  const buf = new ArrayBuffer(44 + n * 2)
  const v = new DataView(buf)
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
  ws(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  ws(36, 'data'); v.setUint32(40, n * 2, true)
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin((i / sr) * 440 * 2 * Math.PI) * 20000, true)
  const blob = new Blob([buf], { type: 'audio/wav' })

  const p1 = await LoreStore.put(blob, { dur: 0.5 })
  const p2 = await LoreStore.put(blob, { dur: 0.5 })
  out.sha = p1.sha256
  out.dedup = p1.sha256 === p2.sha256
  out.hasSync = LoreStore.hasSync(p1.sha256)

  const got = await LoreStore.resolve(p1)
  out.roundtrip = got && got.size === blob.size

  // wrong-hash courier: same bytes served, pointer names a different hash
  const fakeUrl = URL.createObjectURL(blob)
  const bad = await LoreStore.resolve({ sha256: 'deadbeef'.repeat(8), size: blob.size, mime: 'audio/wav', dur: 0.5, url: fakeUrl })
  out.badUrlRefused = bad === null
  out.badNotAdopted = !LoreStore.hasSync('deadbeef'.repeat(8))

  const ctx = LoreEngine.ensureCtx()
  const peaks = await LoreStore.peaks(p1, ctx)
  out.peaksLen = peaks ? peaks.length : 0
  out.peaksMax = peaks ? Math.max(...peaks).toFixed(2) : null

  const usage = await LoreStore.usage()
  out.usage = usage
  return out
})
console.log(JSON.stringify(result, null, 2))

// second load: the held-index survives, peaks come from idb without decode
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
const again = await page.evaluate(async (sha) => {
  const held = LoreStore.hasSync(sha)
  const peaks = await LoreStore.peaks({ sha256: sha }, LoreEngine.ensureCtx())
  return { heldAfterReload: held, peaksFromCache: peaks ? peaks.length : 0 }
}, result.sha)
console.log(JSON.stringify(again, null, 2))
await browser.close()
