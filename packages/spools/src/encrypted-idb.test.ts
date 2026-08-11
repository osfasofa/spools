// fake-indexeddb/auto must load before the engine module evaluates its
// `inBrowser` check — with it, persist:true works in Node and these tests
// exercise the real storage path end to end.
import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import * as Y from 'yjs'
import { EncryptedIndexeddbPersistence } from './encrypted-idb'
import { SpoolKeyError } from './crypto'
import { generateKey } from './link'
import { SpoolEngine } from './engine'
import { Spool } from './spool'

const tick = (ms = 30) => new Promise((r) => setTimeout(r, ms))

/** raw rows from the updates store, as any inspector would see them */
const rawRows = (name: string): Promise<Uint8Array[]> =>
  new Promise((resolve, reject) => {
    const open = indexedDB.open(name, 1)
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result
      const request = db.transaction('updates', 'readonly').objectStore('updates').getAll()
      request.onsuccess = () => {
        db.close()
        resolve((request.result ?? []).map((r: ArrayBuffer | Uint8Array) => new Uint8Array(r as ArrayBufferLike)))
      }
      request.onerror = () => reject(request.error)
    }
  })

const containsPlaintext = (rows: Uint8Array[], needle: string): boolean => {
  const target = new TextDecoder('latin1').decode(new TextEncoder().encode(needle))
  return rows.some((row) => new TextDecoder('latin1').decode(row).includes(target))
}

describe('EncryptedIndexeddbPersistence (M5)', () => {
  it('stores only ciphertext: magic prefix on every row, no plaintext substrings', async () => {
    const key = generateKey()
    const doc = new Y.Doc()
    const idb = new EncryptedIndexeddbPersistence('sealed-attic-001', doc, key)
    await idb.whenSynced
    doc.getMap('m').set('secret', 'the raven flies at midnight')
    await tick()
    await idb.destroy()

    const rows = await rawRows('sealed-attic-001')
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect([row[0], row[1]]).toEqual([0xe2, 0xe2])
    }
    expect(containsPlaintext(rows, 'the raven flies at midnight')).toBe(false)
    expect(containsPlaintext(rows, 'secret')).toBe(false)
  })

  it('reload with the right key restores the doc (refresh survival)', async () => {
    const key = generateKey()
    const first = new Y.Doc()
    const idbA = new EncryptedIndexeddbPersistence('sealed-attic-002', first, key)
    await idbA.whenSynced
    first.getMap('m').set('kept', 'across reloads')
    await tick()
    await idbA.destroy()

    const second = new Y.Doc()
    const idbB = new EncryptedIndexeddbPersistence('sealed-attic-002', second, key)
    await idbB.whenSynced
    expect(second.getMap('m').get('kept')).toBe('across reloads')
    await idbB.destroy()
  })

  it('wrong key fails LOUD: whenSynced rejects with SpoolKeyError, db not polluted', async () => {
    const key = generateKey()
    const doc = new Y.Doc()
    const idb = new EncryptedIndexeddbPersistence('sealed-attic-003', doc, key)
    await idb.whenSynced
    doc.getMap('m').set('k', 'v')
    await tick()
    await idb.destroy()
    const rowsBefore = (await rawRows('sealed-attic-003')).length

    const intruder = new Y.Doc()
    const wrongIdb = new EncryptedIndexeddbPersistence('sealed-attic-003', intruder, generateKey())
    await expect(wrongIdb.whenSynced).rejects.toBeInstanceOf(SpoolKeyError)

    // the failed open must not have written a wrong-key row into the good db
    expect((await rawRows('sealed-attic-003')).length).toBe(rowsBefore)

    // and the right key still works afterwards
    const recovered = new Y.Doc()
    const okIdb = new EncryptedIndexeddbPersistence('sealed-attic-003', recovered, key)
    await okIdb.whenSynced
    expect(recovered.getMap('m').get('k')).toBe('v')
    await okIdb.destroy()
  })
})

describe('engine + spool integration (persist via fake IDB)', () => {
  it('keyed engine seals at rest; whenReady rejects on wrong key', async () => {
    const key = generateKey()
    const engineA = new SpoolEngine({ code: 'velvet-cellar-042', persist: true, key })
    await engineA.whenReady
    engineA.doc.getMap('m').set('note', 'sealed by the engine')
    await tick()
    await engineA.leave()

    for (const row of await rawRows('velvet-cellar-042')) {
      expect([row[0], row[1]]).toEqual([0xe2, 0xe2])
    }

    const engineB = new SpoolEngine({ code: 'velvet-cellar-042', persist: true, key: generateKey() })
    await expect(engineB.whenReady).rejects.toBeInstanceOf(SpoolKeyError)
  })

  it('keyless engine still stores plaintext (the unencrypted path is unchanged)', async () => {
    const engine = new SpoolEngine({ code: 'paper-ledger-042', persist: true })
    await engine.whenReady
    engine.doc.getMap('m').set('open', 'book')
    await tick()
    await engine.leave()
    const rows = await rawRows('paper-ledger-042')
    expect(rows.some((row) => row[0] === 0xe2 && row[1] === 0xe2)).toBe(false)
  })

  it('spool entries survive an encrypted reload end to end', async () => {
    const key = generateKey()
    const engineA = new SpoolEngine({ code: 'gilded-harbor-042', persist: true, key })
    const spoolA = new Spool(engineA, 'ws://unused.invalid', key, 'ada')
    await spoolA.whenReady
    spoolA.wind({ kind: 'note', body: 'keepsake through the seal' })
    await tick()
    expect(spoolA.keyFingerprint).toHaveLength(8)
    await spoolA.leave()

    const engineB = new SpoolEngine({ code: 'gilded-harbor-042', persist: true, key })
    const spoolB = new Spool(engineB, 'ws://unused.invalid', key, 'ada')
    await spoolB.whenReady
    expect(spoolB.entries).toHaveLength(1)
    expect(spoolB.entries[0]!.body).toBe('keepsake through the seal')
    await spoolB.leave()
  })
})
