import { describe, expect, it, vi } from 'vitest'
import * as Y from 'yjs'
import { SpoolEngine } from './engine'
import { Spool } from './spool'
import type { EntryChange } from './entry'

// T-013: the integration layer. Multi-writer beyond two people is the
// DESIGN_DOC §6 question this file answers. Everything is networkless:
// "offline" is the default state, "sync" is an explicit exchange.

const mkSpool = (author: string) => {
  const engine = new SpoolEngine({ code: 'quiet-harbor-042', persist: false })
  return new Spool(engine, 'ws://unused.invalid', undefined, author)
}

const trio = async () => {
  const spools = [mkSpool('alice'), mkSpool('bob'), mkSpool('cara')] as const
  await Promise.all(spools.map((s) => s.whenReady))
  return spools
}

/** pairwise diff exchange until everyone has everything (2 rounds = transitive closure for any mesh) */
const syncAll = (...spools: Spool[]) => {
  for (let round = 0; round < 2; round++) {
    for (const a of spools) {
      for (const b of spools) {
        if (a === b) continue
        Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc, Y.encodeStateVector(b.doc)))
      }
    }
  }
}

const entryIds = (s: Spool) => s.entries.map((e) => e.id)
const bodies = (s: Spool) => s.entries.map((e) => e.body)

describe('three writers', () => {
  it('concurrent winds converge: all present, identical deterministic order', async () => {
    const [alice, bob, cara] = await trio()
    for (let i = 0; i < 5; i++) {
      alice.wind({ kind: 'note', body: `alice ${i}` })
      bob.wind({ kind: 'note', body: `bob ${i}` })
      cara.wind({ kind: 'note', body: `cara ${i}` })
    }
    syncAll(alice, bob, cara)
    expect(alice.entries).toHaveLength(15)
    expect(entryIds(bob)).toEqual(entryIds(alice))
    expect(entryIds(cara)).toEqual(entryIds(alice))
  })

  it('identical createdAt across writers still orders identically everywhere (id tie-break)', async () => {
    const [alice, bob, cara] = await trio()
    vi.useFakeTimers()
    try {
      vi.setSystemTime(42_000)
      alice.wind({ kind: 'note' })
      bob.wind({ kind: 'note' })
      cara.wind({ kind: 'note' })
    } finally {
      vi.useRealTimers()
    }
    syncAll(alice, bob, cara)
    expect(entryIds(alice)).toEqual(entryIds(bob))
    expect(entryIds(alice)).toEqual(entryIds(cara))
    expect(entryIds(alice)).toEqual([...entryIds(alice)].sort())
  })

  it('concurrent edits to the same body merge character-level, no loss', async () => {
    const [alice, bob, cara] = await trio()
    alice.wind({ kind: 'note', body: 'core' })
    syncAll(alice, bob, cara)

    // all three edit the same body while apart
    alice.entries[0].text!.insert(0, 'A:')
    bob.entries[0].text!.insert(4, ':B') // 'core'.length on bob's copy
    cara.entries[0].text!.insert(0, 'C~')
    syncAll(alice, bob, cara)

    const merged = alice.entries[0].body
    expect(bob.entries[0].body).toBe(merged)
    expect(cara.entries[0].body).toBe(merged)
    for (const piece of ['A:', ':B', 'C~', 'core']) expect(merged).toContain(piece)
  })

  it('concurrent body edit + soft delete both apply; restore reveals the edit', async () => {
    const [alice, bob, cara] = await trio()
    alice.wind({ kind: 'note', body: 'draft' })
    syncAll(alice, bob, cara)

    alice.entries[0].body = 'draft, improved' // alice edits...
    bob.entries[0].delete() // ...while bob deletes
    syncAll(alice, bob, cara)

    for (const s of [alice, bob, cara]) expect(s.entries).toHaveLength(0) // tombstone wins visibility
    // restore on a third party who saw both sides
    const map = cara.doc.getMap<Y.Map<unknown>>('entries')
    const id = map.keys().next().value as string
    map.get(id)!.delete('deletedAt')
    syncAll(alice, bob, cara)
    for (const s of [alice, bob, cara]) {
      expect(s.entries).toHaveLength(1)
      expect(s.entries[0].body).toBe('draft, improved') // the edit survived the tombstone
    }
  })

  it('concurrent delete + restore of the same entry: outcome converges identically everywhere', async () => {
    const [alice, bob, cara] = await trio()
    alice.wind({ kind: 'note', body: 'contested' })
    syncAll(alice, bob, cara)
    alice.entries[0].delete()
    syncAll(alice, bob, cara)

    // now bob restores while cara re-deletes, concurrently
    const bobMap = bob.doc.getMap<Y.Map<unknown>>('entries')
    const caraMap = cara.doc.getMap<Y.Map<unknown>>('entries')
    const id = bobMap.keys().next().value as string
    bobMap.get(id)!.delete('deletedAt')
    caraMap.get(id)!.set('deletedAt', Date.now())
    syncAll(alice, bob, cara)

    // Yjs map LWW picks one winner; the invariant that matters is agreement
    const visible = [alice, bob, cara].map((s) => s.entries.length)
    expect(new Set(visible).size).toBe(1)
  })
})

describe('offline / rejoin', () => {
  it('a writer accumulating offline reconverges with the pair that kept syncing', async () => {
    const [alice, bob, cara] = await trio()
    alice.wind({ kind: 'note', body: 'while cara is away 1' })
    syncAll(alice, bob) // cara excluded: offline
    bob.wind({ kind: 'note', body: 'while cara is away 2' })
    syncAll(alice, bob)

    cara.wind({ kind: 'note', body: 'from the wilderness A' })
    cara.wind({ kind: 'note', body: 'from the wilderness B' })

    syncAll(alice, bob, cara) // cara rejoins
    for (const s of [alice, bob, cara]) expect(s.entries).toHaveLength(4)
    expect(bodies(bob)).toEqual(bodies(alice))
    expect(bodies(cara)).toEqual(bodies(alice))
  })
})

describe('event diffs under sync bursts', () => {
  it('one applied update carrying 5 winds fires exactly one EntryChange with 5 added', async () => {
    const [alice, bob] = await trio()
    for (let i = 0; i < 5; i++) alice.wind({ kind: 'note', body: `burst ${i}` })

    const events: EntryChange[] = []
    bob.on('entry', (c) => events.push(c))
    Y.applyUpdate(bob.doc, Y.encodeStateAsUpdate(alice.doc, Y.encodeStateVector(bob.doc)))

    expect(events).toHaveLength(1)
    expect(events[0].added).toHaveLength(5)
    expect(events[0].updated).toHaveLength(0)
    expect(events[0].deleted).toHaveLength(0)
  })

  it('a burst mixing winds, edits, and deletes classifies correctly', async () => {
    const [alice, bob] = await trio()
    const first = alice.wind({ kind: 'note', body: 'will be edited' })
    const second = alice.wind({ kind: 'note', body: 'will be deleted' })
    syncAll(alice, bob)

    first.body = 'edited!'
    second.delete()
    alice.wind({ kind: 'note', body: 'brand new' })

    const events: EntryChange[] = []
    bob.on('entry', (c) => events.push(c))
    Y.applyUpdate(bob.doc, Y.encodeStateAsUpdate(alice.doc, Y.encodeStateVector(bob.doc)))

    expect(events).toHaveLength(1)
    expect(events[0].added.map((e) => e.body)).toEqual(['brand new'])
    expect(events[0].updated.map((e) => e.id)).toEqual([first.id])
    expect(events[0].deleted.map((e) => e.id)).toEqual([second.id])
  })
})

describe('doc-shape invariants', () => {
  it('lazy bodies: no entry:<id> root materializes anywhere without a body', async () => {
    const [alice, bob] = await trio()
    const bodyless = alice.wind({ kind: 'reaction' })
    alice.wind({ kind: 'note', body: 'has one' })
    syncAll(alice, bob)

    for (const s of [alice, bob]) {
      expect(s.doc.share.has(`entry:${bodyless.id}`)).toBe(false)
      const bodyRoots = [...s.doc.share.keys()].filter((k) => k.startsWith('entry:'))
      expect(bodyRoots).toHaveLength(1)
    }
  })

  it('persist: false engines refuse nothing and touch no storage APIs in Node', () => {
    // Node has no indexedDB at all — construction succeeding IS the proof
    // that persist: false never reaches for it (persist: true throws).
    expect(() => new SpoolEngine({ code: 'quiet-harbor-042', persist: false })).not.toThrow()
    expect(() => new SpoolEngine({ code: 'quiet-harbor-042', persist: true })).toThrow(/IndexedDB/)
  })
})
