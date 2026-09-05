// T-107: the midnight scenario with ONLY a keeper — a keyless spool on the
// real relay, so the pocket (keyed-only) is structurally out of the picture
// and the keeper is the one thing bridging the gap. Also: kill -9 restart
// from the export file.
//
// T-182: the same scenario with a links file — two spools on one keeper, a
// garbage line and a duplicate on the list, kill -9 restart from both files,
// and a clean SIGTERM that saves and leaves every spool.
//
// T-183: narration — every line stamped, a keyed spool says what the pocket
// did on open, a relay outage is narrated as a numbered, timed reconnect,
// and a heartbeat line says the wall is up.
//
// T-182 follow-on (the pocket line): the links file carries a keyed spool
// too, so the pocket's verdict is asserted under a spool's prefix from a
// list, and log hygiene is checked against the real link and key strings
// (not just their syntax) in every scenario.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { newSpool, openSpool } from 'spools'

const here = dirname(fileURLToPath(import.meta.url))
const RELAY = join(here, '..', '..', 'spools-relay', 'server.js')
const KEEPER = join(here, '..', 'keeper.js')
const PORT = 15700
const WS = `ws://127.0.0.1:${PORT}/yjs`

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
const health = async () => (await fetch(`http://127.0.0.1:${PORT}/`)).json()
const entriesIn = async (file) => {
  try {
    return JSON.parse(await readFile(file, 'utf8')).entries.length
  } catch {
    return -1
  }
}

const STAMPED = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z \[keeper/
const everyLineStamped = (out) => out.split('\n').filter(Boolean).every((l) => STAMPED.test(l))
const linesOf = (out, code) => out.split('\n').filter((l) => l.includes(`[keeper ${code}]`))
const pocketLine = (out, code) => new RegExp(`\\[keeper ${code}\\] pocket: (empty|applied)`).test(out)

// the standing rule, checked with the real strings: never a link (nor its
// syntax), never a key — the 8-char fingerprint is allowed, the full k= value
// is not — and, with --links, never a line of the list
const hygienic = (out, { links = [], list = '' } = {}) => {
  assert.doesNotMatch(out, /spool=|relay=|k=/, 'log carries link syntax')
  for (const link of links) {
    assert.ok(!out.includes(link), 'log carries a link')
    const key = new URLSearchParams(link.slice(1)).get('k')
    if (key) assert.ok(!out.includes(key), 'log carries a key')
  }
  list.split('\n').forEach((raw, i) => {
    const line = raw.trim()
    if (line) assert.ok(!out.includes(line), `log carries line ${i + 1} of the list`)
  })
}

// spawn a keeper with the given args; stdout is collected for assertions
const spawnKeeper = (args, env = {}) => {
  const child = spawn(process.execPath, [KEEPER, ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...env },
  })
  child.out = ''
  child.stdout.on('data', (d) => (child.out += d))
  child.stderr.on('data', (d) => process.stderr.write(`[keeper stderr] ${d}`))
  children.push(child)
  return child
}

// a spool with n entries, wound by author (keyless unless told); returns { spool, link }
const wind = async (author, n, { encrypted = false } = {}) => {
  const s = await newSpool({ relay: WS, persist: false, encrypted, author })
  spools.push(s)
  for (let i = 1; i <= n; i++) s.wind({ kind: 'track', body: `${author} ${i}` })
  return { spool: s, link: s.share('') }
}
const leave = async (s) => {
  await s.leave()
  spools.splice(spools.indexOf(s), 1)
}
// cold-open a link and wait for n entries
const converges = async (link, author, n, ms) => {
  const s = await openSpool(link, { persist: false, author })
  spools.push(s)
  const ok = await until(() => s.entries.length === n, ms)
  await leave(s)
  return ok
}
// after a keeper restart, wait until its socket(s) are actually in the room —
// otherwise a probe's first SyncStep1 lands in an empty room and its next
// re-ask is a full resync interval away
const reconnected = (n) => until(async () => (await health()).relay.connections >= n, 10_000)

// the relay is children[0]; startRelay replaces it (the outage test restarts it)
const startRelay = async () => {
  const relay = spawn(process.execPath, [RELAY], {
    env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' },
    stdio: 'ignore',
  })
  children[0] = relay
  await until(async () => {
    try {
      return (await fetch(`http://127.0.0.1:${PORT}/`)).ok
    } catch {
      return false
    }
  })
}
before(startRelay)

test('midnight with only a keeper: keyless spool, no pocket, kill -9 restart', async () => {
  // 9 pm: A winds three tracks on a KEYLESS spool (no pocket exists for it)
  const { spool: a, link } = await wind('a', 3)

  // the household keeper joins, syncs from A live, and saves its file
  const dir = await mkdtemp(join(tmpdir(), 'keeper-'))
  const file = join(dir, `${a.code}.spool.json`)
  const keeper = spawnKeeper([link, '--file', file])
  assert.ok(await until(async () => (await entriesIn(file)) === 3, 15_000), 'keeper synced from A and exported its file')

  // A closes the laptop — from here, only the keeper holds the spool online
  await leave(a)

  // midnight: B cold-opens; the keeper answers its SyncStep1 like any peer
  const b = await openSpool(link, { persist: false, author: 'b' })
  spools.push(b)
  assert.ok(await until(() => b.entries.length === 3), 'B converged from the keeper alone')
  assert.deepEqual(
    b.entries.map((e) => e.body).sort(),
    ['a 1', 'a 2', 'a 3']
  )
  await leave(b)

  // power cut: kill -9, no clean shutdown — then restart from the file
  keeper.kill('SIGKILL')
  await sleep(300)
  const again = spawnKeeper([link, '--file', file])
  assert.ok(await reconnected(1), 'restarted keeper reconnected')

  // a third device cold-opens against the restarted keeper
  // 25 s: covers one client resync interval in case the first ask raced
  assert.ok(await converges(link, 'c', 3, 25_000), 'C converged from the restarted keeper')
  assert.ok(everyLineStamped(keeper.out) && everyLineStamped(again.out), 'every line stamped')
  hygienic(keeper.out + again.out, { links: [link] })

  children.forEach((c) => c !== children[0] && c.kill('SIGKILL'))
  await until(async () => (await health()).relay.connections === 0, 5_000)
})

test('a links file: two keyless spools and a keyed one on one keeper, garbage and duplicate lines, kill -9, clean SIGTERM', async () => {
  // two households' worth of keyless spools, and a keyed one — so the list
  // carries a key (the key ring sentence) and the pocket path runs under a
  // spool's prefix, the shape of the owner's real wall
  const { spool: a1, link: link1 } = await wind('a1', 2)
  const { spool: a2, link: link2 } = await wind('a2', 3)
  const { spool: a3, link: link3 } = await wind('a3', 1, { encrypted: true })

  // the list: a comment, a link, a garbage line, another link, a duplicate, the keyed link
  const dir = await mkdtemp(join(tmpdir(), 'pegboard-'))
  const list = join(dir, 'pegboard')
  const listText = ['# the wall', link1, '', 'this is not a link', link2, link1, link3, ''].join('\n')
  await writeFile(list, listText)
  const file1 = join(dir, `${a1.code}.spool.json`)
  const file2 = join(dir, `${a2.code}.spool.json`)
  const file3 = join(dir, `${a3.code}.spool.json`)
  const links = [link1, link2, link3]

  const keeper = spawnKeeper(['--links', list])
  assert.ok(
    await until(
      async () => (await entriesIn(file1)) === 2 && (await entriesIn(file2)) === 3 && (await entriesIn(file3)) === 1,
      15_000
    ),
    'keeper synced all three spools and exported a file for each, beside the list'
  )
  assert.match(keeper.out, /\[keeper line 4\] skipped — that's not a spool link/)
  assert.match(keeper.out, new RegExp(`\\[keeper line 6\\] skipped — ${a1.code} is already on the list`))
  assert.match(keeper.out, /\[keeper\] keeping 3 spools from .*pegboard \(1 failed\)/)
  // the keyed spool says what the pocket did, under its own prefix; the keyless ones say nothing about it
  assert.ok(await until(() => pocketLine(keeper.out, a3.code)), 'the keyed spool named the pocket on open')
  assert.ok(
    ![...linesOf(keeper.out, a1.code), ...linesOf(keeper.out, a2.code)].some((l) => l.includes('pocket:')),
    'keyless spools say nothing about the pocket'
  )
  // logs never carry a link, a key, nor a line of the list
  hygienic(keeper.out, { links, list: listText })

  // every writer closes their laptop
  await leave(a1)
  await leave(a2)
  await leave(a3)

  // midnight, thrice: cold readers converge on each. The keyless two prove
  // the keeper alone (no pocket exists for them); the keyed one is entangled
  // with the pocket a3's leave() deposited into, and proves the peg
  assert.ok(await converges(link1, 'b1', 2), 'B1 converged on spool 1 from the keeper alone')
  assert.ok(await converges(link2, 'b2', 3), 'B2 converged on spool 2 from the keeper alone')
  assert.ok(await converges(link3, 'b3', 1), 'B3 converged on the keyed spool')

  // power cut, then restart from the same list — every file restores
  keeper.kill('SIGKILL')
  await sleep(300)
  const again = spawnKeeper(['--links', list])
  assert.ok(await reconnected(3), 'restarted keeper reconnected all three spools')
  assert.ok(
    await until(() => /restored 2 entries/.test(again.out) && /restored 3 entries/.test(again.out) && /restored 1 entries/.test(again.out)),
    'all three restored from file'
  )
  assert.ok(await until(() => pocketLine(again.out, a3.code)), 'the keyed spool named the pocket again after the restart')
  assert.ok(await converges(link1, 'c1', 2, 25_000), 'C1 converged from the restarted keeper')
  assert.ok(await converges(link2, 'c2', 3, 25_000), 'C2 converged from the restarted keeper')
  assert.ok(await converges(link3, 'c3', 1, 25_000), 'C3 converged on the keyed spool from the restarted keeper')

  // clean shutdown: every spool saves and leaves, exit 0
  const exited = new Promise((r) => again.on('exit', r))
  again.kill('SIGTERM')
  assert.equal(await exited, 0, 'SIGTERM exits 0')
  for (const code of [a1.code, a2.code, a3.code]) {
    assert.match(again.out, new RegExp(`\\[keeper ${code}\\] SIGTERM — saving and leaving`))
  }
  assert.equal(await entriesIn(file1), 2)
  assert.equal(await entriesIn(file2), 3)
  assert.equal(await entriesIn(file3), 1)
  assert.ok(everyLineStamped(keeper.out) && everyLineStamped(again.out), 'every line stamped')
  hygienic(again.out, { links, list: listText })
})

test('narration: a keyed spool names the pocket, an outage is a numbered reconnect, the heartbeat beats', async () => {
  const { spool: a, link } = await wind('a', 1, { encrypted: true })
  const dir = await mkdtemp(join(tmpdir(), 'keeper-'))
  const file = join(dir, `${a.code}.spool.json`)

  // 500 ms heartbeat so the test doesn't wait ten minutes
  const keeper = spawnKeeper([link, '--file', file], { KEEPER_HEARTBEAT_MS: '500' })
  assert.ok(await until(async () => (await entriesIn(file)) === 1, 15_000), 'keeper synced and exported')
  assert.ok(await until(() => /\] pocket: (empty|applied)/.test(keeper.out)), 'the pocket spoke on open')
  assert.ok(await until(() => /\[keeper\] up 0h00m · .+ 1 held, 0 reconnects/.test(keeper.out), 3_000), 'heartbeat beat')
  await leave(a)

  // the relay goes away and comes back: one numbered, timed reconnect
  children[0].kill('SIGKILL')
  assert.ok(await until(() => /relay: (offline|connecting)/.test(keeper.out.split('relay: connected')[1] ?? '')), 'saw the drop')
  await startRelay()
  assert.ok(
    await until(() => /relay: connected — reconnect #1 after \d+\.\d s offline/.test(keeper.out), 20_000),
    'reconnect #1, timed'
  )
  assert.ok(await until(() => /up 0h00m · .+ 1 held, 1 reconnects/.test(keeper.out), 3_000), 'heartbeat counts the reconnect')

  // still counts-only (the real link and key never appear), still stamped
  hygienic(keeper.out, { links: [link] })
  assert.ok(everyLineStamped(keeper.out), 'every line stamped')

  const exited = new Promise((r) => keeper.on('exit', r))
  keeper.kill('SIGTERM')
  assert.equal(await exited, 0)
  // no heartbeat after shutdown began
  const afterSigterm = keeper.out.split('SIGTERM — saving and leaving')[1] ?? ''
  assert.doesNotMatch(afterSigterm, /\[keeper\] up /)
})
