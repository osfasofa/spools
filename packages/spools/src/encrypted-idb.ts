/**
 * Encrypted IndexedDB persistence (M5, lifted from fosho
 * encrypted-indexeddb.ts and trimmed hard).
 *
 * Same storage shape as y-indexeddb (an `updates` store of Yjs update rows,
 * compacted to one full-state row past a threshold), but every row is
 * `0xE2E2 || nonce || ciphertext`. The magic prefix marks "this is sealed" —
 * rows without it are foreign and treated as undecryptable.
 *
 * Trims from fosho, all deliberate:
 * - Key is required. The engine chooses plain IndexeddbPersistence for
 *   keyless spools; this class never does plaintext.
 * - No unencrypted-row passthrough (Spool has no legacy data), no
 *   setSessionKey mutation (the key flows through the instance, fixed), no
 *   custom key-value store, no event emitter — `synced` + `whenSynced`
 *   cover the engine's needs.
 * - Wrong keys fail LOUD: if stored rows exist and none decrypt,
 *   `whenSynced` rejects with SpoolKeyError and the persistence detaches —
 *   fosho silently skipped rows and, worse, wrote a state row encrypted with
 *   the wrong key *before* reading (polluting the good database). Here
 *   nothing is written until existing rows validate.
 */
import * as Y from 'yjs'
import { SpoolKeyError, decrypt, encrypt } from './crypto'

const UPDATES_STORE = 'updates'
const PREFERRED_TRIM_SIZE = 500
const MAGIC = [0xe2, 0xe2] // "E2E"

const seal = (update: Uint8Array, key: Uint8Array): Uint8Array => {
  const ciphertext = encrypt(update, key)
  const row = new Uint8Array(2 + ciphertext.length)
  row.set(MAGIC, 0)
  row.set(ciphertext, 2)
  return row
}

const unseal = (row: Uint8Array, key: Uint8Array): Uint8Array | null => {
  if (row.length < 2 || row[0] !== MAGIC[0] || row[1] !== MAGIC[1]) return null
  return decrypt(row.slice(2), key)
}

export class EncryptedIndexeddbPersistence {
  readonly name: string
  readonly doc: Y.Doc
  synced = false
  readonly whenSynced: Promise<void>

  #key: Uint8Array
  #db: IDBDatabase | null = null
  #dbsize = 0
  #destroyed = false
  #compactTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(name: string, doc: Y.Doc, key: Uint8Array) {
    this.name = name
    this.doc = doc
    this.#key = key
    this.whenSynced = this.#open()
    this.doc.on('destroy', this.destroy)
  }

  async #open(): Promise<void> {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.name, 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(UPDATES_STORE)) {
          request.result.createObjectStore(UPDATES_STORE, { autoIncrement: true })
        }
      }
    })
    if (this.#destroyed) {
      db.close()
      return
    }
    this.#db = db

    // Validate BEFORE writing anything: a wrong key must not pollute the db.
    const rows = await this.#getAllRows()
    const updates: Uint8Array[] = []
    let failed = 0
    for (const row of rows) {
      const update = unseal(row, this.#key)
      if (update) updates.push(update)
      else failed++ // corrupt row; survives until compaction rewrites the store
    }
    if (rows.length > 0 && updates.length === 0) {
      await this.destroy()
      throw new SpoolKeyError(
        `the k= in this link cannot decrypt the local data for "${this.name}" — wrong or changed key`
      )
    }

    await this.#storeRow(seal(Y.encodeStateAsUpdate(this.doc), this.#key))
    Y.transact(
      this.doc,
      () => {
        for (const update of updates) Y.applyUpdate(this.doc, update)
      },
      this,
      false
    )
    this.#dbsize = rows.length - failed + 1

    this.doc.on('update', this.#onUpdate)
    this.synced = true
  }

  #getAllRows(): Promise<Uint8Array[]> {
    return new Promise((resolve, reject) => {
      if (!this.#db) return resolve([])
      const request = this.#db.transaction(UPDATES_STORE, 'readonly').objectStore(UPDATES_STORE).getAll()
      request.onsuccess = () => resolve(request.result ?? [])
      request.onerror = () => reject(request.error)
    })
  }

  #storeRow(row: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.#db) return resolve()
      const request = this.#db.transaction(UPDATES_STORE, 'readwrite').objectStore(UPDATES_STORE).add(row)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  #onUpdate = (update: Uint8Array, origin: unknown): void => {
    if (!this.#db || origin === this) return
    void this.#storeRow(seal(update, this.#key))
    if (++this.#dbsize >= PREFERRED_TRIM_SIZE && this.#compactTimeout === null) {
      this.#compactTimeout = setTimeout(() => {
        this.#compactTimeout = null
        void this.#compact()
      }, 1000)
    }
  }

  /** replace all rows with one sealed full-state row */
  async #compact(): Promise<void> {
    if (this.#destroyed || !this.#db) return
    const store = this.#db.transaction(UPDATES_STORE, 'readwrite').objectStore(UPDATES_STORE)
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear()
      clearRequest.onsuccess = () => resolve()
      clearRequest.onerror = () => reject(clearRequest.error)
    })
    await this.#storeRow(seal(Y.encodeStateAsUpdate(this.doc), this.#key))
    this.#dbsize = 1
  }

  destroy = async (): Promise<void> => {
    if (this.#destroyed) return
    this.#destroyed = true
    if (this.#compactTimeout !== null) clearTimeout(this.#compactTimeout)
    this.doc.off('update', this.#onUpdate)
    this.doc.off('destroy', this.destroy)
    this.#db?.close()
    this.#db = null
  }

  /** destroy and delete the local database — the spool stops being a keepsake */
  async clearData(): Promise<void> {
    await this.destroy()
    indexedDB.deleteDatabase(this.name)
  }
}
