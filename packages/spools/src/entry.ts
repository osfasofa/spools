import * as Y from 'yjs'
import type { EntrySnapshot } from './history'

export interface WindInput {
  /** app-level flavor; the protocol doesn't care */
  kind: string
  /** initial body text (creates the Y.Text lazily) */
  body?: string
  /** entry id — threading, reactions, replies */
  parent?: string
  /**
   * Plain-JSON machine fields (a track's url/title/artist); body stays the
   * human text. Write-once by convention: the whole value is last-write-wins,
   * which is only honest for data set at wind time (DESIGN_DOC §5, T-030).
   */
  data?: Record<string, unknown>
}

export interface EntryChange {
  added: Entry[]
  updated: Entry[]
  deleted: Entry[]
}

const ENTRIES = 'entries'
const bodyKey = (id: string) => `entry:${id}`

/** which of splice()'s rules a record broke */
export type SpliceRule = 'id' | 'kind' | 'author' | 'createdAt' | 'deletedAt' | 'body' | 'parent' | 'duplicate'

/**
 * splice() refused the batch — before a single write. `id` names the record,
 * `rule` the field. A dangling `parent` is the one that matters most: in a
 * fresh spool it would render as "not synced yet", a lie (T-180).
 */
export class SpoolSpliceError extends Error {
  readonly id: string
  readonly rule: SpliceRule
  constructor(id: string, rule: SpliceRule, message: string) {
    super(message)
    this.name = 'SpoolSpliceError'
    this.id = id
    this.rule = rule
  }
}

/**
 * @internal An RFC 4122 v4 id. Browsers expose `crypto.randomUUID` only in
 * secure contexts (https or localhost), so a client served from
 * `http://192.168.x.x` — the off-grid kit's whole premise — has just
 * `getRandomValues` (T-176). Same shape either way: 122 random bits with
 * the version and variant nibbles set.
 */
export const uuid = (): string => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40 // version 4
  b[8] = (b[8] & 0x3f) | 0x80 // RFC 4122 variant
  const hex = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
/** createdAt with id tie-break — deterministic across peers */
const byCreation = (a: Entry, b: Entry) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1)

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

  /** plain-JSON machine fields set at wind time; read-only by convention (mutations don't sync) */
  get data(): Record<string, unknown> | undefined {
    return this.#meta().get('data') as Record<string, unknown> | undefined
  }

  /**
   * The entry as a plain frozen record — the same shape rewind() hands out
   * and splice() takes in. `keep.map((e) => e.snapshot())` is the whole
   * selection step of a cut (T-186).
   */
  snapshot(): EntrySnapshot {
    const parent = this.parent
    const deletedAt = this.deletedAt
    const data = this.data
    return Object.freeze({
      id: this.id,
      author: this.author,
      kind: this.kind,
      ...(parent !== undefined ? { parent } : {}),
      createdAt: this.createdAt,
      ...(deletedAt != null ? { deletedAt } : {}),
      ...(data !== undefined ? { data } : {}),
      body: this.body,
    })
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
    return out.sort(byCreation)
  }

  /** the complement of list(): only the soft-deleted, same handles, same sort */
  listDeleted(): Entry[] {
    const out: Entry[] = []
    for (const id of this.entriesMap.keys()) {
      if (this.entriesMap.get(id)?.get('deletedAt') != null) out.push(this.handle(id))
    }
    return out.sort(byCreation)
  }

  wind(input: WindInput): Entry {
    if (typeof input.kind !== 'string' || input.kind === '') {
      throw new Error('wind() needs a non-empty kind')
    }
    const id = uuid()
    this.doc.transact(() => {
      const meta = new Y.Map<unknown>()
      meta.set('id', id)
      meta.set('author', this.#author)
      meta.set('kind', input.kind)
      meta.set('createdAt', Date.now())
      if (input.parent !== undefined) meta.set('parent', input.parent)
      // cloned so a caller mutating their object can't desync local state
      if (input.data !== undefined) meta.set('data', structuredClone(input.data))
      this.entriesMap.set(id, meta)
      if (input.body !== undefined) this.doc.getText(bodyKey(id)).insert(0, input.body)
    })
    return this.handle(id)
  }

  /**
   * Write complete records with their identity intact (T-186). Validates the
   * whole batch first and throws SpoolSpliceError before any write; ids
   * already present are skipped entirely (idempotent — a re-run changes no
   * byte); everything else lands in one transaction, so a peer never sees a
   * half-built reel. Returns live handles in input order.
   */
  splice(records: readonly EntrySnapshot[]): Entry[] {
    const fail = (id: string, rule: SpliceRule, why: string): never => {
      throw new SpoolSpliceError(id, rule, `splice() refused record ${JSON.stringify(id)}: ${why}`)
    }
    const incoming = new Set<string>()
    for (const rec of records) {
      const id = rec?.id
      if (typeof id !== 'string' || id === '') fail(String(id), 'id', 'id must be a non-empty string')
      if (incoming.has(id)) fail(id, 'duplicate', 'the same id twice in one batch')
      incoming.add(id)
      if (typeof rec.kind !== 'string' || rec.kind === '') fail(id, 'kind', 'kind must be a non-empty string')
      if (typeof rec.author !== 'string') fail(id, 'author', 'author must be a string')
      if (typeof rec.createdAt !== 'number' || !Number.isFinite(rec.createdAt)) {
        fail(id, 'createdAt', 'createdAt must be a finite number')
      }
      if (rec.deletedAt !== undefined && (typeof rec.deletedAt !== 'number' || !Number.isFinite(rec.deletedAt))) {
        fail(id, 'deletedAt', 'deletedAt must be a finite number when present')
      }
      if (rec.body !== undefined && typeof rec.body !== 'string') fail(id, 'body', 'body must be a string')
    }
    // parents resolve in the batch or in the target — soft-deleted included:
    // a reply to a hidden entry is a real shape; a reply to nothing is a lie
    for (const rec of records) {
      if (rec.parent !== undefined && !incoming.has(rec.parent) && !this.entriesMap.has(rec.parent)) {
        fail(rec.id, 'parent', `parent ${JSON.stringify(rec.parent)} is neither in this batch nor in the spool`)
      }
    }
    this.doc.transact(() => {
      for (const rec of records) {
        if (this.entriesMap.has(rec.id)) continue // already here: nothing to write, nothing to say
        const meta = new Y.Map<unknown>()
        meta.set('id', rec.id)
        meta.set('author', rec.author)
        meta.set('kind', rec.kind)
        meta.set('createdAt', rec.createdAt)
        if (rec.parent !== undefined) meta.set('parent', rec.parent)
        if (rec.deletedAt !== undefined) meta.set('deletedAt', rec.deletedAt)
        if (rec.data !== undefined) meta.set('data', structuredClone(rec.data))
        this.entriesMap.set(rec.id, meta)
        if (rec.body) this.doc.getText(bodyKey(rec.id)).insert(0, rec.body)
      }
    })
    return records.map((rec) => this.handle(rec.id))
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
