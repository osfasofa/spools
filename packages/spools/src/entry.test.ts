import { describe, expect, it, vi } from 'vitest'
import * as Y from 'yjs'
import { SpoolEngine } from './engine'
import { NotImplementedError, Spool } from './spool'
import type { EntryChange } from './entry'

// entry-layer tests need no network: spools are built directly on in-memory
// engines; "sync" is Y.applyUpdate between docs
const mkSpool = (author = 'me', seed?: Uint8Array) => {
  const engine = new SpoolEngine({ code: 'quiet-harbor-042', persist: false })
  if (seed) Y.applyUpdate(engine.doc, seed)
  return new Spool(engine, 'ws://unused.invalid', undefined, author)
}

const tick = () => new Promise((r) => setTimeout(r, 0))

const link = (a: Spool, b: Spool) => {
  a.doc.on('update', (u: Uint8Array) => Y.applyUpdate(b.doc, u))
  b.doc.on('update', (u: Uint8Array) => Y.applyUpdate(a.doc, u))
}

describe('SDK-API examples run as written', () => {
  it('wind → live handle; entries; events; share; stubs throw', async () => {
    const spool = mkSpool()
    await spool.whenReady

    const entry = spool.wind({ kind: 'track', body: 'side a, song 1' })
    expect(entry.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(entry.author).toBe('me')
    expect(entry.kind).toBe('track')
    expect(entry.createdAt).toBeTypeOf('number')
    expect(entry.body).toBe('side a, song 1')

    expect(spool.entries).toHaveLength(1)
    expect(spool.share('')).toContain('spool=quiet-harbor-042')
    expect(() => spool.rewind(0)).toThrow(NotImplementedError)
    expect(() => spool.export()).toThrow(NotImplementedError)
  })

  it('body setter over the live handle; text escape hatch', async () => {
    const spool = mkSpool()
    await spool.whenReady
    const entry = spool.wind({ kind: 'note' })
    expect(entry.text).toBeNull()
    expect(entry.body).toBe('')
    entry.body = 'now it exists'
    expect(entry.text).toBeInstanceOf(Y.Text)
    expect(entry.body).toBe('now it exists')
    entry.body = 'replaced'
    expect(entry.body).toBe('replaced')
  })

  it('threading via parent; children excludes deleted', async () => {
    const spool = mkSpool()
    await spool.whenReady
    const track = spool.wind({ kind: 'track', body: 'the song' })
    const reaction = spool.wind({ kind: 'reaction', parent: track.id, body: '🔥' })
    const second = spool.wind({ kind: 'reaction', parent: track.id, body: 'meh' })
    expect(track.children.map((e) => e.id)).toEqual(
      expect.arrayContaining([reaction.id, second.id])
    )
    second.delete()
    expect(track.children.map((e) => e.id)).toEqual([reaction.id])
  })
})

describe('soft delete', () => {
  it('delete hides, restore returns; deletedAt round-trips', async () => {
    const spool = mkSpool()
    await spool.whenReady
    const entry = spool.wind({ kind: 'note', body: 'oops' })
    entry.delete()
    expect(entry.deletedAt).toBeTypeOf('number')
    expect(spool.entries).toHaveLength(0)
    entry.restore()
    expect(entry.deletedAt).toBeUndefined()
    expect(spool.entries).toHaveLength(1)
    expect(entry.body).toBe('oops') // body untouched by the tombstone
  })
})

describe('events: diff + getter, no replay', () => {
  it('no replay on load: seeded doc fires zero events, then events resume', async () => {
    const source = mkSpool('alice')
    await source.whenReady
    source.wind({ kind: 'note', body: 'one' })
    source.wind({ kind: 'note', body: 'two' })
    const seed = Y.encodeStateAsUpdate(source.doc)

    const reopened = mkSpool('bob', seed)
    const spy = vi.fn()
    reopened.on('entry', spy)
    await reopened.whenReady
    await tick()
    expect(spy).not.toHaveBeenCalled()
    expect(reopened.entries).toHaveLength(2) // the getter has the whole truth

    reopened.wind({ kind: 'note', body: 'three' })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('handle identity: wind() === entries member === event payload', async () => {
    const spool = mkSpool()
    await spool.whenReady
    let fromEvent: unknown
    spool.on('entry', (c) => { fromEvent = c.added[0] })
    const wound = spool.wind({ kind: 'note' })
    expect(spool.entries[0]).toBe(wound)
    expect(fromEvent).toBe(wound)
  })

  it('a remote burst of several entries is one batched added event', async () => {
    const source = mkSpool('alice')
    await source.whenReady
    const receiver = mkSpool('bob')
    await receiver.whenReady
    const before = Y.encodeStateAsUpdate(receiver.doc)

    source.wind({ kind: 'note', body: 'a' })
    source.wind({ kind: 'note', body: 'b' })
    source.wind({ kind: 'note', body: 'c' })

    const events: EntryChange[] = []
    receiver.on('entry', (c) => events.push(c))
    Y.applyUpdate(receiver.doc, Y.encodeStateAsUpdate(source.doc, Y.encodeStateVector(receiver.doc)))
    expect(events).toHaveLength(1)
    expect(events[0].added).toHaveLength(3)
    expect(events[0].updated).toHaveLength(0)
    void before
  })

  it('body edits surface as updated; delete/restore as deleted/added', async () => {
    const spool = mkSpool()
    await spool.whenReady
    const entry = spool.wind({ kind: 'note', body: 'v1' })
    const events: EntryChange[] = []
    spool.on('entry', (c) => events.push(c))

    entry.body = 'v2'
    expect(events.at(-1)).toEqual({ added: [], updated: [entry], deleted: [] })

    entry.delete()
    expect(events.at(-1)).toEqual({ added: [], updated: [], deleted: [entry] })

    entry.restore()
    expect(events.at(-1)).toEqual({ added: [entry], updated: [], deleted: [] })
  })

  it('touching an invisible entry stays silent', async () => {
    const spool = mkSpool()
    await spool.whenReady
    const entry = spool.wind({ kind: 'note', body: 'v1' })
    entry.delete()
    const spy = vi.fn()
    spool.on('entry', spy)
    entry.body = 'edited while deleted'
    expect(spy).not.toHaveBeenCalled()
  })

  it('unsubscribe works', async () => {
    const spool = mkSpool()
    await spool.whenReady
    const spy = vi.fn()
    const off = spool.on('entry', spy)
    off()
    spool.wind({ kind: 'note' })
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('two writers, merged docs', () => {
  it('winds from both sides land on both sides; order is deterministic', async () => {
    const a = mkSpool('alice')
    const b = mkSpool('bob')
    await a.whenReady
    await b.whenReady
    link(a, b)

    a.wind({ kind: 'note', body: 'from alice' })
    b.wind({ kind: 'note', body: 'from bob' })
    expect(a.entries).toHaveLength(2)
    expect(b.entries).toHaveLength(2)
    expect(a.entries.map((e) => e.id)).toEqual(b.entries.map((e) => e.id))
  })

  it('concurrent edits to the same body merge without loss (Y.Text, not LWW)', async () => {
    const a = mkSpool('alice')
    const b = mkSpool('bob')
    await a.whenReady
    const wound = a.wind({ kind: 'note', body: 'middle' })
    Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc))
    await b.whenReady

    // offline from each other: alice prepends, bob appends
    a.entries[0].text!.insert(0, 'start ')
    b.entries[0].text!.insert(6, ' end')
    Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc, Y.encodeStateVector(b.doc)))
    Y.applyUpdate(a.doc, Y.encodeStateAsUpdate(b.doc, Y.encodeStateVector(a.doc)))

    expect(a.entries[0].body).toBe(b.entries[0].body)
    expect(a.entries[0].body).toContain('start')
    expect(a.entries[0].body).toContain('end')
    void wound
  })
})

describe('ordering and validation', () => {
  it('sorts by createdAt with id tie-break', async () => {
    const spool = mkSpool()
    await spool.whenReady
    vi.useFakeTimers()
    try {
      vi.setSystemTime(1000)
      spool.wind({ kind: 'note' })
      spool.wind({ kind: 'note' })
      spool.wind({ kind: 'note' })
    } finally {
      vi.useRealTimers()
    }
    const ids = spool.entries.map((e) => e.id)
    expect(ids).toEqual([...ids].sort())
  })

  it('wind rejects empty kind', async () => {
    const spool = mkSpool()
    await spool.whenReady
    expect(() => spool.wind({ kind: '' })).toThrow(/kind/)
  })
})
