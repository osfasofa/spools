import * as Y from 'yjs'

export interface WindInput {
  /** app-level flavor; the protocol doesn't care */
  kind: string
  /** initial body text (creates the Y.Text lazily) */
  body?: string
  /** entry id — threading, reactions, replies */
  parent?: string
}

export interface EntryChange {
  added: Entry[]
  updated: Entry[]
  deleted: Entry[]
}

const ENTRIES = 'entries'
const bodyKey = (id: string) => `entry:${id}`

/**
 * A live view over the underlying Yjs state — never a snapshot. One handle
 * instance per id: the object returned by wind(), held in spool.entries, and
 * delivered in events is always ===.
 */
export class Entry {
  readonly id: string
  #store: EntryStore

  /** @internal handles come from the store */
  constructor(store: EntryStore, id: string) {
    this.#store = store
    this.id = id
  }

  #meta(): Y.Map<unknown> {
    const meta = this.#store.entriesMap.get(this.id)
    if (!meta) throw new Error(`entry ${this.id} has no metadata (never hard-deleted; this is a bug)`)
    return meta
  }

  get author(): string {
    return this.#meta().get('author') as string
  }

  get kind(): string {
    return this.#meta().get('kind') as string
  }

  get parent(): string | undefined {
    return this.#meta().get('parent') as string | undefined
  }

  get createdAt(): number {
    return this.#meta().get('createdAt') as number
  }

  get deletedAt(): number | undefined {
    return this.#meta().get('deletedAt') as number | undefined
  }

  /**
   * Raw Y.Text for editor bindings; null until a body exists. Existence =
   * the root type is materialized in this doc (a body created empty on
   * another peer stays invisible here until its first character arrives —
   * no update, no existence).
   */
  get text(): Y.Text | null {
    const doc = this.#store.doc
    return doc.share.has(bodyKey(this.id)) ? doc.getText(bodyKey(this.id)) : null
  }

  /** '' if no body exists. Setting replaces content wholesale — bind entry.text for concurrent-edit-safe flows. */
  get body(): string {
    return this.text?.toString() ?? ''
  }

  set body(value: string) {
    const doc = this.#store.doc
    doc.transact(() => {
      const text = doc.getText(bodyKey(this.id))
      if (text.length > 0) text.delete(0, text.length)
      if (value) text.insert(0, value)
    })
  }

  /** live entries whose parent === this.id (soft-deleted children excluded, like spool.entries) */
  get children(): Entry[] {
    return this.#store.list().filter((e) => e.parent === this.id)
  }

  /** soft: sets deletedAt; hidden from spool.entries, restorable */
  delete(): void {
    this.#meta().set('deletedAt', Date.now())
  }

  /** clears deletedAt — archiving falls out free */
  restore(): void {
    this.#meta().delete('deletedAt')
  }
}

/**
 * Owns the doc shape, the handle cache, and the diff-event pipeline.
 * Contract (DESIGN_DOC §5): events are batched per Yjs transaction, and
 * nothing replays on load — the store arms after whenReady, snapshotting
 * what's already there; events describe changes after that point.
 * @internal
 */
export class EntryStore {
  readonly doc: Y.Doc
  readonly entriesMap: Y.Map<Y.Map<unknown>>

  #author: string
  #handles = new Map<string, Entry>()
  #listeners = new Set<(change: EntryChange) => void>()
  /** id → visible (exists and not soft-deleted), as of the last settled transaction */
  #shadow = new Map<string, boolean>()
  #armed = false

  constructor(doc: Y.Doc, author: string, whenReady: Promise<void>) {
    this.doc = doc
    this.entriesMap = doc.getMap(ENTRIES)
    this.#author = author
    doc.on('afterTransaction', this.#onTransaction)
    whenReady.then(() => {
      for (const id of this.entriesMap.keys()) this.#shadow.set(id, this.#visible(id))
      this.#armed = true
    })
  }

  handle(id: string): Entry {
    let entry = this.#handles.get(id)
    if (!entry) {
      entry = new Entry(this, id)
      this.#handles.set(id, entry)
    }
    return entry
  }

  #visible(id: string): boolean {
    const meta = this.entriesMap.get(id)
    return meta !== undefined && meta.get('deletedAt') == null
  }

  /** sorted by createdAt, id as tie-break (deterministic across peers), soft-deleted excluded */
  list(): Entry[] {
    const out: Entry[] = []
    for (const id of this.entriesMap.keys()) {
      if (this.#visible(id)) out.push(this.handle(id))
    }
    return out.sort((a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1))
  }

  wind(input: WindInput): Entry {
    if (typeof input.kind !== 'string' || input.kind === '') {
      throw new Error('wind() needs a non-empty kind')
    }
    const id = crypto.randomUUID()
    this.doc.transact(() => {
      const meta = new Y.Map<unknown>()
      meta.set('id', id)
      meta.set('author', this.#author)
      meta.set('kind', input.kind)
      meta.set('createdAt', Date.now())
      if (input.parent !== undefined) meta.set('parent', input.parent)
      this.entriesMap.set(id, meta)
      if (input.body !== undefined) this.doc.getText(bodyKey(id)).insert(0, input.body)
    })
    return this.handle(id)
  }

  onEntry(cb: (change: EntryChange) => void): () => void {
    this.#listeners.add(cb)
    return () => this.#listeners.delete(cb)
  }

  destroy(): void {
    this.doc.off('afterTransaction', this.#onTransaction)
    this.#listeners.clear()
  }

  /** ids an arbitrary transaction may have affected: the entries map itself, nested meta maps, root body texts */
  #candidates(tr: Y.Transaction): Set<string> {
    const ids = new Set<string>()
    for (const [type, keys] of tr.changed) {
      if ((type as unknown) === this.entriesMap) {
        for (const key of keys) if (key !== null) ids.add(key)
      } else if (type.parent === this.entriesMap && type._item?.parentSub) {
        ids.add(type._item.parentSub)
      } else if (type._item === null) {
        // a root type: reverse-lookup its name; body texts live at entry:<id>
        for (const [name, shared] of this.doc.share) {
          if (shared === type && name.startsWith('entry:')) ids.add(name.slice('entry:'.length))
        }
      }
    }
    return ids
  }

  #onTransaction = (tr: Y.Transaction) => {
    if (!this.#armed) return
    const ids = this.#candidates(tr)
    if (ids.size === 0) return

    const change: EntryChange = { added: [], updated: [], deleted: [] }
    for (const id of ids) {
      if (!this.entriesMap.has(id)) continue // body text before metadata (partial sync) — event when meta lands
      const was = this.#shadow.get(id) ?? false
      const is = this.#visible(id)
      this.#shadow.set(id, is)
      if (!was && is) change.added.push(this.handle(id))
      else if (was && !is) change.deleted.push(this.handle(id))
      else if (was && is) change.updated.push(this.handle(id))
      // !was && !is: touched while invisible (e.g. body edit on a deleted
      // entry) — stays silent; restore() will surface it as added
    }
    if (change.added.length + change.updated.length + change.deleted.length === 0) return
    for (const cb of this.#listeners) cb(change)
  }
}
