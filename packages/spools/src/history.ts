/**
 * rewind() — the memory feature (M6, T-060).
 *
 * Mechanism: every spool doc runs gc:false (§5), so deleted content survives
 * as tombstones; a `history` root Y.Array logs `{ ts, snap }` moments — a
 * wall-clock timestamp plus a base64 Y.Snapshot (state vector + delete set,
 * ~0.5 KB; measured in scratch/spike-rewind). Writers append their own
 * moments, debounced on idle after local changes; the array merges like any
 * CRDT data, so every peer scrubs through everyone's recorded moments.
 *
 * rewind(ts) rebuilds the doc as of the latest recorded moment ≤ ts and
 * returns plain frozen EntrySnapshots — read-only time travel; the present
 * is never touched. Snapshots referencing peer state this device hasn't
 * synced are skipped (falling back to the nearest earlier moment) because
 * Y.createDocFromSnapshot dies unhelpfully on missing structs.
 */
import * as Y from 'yjs'

const HISTORY = 'history'

/** what a rewound entry looks like: a plain frozen record, not a live handle */
export interface EntrySnapshot {
  readonly id: string
  readonly author: string
  readonly kind: string
  readonly parent?: string
  readonly createdAt: number
  /** present if the entry was soft-deleted at that moment — memory includes the deleted (T-060) */
  readonly deletedAt?: number
  readonly data?: Record<string, unknown>
  readonly body: string
}

/** rewind() cannot serve the asked-for moment */
export class SpoolHistoryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SpoolHistoryError'
  }
}

interface Moment {
  ts: number
  snap: string
}

/** @internal timing knobs, overridable only by tests */
export interface HistoryTuning {
  /** idle wait after a local change before logging a moment */
  debounceMs?: number
  /** minimum spacing between logged moments (bounds log growth during activity) */
  minGapMs?: number
}

const b64encode = (bytes: Uint8Array): string => {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

const b64decode = (s: string): Uint8Array => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

const byCreation = (a: EntrySnapshot, b: EntrySnapshot) =>
  a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1)

/** read the world out of a rebuilt historical doc, entry.ts field for field */
const readEntries = (doc: Y.Doc): EntrySnapshot[] => {
  const out: EntrySnapshot[] = []
  const entries = doc.getMap('entries') as Y.Map<Y.Map<unknown>>
  for (const id of entries.keys()) {
    const meta = entries.get(id)
    if (!meta) continue
    const parent = meta.get('parent') as string | undefined
    const deletedAt = meta.get('deletedAt') as number | undefined
    const data = meta.get('data') as Record<string, unknown> | undefined
    out.push(
      Object.freeze({
        id,
        author: meta.get('author') as string,
        kind: meta.get('kind') as string,
        ...(parent !== undefined ? { parent } : {}),
        createdAt: meta.get('createdAt') as number,
        ...(deletedAt != null ? { deletedAt } : {}),
        ...(data !== undefined ? { data: Object.freeze(data) } : {}),
        body: doc.share.has(`entry:${id}`) ? doc.getText(`entry:${id}`).toString() : '',
      })
    )
  }
  return Object.freeze(out.sort(byCreation)) as EntrySnapshot[]
}

/** @internal Spool owns one; owns the `history` root array and the debounced logger */
export class HistoryLog {
  #doc: Y.Doc
  #arr: Y.Array<Moment>
  #debounceMs: number
  #minGapMs: number
  #timer: ReturnType<typeof setTimeout> | null = null
  #armed = false
  #lastAppendAt = 0
  #destroyed = false

  constructor(doc: Y.Doc, whenReady: Promise<void>, tuning?: HistoryTuning) {
    this.#doc = doc
    this.#arr = doc.getArray(HISTORY)
    this.#debounceMs = tuning?.debounceMs ?? 2_000
    this.#minGapMs = tuning?.minGapMs ?? 10_000
    doc.on('afterTransaction', this.#onTransaction)
    // like EntryStore: never log while local persistence is still replaying
    whenReady.then(() => {
      this.#armed = true
    })
  }

  /** recorded moment timestamps, ascending — the scrubber's tick marks */
  get moments(): number[] {
    const ts = new Set<number>()
    for (const m of this.#arr.toArray()) {
      if (m && typeof m.ts === 'number') ts.add(m.ts)
    }
    return [...ts].sort((a, b) => a - b)
  }

  rewind(ts: number): EntrySnapshot[] {
    const candidates = this.#arr
      .toArray()
      .filter((m): m is Moment => m != null && typeof m.ts === 'number' && m.ts <= ts)
      .sort((a, b) => b.ts - a.ts)
    if (candidates.length === 0) {
      throw new SpoolHistoryError(
        this.#arr.length === 0
          ? 'this spool has no recorded history yet'
          : `no moment recorded at or before ${ts} — history starts at ${this.moments[0]}`
      )
    }
    const localSv = Y.decodeStateVector(Y.encodeStateVector(this.#doc))
    for (const moment of candidates) {
      let snap: Y.Snapshot
      try {
        snap = Y.decodeSnapshot(b64decode(moment.snap))
      } catch {
        continue // a corrupt moment shouldn't brick the ones before it
      }
      if (!this.#satisfiable(snap, localSv)) continue
      const past = Y.createDocFromSnapshot(this.#doc, snap)
      try {
        return readEntries(past)
      } finally {
        past.destroy()
      }
    }
    throw new SpoolHistoryError(
      'recorded moments reference peer changes this device has not synced yet — try again after syncing'
    )
  }

  /** capture a pending moment right now instead of waiting out the debounce */
  flush(): void {
    if (this.#timer) {
      clearTimeout(this.#timer)
      this.#timer = null
      this.#append()
    }
  }

  destroy(): void {
    this.#destroyed = true
    if (this.#timer) clearTimeout(this.#timer)
    this.#timer = null
    this.#doc.off('afterTransaction', this.#onTransaction)
  }

  /** every sv clock the snapshot needs must exist locally, or reconstruction dies mid-yjs */
  #satisfiable(snap: Y.Snapshot, localSv: Map<number, number>): boolean {
    for (const [client, clock] of snap.sv) {
      if ((localSv.get(client) ?? 0) < clock) return false
    }
    return true
  }

  #onTransaction = (tr: Y.Transaction) => {
    if (!this.#armed || this.#destroyed || !tr.local) return
    // a moment append is itself a transaction — only content changes schedule,
    // or the log would feed itself forever
    for (const type of tr.changed.keys()) {
      if (type !== (this.#arr as unknown)) {
        this.#schedule()
        return
      }
    }
  }

  #schedule() {
    if (this.#timer) clearTimeout(this.#timer)
    const wait = Math.max(this.#debounceMs, this.#lastAppendAt + this.#minGapMs - Date.now())
    this.#timer = setTimeout(() => {
      this.#timer = null
      this.#append()
    }, wait)
  }

  #append() {
    if (this.#destroyed) return
    const snap = Y.snapshot(this.#doc)
    // skip if nothing changed since the newest logged moment (e.g. flush after flush)
    const newest = this.#arr.toArray().reduce<Moment | null>((best, m) => {
      return m && typeof m.ts === 'number' && (!best || m.ts > best.ts) ? m : best
    }, null)
    if (newest) {
      try {
        if (Y.equalSnapshots(Y.decodeSnapshot(b64decode(newest.snap)), snap)) return
      } catch {
        // undecodable newest — log the fresh moment anyway
      }
    }
    this.#lastAppendAt = Date.now()
    this.#arr.push([{ ts: this.#lastAppendAt, snap: b64encode(Y.encodeSnapshot(snap)) }])
  }
}
