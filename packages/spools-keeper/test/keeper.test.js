// T-107: the midnight scenario with ONLY a keeper — a keyless spool on the
// real relay, so the pocket (keyed-only) is structurally out of the picture
// and the keeper is the one thing bridging the gap. Also: kill -9 restart
// from the export file.
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { newSpool, openSpool } from 'spools'

const here = dirname(fileURLToPath(import.meta.url))
const RELAY = join(here, '..', '..', 'spools-relay', 'server.js')
const KEEPER = join(here, '..', 'keeper.js')
const PORT = 15700

const children = []
const spools = []
after(async () => {
  for (const s of spools) await s.leave().catch(() => {})
  children.forEach((c) => c.kill('SIGKILL'))
})
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const until = async (fn, ms = 8000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (await fn()) return true
    await sleep(100)
  }
  return fn()
}

const spawnKeeper = (link, file) => {
  const child = spawn(process.execPath, [KEEPER, link, '--file', file], { stdio: ['ignore', 'pipe', 'pipe'] })
  child.stdout.on('data', () => {})
  child.stderr.on('data', (d) => process.stderr.write(`[keeper stderr] ${d}`))
  children.push(child)
  return child
}

test('midnight with only a keeper: keyless spool, no pocket, kill -9 restart', async () => {
  // relay up
  const relay = spawn(process.execPath, [RELAY], {
    env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' },
    stdio: 'ignore',
  })
  children.push(relay)
  await until(async () => {
    try {
      return (await fetch(`http://127.0.0.1:${PORT}/`)).ok
    } catch {
      return false
    }
  })

  // 9 pm: A winds three tracks on a KEYLESS spool (no pocket exists for it)
  const a = await newSpool({ relay: `ws://127.0.0.1:${PORT}/yjs`, persist: false, encrypted: false, author: 'a' })
  spools.push(a)
  const link = a.share('')
  for (let i = 1; i <= 3; i++) a.wind({ kind: 'track', body: `Track ${i}` })

  // the household keeper joins, syncs from A live, and saves its file
  const dir = await mkdtemp(join(tmpdir(), 'keeper-'))
  const file = join(dir, `${a.code}.spool.json`)
  const keeper = spawnKeeper(link, file)
  assert.ok(
    await until(async () => {
      try {
        return JSON.parse(await readFile(file, 'utf8')).entries.length === 3
      } catch {
        return false
      }
    }, 15_000),
    'keeper synced from A and exported its file'
  )

  // A closes the laptop — from here, only the keeper holds the spool online
  await a.leave()
  spools.splice(spools.indexOf(a), 1)

  // midnight: B cold-opens; the keeper answers its SyncStep1 like any peer
  const b = await openSpool(link, { persist: false, author: 'b' })
  spools.push(b)
  assert.ok(await until(() => b.entries.length === 3), 'B converged from the keeper alone')
  assert.deepEqual(
    b.entries.map((e) => e.body).sort(),
    ['Track 1', 'Track 2', 'Track 3']
  )
  await b.leave()
  spools.splice(spools.indexOf(b), 1)

  // power cut: kill -9, no clean shutdown — then restart from the file
  keeper.kill('SIGKILL')
  await sleep(300)
  spawnKeeper(link, file)
  // wait until the keeper's socket is actually in the room (relay health
  // counts connections) — otherwise C's first SyncStep1 lands in an empty
  // room and its next re-ask is a full resync interval away
  assert.ok(
    await until(async () => {
      const health = await (await fetch(`http://127.0.0.1:${PORT}/`)).json()
      return health.relay.connections >= 1
    }, 10_000),
    'restarted keeper reconnected'
  )

  // a third device cold-opens against the restarted keeper
  const c = await openSpool(link, { persist: false, author: 'c' })
  spools.push(c)
  // 25 s: covers one client resync interval in case the first ask raced
  assert.ok(await until(() => c.entries.length === 3, 25_000), 'C converged from the restarted keeper')
})
