/**
 * The stash (M8, T-080): local archive management for the spools this device
 * keeps. "Stash" graduates here from reserved word (§2) to shipped surface.
 *
 * Two sources of truth, merged on list():
 *  - IndexedDB itself — every database whose name is a valid spool code IS a
 *    kept spool (the doc bytes live there);
 *  - a small localStorage registry for what IndexedDB can't hold: label,
 *    last-opened time, archived flag, and the spool's link.
 *
 * The registry stores the full link — including `k=` — in localStorage.
 * That is deliberate: it is the same device and the same trust boundary as
 * the browser history and bookmarks that already carry the link, and without
 * the key a sealed spool in the stash could never be reopened or exported.
 *
 * `forget()` is the ONE hard delete in the whole system (everything inside a
 * spool is soft) — clients owe it ceremony (confirm twice) before calling.
 */
import { isValidCode, parseSpoolLink, SpoolLinkError } from './link'

const REGISTRY_KEY = 'spools:stash'

export interface StashedSpool {
  code: string
  /** the spool's local IndexedDB database exists on this device */
  stored: boolean
  /** the link to reopen it (carries relay and key); absent for spools only ever opened by bare code */
  link?: string
  label?: string
  archived?: boolean
  lastOpened?: number
}

interface RegistryEntry {
  link?: string
  label?: string
  archived?: boolean
  lastOpened?: number
}

const hasLocalStorage = () => typeof localStorage !== 'undefined'
const hasIndexedDB = () => typeof indexedDB !== 'undefined'

const readRegistry = (): Record<string, RegistryEntry> => {
  if (!hasLocalStorage()) return {}
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, RegistryEntry>) : {}
  } catch {
    return {} // a corrupt registry loses labels, never spools — the docs live in IndexedDB
  }
}

const writeRegistry = (registry: Record<string, RegistryEntry>): void => {
  if (!hasLocalStorage()) return
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry))
}

const patch = (code: string, fields: Partial<RegistryEntry>): void => {
  const registry = readRegistry()
  registry[code] = { ...registry[code], ...fields }
  writeRegistry(registry)
}

/** @internal newSpool/openSpool/importSpool stamp persisted spools into the registry */
export const touch = (code: string, link?: string): void => {
  if (!hasLocalStorage()) return
  patch(code, { lastOpened: Date.now(), ...(link ? { link } : {}) })
}

/** spool-code-shaped IndexedDB database names on this device */
const storedCodes = async (): Promise<Set<string>> => {
  if (!hasIndexedDB() || typeof indexedDB.databases !== 'function') return new Set()
  try {
    const dbs = await indexedDB.databases()
    return new Set(dbs.map((db) => db.name ?? '').filter(isValidCode))
  } catch {
    return new Set() // enumeration unsupported → the registry alone carries the list
  }
}

export const stash = {
  /** every spool this device knows: union of kept databases and registry rows, most recent first */
  async list(): Promise<StashedSpool[]> {
    const registry = readRegistry()
    const stored = await storedCodes()
    const codes = new Set([...stored, ...Object.keys(registry).filter(isValidCode)])
    return [...codes]
      .map((code) => ({ code, stored: stored.has(code), ...registry[code] }))
      .sort((a, b) => (b.lastOpened ?? 0) - (a.lastOpened ?? 0))
  },

  /**
   * Record a link this device keeps — without opening the spool (T-179).
   * The row `list()` returns is exactly the one an open would have written:
   * the link (relay and key included) and `lastOpened` stamped now.
   *
   * For a client that opens with `persist: false` and still wants the spool
   * on its shelf, or one that receives a link to hold for later. The key
   * rides in localStorage on this device — the same trust boundary this
   * module's header describes; a spool whose link is here can be reopened
   * by anything that can read this browser's storage.
   *
   * Throws `SpoolLinkError` if the code is not a spool code, the link is not
   * a spool link, or the link names a different spool. Like `label()` and
   * `archive()`, the write itself can throw if localStorage refuses it
   * (a private window with storage off) — catch if the row is a courtesy.
   * Where there is no localStorage at all (Node, SSR) it validates and does
   * nothing, exactly as an open does.
   */
  remember(code: string, link: string): void {
    if (!isValidCode(code)) throw new SpoolLinkError(`bad spool code: ${code}`)
    const parsed = parseSpoolLink(link)
    if (parsed.code !== code) throw new SpoolLinkError(`that link is for ${parsed.code}, not ${code}`)
    touch(code, link)
  },

  /** name a keepsake */
  label(code: string, label: string): void {
    patch(code, { label })
  },

  /** archived = kept but set aside; purely a shelf flag, nothing disconnects */
  archive(code: string, archived: boolean): void {
    patch(code, { archived })
  },

  /**
   * The one hard delete: removes the spool's local database and registry row.
   * Gone from this device forever (peers' copies are their own). Rejects if
   * the database is still open — leave() the spool first.
   */
  async forget(code: string): Promise<void> {
    if (hasIndexedDB()) {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(code)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error ?? new Error(`could not delete ${code}`))
        request.onblocked = () => reject(new Error(`${code} is still open — leave() it before forgetting`))
      })
    }
    const registry = readRegistry()
    delete registry[code]
    writeRegistry(registry)
  },
}
