/**
 * T-186: splice(records) — the identity-preserving write under the cut, the
 * fork, and the rejoin (docs/M16-splice-brief.md §6, §9). The reel spike
 * (scratch/riff-reel/spike.mjs) is the fixture: 5 000 messages, half
 * forgotten, the live half cut onto a new reel with its identity intact.
 * The recipes in docs/SDK-API.md run here as written, and the fork's
 * honesty sentence — reunion resurrects — is asserted, not claimed.
 */
import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import * as Y from 'yjs'
import { spawn, type ChildProcess } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { SpoolEngine } from './engine'
import { Spool, newSpool, openSpool } from './spool'
import { SpoolHistoryError, type EntrySnapshot } from './history'
import { SpoolSpliceError, type EntryChange } from './entry'
import { _resetPocketCache, type PocketState } from './pocket'

const RELAY_SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'spools-relay', 'server.js')
let nextPort = 15900
const spools: Spool[] = []
const cleanups: (() => void | Promise<void>)[] = []
afterEach(async () => {
  for (const s of spools.splice(0)) await s.leave().catch(() => {})
  for (const c of cleanups.splice(0)) await c()
  _resetPocketCache()
})
const track = <T extends Spool>(s: T): T => (spools.push(s), s)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const waitUntil = async (fn: () => boolean, ms = 5000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (fn()) return true
    await sleep(25)
  }
  return fn()
}

// offline, memory-only, near-immediate history moments (history.test.ts's tuning)
const mk = (code: string, author = 'ana') => {
  const engine = new SpoolEngine({ code, persist: false, disableBc: true, webrtc: false })
  return track(new Spool(engine, '', undefined, author, { debounceMs: 5, minGapMs: 0 }))
}
const bytes = (s: Spool) => Y.encodeStateAsUpdate(s.doc)
const ids = (entries: { id: string }[]) => entries.map((e) => e.id)
const bodies = (entries: { body: string }[]) => entries.map((e) => e.body)

/** the real relay, from packages/spools-relay (the T-104 idiom) */
const startRealRelay = async () => {
  const port = nextPort++
  const child: ChildProcess = spawn(process.execPath, [RELAY_SERVER], {
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' },
    stdio: 'ignore',
  })
  cleanups.push(() => child.kill())
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break
    } catch {
      await sleep(50)
    }
  }
  return { ws: `ws://127.0.0.1:${port}/yjs` }
}
const settled = (spool: Spool): Promise<PocketState> =>
  new Promise((resolve) => {
    const check = (s: PocketState | null) => {
      if (s && s.phase !== 'checking') {
        off()
        resolve(s)
        return true
      }
      return false
    }
    const off = spool.on('pocket', (s) => check(s))
    check(spool.pocket)
  })

/**
 * the reel: N messages, every seventh a reply, then the first half forgotten.
 * The spike replied to the entry just before; that thread almost never
 * straddles the seam (entries wound in one millisecond sort by id, so the
 * seam sits inside a batch). Here a reply reaches 700 entries back, so a
 * band of kept replies point into the forgotten half and the cut must
 * flatten them — the rule the fixture exists to exercise.
 */
const N = 5000
const REACH = 700
const windReel = (spool: Spool) => {
  for (let i = 0; i < N; i++) {
    spool.wind({
      kind: 'message',
      body: `message ${i}: the night the canoe sank, told again`,
      data: { seat: 'seatA' },
      ...(i % 7 === 0 && i > 0 ? { parent: spool.entries[Math.max(0, i - REACH)].id } : {}),
    })
  }
  spool.doc.transact(() => {
    for (const e of spool.entries.slice(0, N / 2)) e.delete()
  })
}

/** the cut recipe, as SDK-API states it: select by the SDK's order, flatten, splice */
const cut = (keep: EntrySnapshot[]) => {
  const kept = new Set(keep.map((e) => e.id))
  return keep.map((rec) => (rec.parent !== undefined && !kept.has(rec.parent) ? { ...rec, parent: undefined } : rec))
}

describe('the cut — the reel spike as a fixture', () => {
  it('the live half crosses with identity, order, bodies, data; threads resolve; the rest was flattened', async () => {
    const old = mk('reel-old-101')
    await old.whenReady
    windReel(old)
    expect(old.entries).toHaveLength(N / 2)
    expect(old.deleted).toHaveLength(N / 2)

    const keep = old.entries.map((e) => e.snapshot())
    const records = cut(keep)
    const flattened = records.filter((r, i) => r.parent === undefined && keep[i].parent !== undefined).length
    expect(flattened).toBeGreaterThan(50) // the band of replies whose parent was on the forgotten half

    const reel = mk('reel-new-101', 'someone-else')
    await reel.whenReady
    const handles = reel.splice(records)

    expect(handles.map((h) => h.id)).toEqual(ids(records)) // input order
    expect(ids(reel.entries)).toEqual(ids(old.entries)) // the SDK's own sort, unchanged
    expect(bodies(reel.entries)).toEqual(bodies(old.entries))
    expect(reel.entries.map((e) => e.createdAt)).toEqual(old.entries.map((e) => e.createdAt))
    expect(reel.entries.every((e) => e.author === 'ana')).toBe(true) // the record's author, not the splicer's
    expect(reel.entries.every((e) => e.data?.seat === 'seatA')).toBe(true)
    const present = new Set(ids(reel.entries))
    expect(reel.entries.filter((e) => e.parent).every((e) => present.has(e.parent!))).toBe(true)
    expect(reel.entries.filter((e) => e.parent).length).toBe(keep.filter((r) => r.parent).length - flattened)
    expect(reel.deleted).toHaveLength(0)
    // the new reel is smaller than the old tape — the whole point of the cut
    expect(bytes(reel).byteLength).toBeLessThan(bytes(old).byteLength)
    // the old reel is untouched
    expect(old.entries).toHaveLength(N / 2)
    expect(old.deleted).toHaveLength(N / 2)
  })

  it('re-running the cut is a byte-level no-op, and splicing back into the old reel writes nothing', async () => {
    const old = mk('reel-old-102')
    await old.whenReady
    windReel(old)
    const records = cut(old.entries.map((e) => e.snapshot()))
    const reel = mk('reel-new-102')
    await reel.whenReady
    reel.splice(records)
    const first = bytes(reel)
    const events: EntryChange[] = []
    reel.on('entry', (c) => events.push(c))
    const again = reel.splice(records)
    expect(bytes(reel)).toEqual(first)
    expect(events).toHaveLength(0)
    expect(again.map((h) => h.id)).toEqual(ids(records)) // the same live handles come back
    expect(again[0]).toBe(reel.entries[0])

    const oldBytes = bytes(old)
    old.splice(old.entries.map((e) => e.snapshot()))
    expect(bytes(old)).toEqual(oldBytes)
  })

  it('the new reel has no past: rewind() there starts at its first moment', async () => {
    const old = mk('reel-old-103')
    await old.whenReady
    windReel(old)
    await waitUntil(() => old.history.length > 0)
    const reel = mk('reel-new-103')
    await reel.whenReady
    const t = Date.now()
    reel.splice(cut(old.entries.map((e) => e.snapshot())))
    expect(reel.history).toHaveLength(0) // nothing before the cut exists to rebuild
    expect(() => reel.rewind(old.history[0])).toThrow(SpoolHistoryError)
    await waitUntil(() => reel.history.length > 0)
    expect(reel.history[0]).toBeGreaterThanOrEqual(t)
    expect(reel.rewind(Date.now()).length).toBe(N / 2)
  })
})

describe('the rules', () => {
  it('a dangling parent refuses the whole batch before a single write, naming the record', async () => {
    const s = mk('rules-101')
    await s.whenReady
    const before = bytes(s)
    const good: EntrySnapshot = { id: 'a', author: 'ana', kind: 'note', createdAt: 1, body: 'first' }
    const bad: EntrySnapshot = { id: 'b', author: 'ana', kind: 'note', parent: 'nowhere', createdAt: 2, body: 'reply' }
    let err: unknown
    try {
      s.splice([good, bad])
    } catch (e) {
      err = e
    }
    expect(err).toBeInstanceOf(SpoolSpliceError)
    expect((err as SpoolSpliceError).id).toBe('b')
    expect((err as SpoolSpliceError).rule).toBe('parent')
    expect((err as SpoolSpliceError).message).toContain('"b"')
    expect(bytes(s)).toEqual(before) // not even the good one landed
    expect(s.entries).toHaveLength(0)
  })

  it('a parent in the batch and a parent already in the target both accept — soft-deleted parents too', async () => {
    const s = mk('rules-102')
    await s.whenReady
    const home = s.wind({ kind: 'note', body: 'home' })
    const hidden = s.wind({ kind: 'note', body: 'hidden' })
    hidden.delete()
    const out = s.splice([
      { id: 'p', author: 'x', kind: 'note', createdAt: 10, body: 'parent in batch' },
      { id: 'c1', author: 'x', kind: 'note', parent: 'p', createdAt: 11, body: 'child of batch' },
      { id: 'c2', author: 'x', kind: 'note', parent: home.id, createdAt: 12, body: 'child of target' },
      { id: 'c3', author: 'x', kind: 'note', parent: hidden.id, createdAt: 13, body: 'child of a hidden one' },
    ])
    expect(out).toHaveLength(4)
    expect(s.entries.find((e) => e.id === 'c1')?.parent).toBe('p')
    expect(home.children.map((e) => e.id)).toEqual(['c2'])
    expect(s.entries.find((e) => e.id === 'c3')?.parent).toBe(hidden.id)
  })

  it('soft-deleted records cross with deletedAt; the caller decides whether they cross at all', async () => {
    const s = mk('rules-103')
    await s.whenReady
    s.splice([{ id: 'gone', author: 'x', kind: 'note', createdAt: 5, deletedAt: 6, body: 'was here' }])
    expect(s.entries).toHaveLength(0)
    expect(s.deleted.map((e) => e.id)).toEqual(['gone'])
    expect(s.deleted[0].deletedAt).toBe(6)
    expect(s.deleted[0].body).toBe('was here')
    s.deleted[0].restore()
    expect(s.entries.map((e) => e.id)).toEqual(['gone'])
  })

  it('the batch is one transaction: one entry event, all added', async () => {
    const s = mk('rules-104')
    await s.whenReady
    const events: EntryChange[] = []
    s.on('entry', (c) => events.push(c))
    s.splice([
      { id: 'a', author: 'x', kind: 'note', createdAt: 1, body: 'a' },
      { id: 'b', author: 'x', kind: 'note', createdAt: 2, body: '' },
      { id: 'c', author: 'x', kind: 'note', createdAt: 3, body: 'c', data: { n: 1 } },
    ])
    expect(events).toHaveLength(1)
    expect(events[0].added.map((e) => e.id)).toEqual(['a', 'b', 'c'])
    expect(events[0].updated).toHaveLength(0)
    expect(s.entries[1].text).toBeNull() // an empty body creates no text — lazy bodies, as wind()
  })

  it('malformed records are refused by rule; data is cloned, not shared', async () => {
    const s = mk('rules-105')
    await s.whenReady
    const base = { author: 'x', kind: 'note', createdAt: 1, body: '' }
    const rule = (rec: unknown) => {
      try {
        s.splice([rec as EntrySnapshot])
      } catch (e) {
        return (e as SpoolSpliceError).rule
      }
      return 'accepted'
    }
    expect(rule({ ...base, id: '' })).toBe('id')
    expect(rule({ ...base, id: 'k', kind: '' })).toBe('kind')
    expect(rule({ ...base, id: 'k', author: 7 })).toBe('author')
    expect(rule({ ...base, id: 'k', createdAt: NaN })).toBe('createdAt')
    expect(rule({ ...base, id: 'k', deletedAt: 'yesterday' })).toBe('deletedAt')
    expect(rule({ ...base, id: 'k', body: 42 })).toBe('body')
    expect(() =>
      s.splice([
        { ...base, id: 'twice' },
        { ...base, id: 'twice' },
      ])
    ).toThrow(SpoolSpliceError)
    expect(s.entries).toHaveLength(0)
    const data = { tags: ['a'] }
    s.splice([{ ...base, id: 'ok', data }])
    data.tags.push('b')
    expect(s.entries[0].data).toEqual({ tags: ['a'] })
  })

  it('Entry.snapshot() is the same shape rewind() and export() hand out', async () => {
    const s = mk('rules-106')
    await s.whenReady
    const e = s.wind({ kind: 'note', body: 'hello', data: { n: 1 } })
    const snap = e.snapshot()
    expect(Object.isFrozen(snap)).toBe(true)
    expect(snap).toEqual({ id: e.id, author: 'ana', kind: 'note', createdAt: e.createdAt, data: { n: 1 }, body: 'hello' })
    expect('parent' in snap).toBe(false)
    expect('deletedAt' in snap).toBe(false)
    expect(JSON.parse(s.export()).entries[0]).toEqual(snap)
    e.delete()
    expect(e.snapshot().deletedAt).toBe(e.deletedAt)
  })
})

describe('the recipes, run as SDK-API states them', () => {
  it('the fork: the whole document crosses, lineage intact; reunion resurrects everything the origin did since', async () => {
    const origin = mk('fork-origin-101')
    await origin.whenReady
    const canoe = origin.wind({ kind: 'note', body: 'canoe' })
    origin.wind({ kind: 'note', body: 'paddle' })
    await waitUntil(() => origin.history.length > 0)

    // the fork: two lines
    const fork = mk('fork-child-101', 'ben')
    await fork.whenReady
    Y.applyUpdate(fork.doc, Y.encodeStateAsUpdate(origin.doc))

    expect(ids(fork.entries)).toEqual(ids(origin.entries)) // same entries, same ids
    expect(fork.history).toEqual(origin.history) // a fork remembers who it was before it was born
    expect(fork.rewind(origin.history[0]).length).toBeGreaterThan(0)

    // both sides move on; the origin forgets the canoe
    const forkOnly = fork.wind({ kind: 'note', body: 'fork-only: a different summer' })
    origin.wind({ kind: 'note', body: 'lake at night' })
    canoe.delete()

    // the rejoin: one device holding both, applying both ways — never through a relay
    Y.applyUpdate(fork.doc, Y.encodeStateAsUpdate(origin.doc, Y.encodeStateVector(fork.doc)))
    Y.applyUpdate(origin.doc, Y.encodeStateAsUpdate(fork.doc, Y.encodeStateVector(origin.doc)))

    expect(bytes(fork)).toEqual(bytes(origin)) // converged, byte for byte
    expect(bodies(fork.entries).sort()).toEqual(['fork-only: a different summer', 'lake at night', 'paddle'])
    expect(fork.deleted.map((e) => e.body)).toEqual(['canoe']) // the origin's forgetting arrives too
    expect(origin.entries.some((e) => e.id === forkOnly.id)).toBe(true)
  })

  it('branch-from-a-moment: the fork holds the moment, carries no record of it, and reunion still resurrects', async () => {
    const origin = mk('branch-origin-101')
    await origin.whenReady
    origin.wind({ kind: 'note', body: 'canoe' })
    await waitUntil(() => origin.history.length > 0)
    const m1 = origin.history[origin.history.length - 1]
    origin.wind({ kind: 'note', body: 'newer' })
    await waitUntil(() => origin.history.length > 1)

    // the recipe: a rewind moment → a doc as it was → a fresh spool
    const rec = (origin.doc.getArray('history').toArray() as { ts: number; snap: string }[]).find((m) => m.ts === m1)!
    const snap = Y.decodeSnapshot(Uint8Array.from(atob(rec.snap), (c) => c.charCodeAt(0)))
    const past = Y.createDocFromSnapshot(origin.doc, snap)
    const branch = mk('branch-child-101')
    await branch.whenReady
    Y.applyUpdate(branch.doc, Y.encodeStateAsUpdate(past))
    past.destroy()

    expect(bodies(branch.entries)).toEqual(['canoe']) // the newer entry never existed here
    expect(branch.history.includes(m1)).toBe(false) // m1's own record lands after its snapshot: no trace of the moment it was cut from

    Y.applyUpdate(branch.doc, Y.encodeStateAsUpdate(origin.doc, Y.encodeStateVector(branch.doc)))
    expect(bodies(branch.entries).sort()).toEqual(['canoe', 'newer']) // reunion: the origin's whole present comes back
  })

  it('the retelling is the only subset that stays a subset: after a cut, rejoining the old reel resurrects nothing', async () => {
    const old = mk('subset-old-101')
    await old.whenReady
    const a = old.wind({ kind: 'note', body: 'kept' })
    old.wind({ kind: 'note', body: 'forgotten' }).delete()
    const reel = mk('subset-new-101')
    await reel.whenReady
    reel.splice([a.snapshot()])
    // the same ids, different items: applying the old reel's update would bring
    // the forgotten one in as a *new* entry (the fork's physics) — the cut is a
    // new document on purpose, and only splice() keeps it a subset
    expect(ids(reel.entries)).toEqual([a.id])
    expect(reel.deleted).toHaveLength(0)
    reel.splice([a.snapshot()]) // idempotent, still a subset
    expect(reel.entries).toHaveLength(1)
  })
})

describe('a cold peer', () => {
  it('opens the reel from the pocket whole — the T-104 idiom against the real relay', async () => {
    const relay = await startRealRelay()
    const old = track(await newSpool({ relay: relay.ws, persist: false, author: 'a' }))
    for (let i = 1; i <= 8; i++) old.wind({ kind: 'track', body: `Track ${i}` })
    old.entries[0].delete()
    old.entries[0].delete()

    // the cut, on the old link's relay: new code, new key, new pocket
    const reel = track(await newSpool({ relay: relay.ws, persist: false, author: 'a' }))
    reel.splice(cut(old.entries.map((e) => e.snapshot())))
    const link = reel.share()
    expect(reel.entries).toHaveLength(6)
    await reel.leave() // flushes the deposit; the room is now empty

    const cold = track(await openSpool(link, { persist: false, author: 'b' }))
    const state = await settled(cold)
    expect(state.phase).toBe('applied')
    expect(ids(cold.entries)).toEqual(ids(old.entries))
    expect(bodies(cold.entries)).toEqual(bodies(old.entries))
    expect(cold.deleted).toHaveLength(0)
  })
})
