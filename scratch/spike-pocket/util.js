// T-100 spike helpers: the deposit envelope + namespace token under test,
// plus a raw-yjs entry reader so multi-deposit union assertions never mix
// the spike's yjs instance with the SDK's.
import nacl from 'tweetnacl'
import * as Y from 'yjs'

export const MAGIC = [0xe2, 0xe3]
export const VERSION = 1

/** deposit envelope: 0xE2E3 ‖ version ‖ tag(4) ‖ nonce(24) ‖ secretbox ct */
export const seal = (update, key, tag) => {
  const nonce = nacl.randomBytes(24)
  const ct = nacl.secretbox(update, nonce, key)
  return Buffer.concat([Buffer.from([...MAGIC, VERSION]), Buffer.from(tag), Buffer.from(nonce), Buffer.from(ct)])
}

/** null on anything that doesn't authenticate — the drop-and-count path */
export const unseal = (blob, key) => {
  const b = Buffer.from(blob)
  if (b.length < 7 + 24 + 16 || b[0] !== MAGIC[0] || b[1] !== MAGIC[1] || b[2] !== VERSION) return null
  const plain = nacl.secretbox.open(new Uint8Array(b.subarray(7 + 24)), new Uint8Array(b.subarray(7, 7 + 24)), key)
  return plain ? Buffer.from(plain) : null
}

/** draft derivation under test: token = base64url(SHA-512("spool-pocket-v1" ‖ key)[0..12)) */
export const deriveToken = (key) => {
  const input = Buffer.concat([Buffer.from('spool-pocket-v1', 'utf8'), Buffer.from(key)])
  return Buffer.from(nacl.hash(new Uint8Array(input)).subarray(0, 12)).toString('base64url')
}

export const randomTag = () => nacl.randomBytes(4)

/** the k= param of a share() link → 32 key bytes */
export const linkKey = (link) => {
  const k = new URLSearchParams(link.split('#')[1]).get('k')
  return new Uint8Array(Buffer.from(k, 'base64url'))
}

/** the machine half of a Spool.export(): the full doc as one update */
export const exportUpdate = (spool) => new Uint8Array(Buffer.from(JSON.parse(spool.export()).doc, 'base64'))

/** wrap a decrypted deposit as an export shell so importSpool applies it via the SDK's own yjs */
export const wrapAsExport = (code, update) =>
  JSON.stringify({ format: 'spool-export', version: 1, code, exportedAt: Date.now(), entries: [], doc: Buffer.from(update).toString('base64') })

/** union N decrypted deposits in a spike-local doc and read the entries out raw */
export const unionEntries = (updates) => {
  const doc = new Y.Doc({ gc: false })
  for (const u of updates) Y.applyUpdate(doc, u)
  const out = []
  const entries = doc.getMap('entries')
  for (const id of entries.keys()) {
    const meta = entries.get(id)
    out.push({
      id,
      kind: meta.get('kind'),
      body: doc.share.has(`entry:${id}`) ? doc.getText(`entry:${id}`).toString() : '',
    })
  }
  doc.destroy()
  return out.sort((a, b) => (a.id < b.id ? -1 : 1))
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export const waitFor = async (cond, ms, label) => {
  const until = Date.now() + ms
  while (Date.now() < until) {
    if (await cond()) return
    await sleep(50)
  }
  throw new Error(`timeout waiting for: ${label}`)
}

export const put = async (base, room, token, blob) => {
  const res = await fetch(`${base}/pocket/${room}/${token}`, { method: 'PUT', body: blob })
  return { status: res.status, json: await res.json().catch(() => null) }
}

export const get = async (base, room, token) => {
  const res = await fetch(`${base}/pocket/${room}/${token}`)
  return { status: res.status, json: await res.json().catch(() => null) }
}

/** T-102's capability rule under test: a 200 is only a pocket if the envelope says so */
export const isPocketResponse = (json) => json != null && json.format === 'spool-pocket' && typeof json.version === 'number'

export const results = []
export const record = (id, scenario, pass, oneLiner) => {
  results.push({ id, scenario, result: pass ? 'PASS' : 'FAIL', oneLiner })
  console.log(`  ${pass ? '✓' : '✗'} ${id} ${scenario} — ${oneLiner}`)
}

export const printTable = () => {
  console.log('\n| # | Scenario | Result | One-liner |')
  console.log('|---|---|---|---|')
  for (const r of results) console.log(`| ${r.id} | ${r.scenario} | **${r.result}** | ${r.oneLiner} |`)
}
