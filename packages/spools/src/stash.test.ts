/**
 * T-080: the stash — list kept spools, label, archive, and the one hard
 * delete (forget provably removes the database).
 */
import 'fake-indexeddb/auto'
import { afterEach, beforeEach, expect, it } from 'vitest'
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import { stash, touch } from './stash'

// Node has no localStorage; a Map-backed shim gives the registry a home
const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  ;(globalThis as Record<string, unknown>).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  }
})
afterEach(() => {
  delete (globalThis as Record<string, unknown>).localStorage
})

/** persist a real (tiny) spool database the way the engine does */
const keepSpool = async (code: string) => {
  const doc = new Y.Doc()
  const idb = new IndexeddbPersistence(code, doc)
  doc.getMap('entries').set('x', 'y')
  await idb.whenSynced
  await new Promise((r) => setTimeout(r, 30)) // let the update row flush
  await idb.destroy() // closes the connection; data stays
  doc.destroy()
}

it('list() unions kept databases with registry rows, most recent first', async () => {
  await keepSpool('amber-attic-001')
  await keepSpool('velvet-fox-002')
  const tick = () => new Promise((r) => setTimeout(r, 5))
  touch('amber-attic-001', '#spool=amber-attic-001&k=xyz')
  await tick()
  touch('velvet-fox-002')
  await tick()
  touch('paper-crow-003') // registry-only: opened persist:false at some point? still listed

  const list = await stash.list()
  const codes = list.map((s) => s.code)
  expect(codes[0]).toBe('paper-crow-003') // most recently touched
  expect(new Set(codes)).toEqual(new Set(['amber-attic-001', 'velvet-fox-002', 'paper-crow-003']))
  const amber = list.find((s) => s.code === 'amber-attic-001')!
  expect(amber.stored).toBe(true)
  expect(amber.link).toContain('k=xyz') // the stash can reopen sealed spools
  expect(list.find((s) => s.code === 'paper-crow-003')!.stored).toBe(false)
})

it('label and archive are registry metadata, preserved across list calls', async () => {
  touch('misty-bell-004')
  stash.label('misty-bell-004', 'our drive home tape')
  stash.archive('misty-bell-004', true)
  const one = (await stash.list()).find((s) => s.code === 'misty-bell-004')!
  expect(one.label).toBe('our drive home tape')
  expect(one.archived).toBe(true)
})

it('forget() provably removes the database and the registry row', async () => {
  await keepSpool('doomed-dune-005')
  touch('doomed-dune-005')
  expect((await stash.list()).some((s) => s.code === 'doomed-dune-005')).toBe(true)

  await stash.forget('doomed-dune-005')
  expect((await stash.list()).some((s) => s.code === 'doomed-dune-005')).toBe(false)

  // provably gone: a fresh open of that database name is empty
  const doc = new Y.Doc()
  const idb = new IndexeddbPersistence('doomed-dune-005', doc)
  await idb.whenSynced
  expect(doc.getMap('entries').size).toBe(0)
  await idb.destroy()
  doc.destroy()
  await stash.forget('doomed-dune-005') // clean up the probe db; also proves idempotence
})

it('a corrupt registry loses labels, never spools: kept databases still list', async () => {
  await keepSpool('sturdy-anchor-006')
  store.set('spools:stash', '{corrupt json!!')
  const list = await stash.list()
  expect(list.some((s) => s.code === 'sturdy-anchor-006' && s.stored)).toBe(true)
})
