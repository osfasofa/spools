/**
 * export() — the portable file (M8, T-080, format (c) per §5).
 *
 * One JSON document, two halves of the same spool:
 *  - `entries`: the human half — every entry (soft-deleted included, marked),
 *    plain and readable in 2040 with no software at all.
 *  - `doc`: the machine half — the full Yjs state as one base64 update:
 *    complete CRDT history, rewind moments included, re-importable, still
 *    able to sync with living peers.
 *
 * Encrypted spools export decrypted (the holder has the key; a keepsake you
 * can't read is not a keepsake) and the key is NEVER written into the file —
 * an export is content; the link stays the only key carrier.
 *
 * Import is a CRDT merge: applying `doc` into whatever local state exists
 * under that code is Yjs's own merge semantics — restoring into an empty
 * browser and reunifying with existing local state are the same operation.
 */
import * as Y from 'yjs'
import { b64decode, b64encode } from './bytes'
import type { EntrySnapshot } from './history'
import { isValidCode } from './link'

export const EXPORT_FORMAT = 'spool-export'
export const EXPORT_VERSION = 1

export interface SpoolExport {
  format: typeof EXPORT_FORMAT
  version: number
  code: string
  exportedAt: number
  /** the human half: all entries, soft-deleted included (marked by deletedAt), display order */
  entries: EntrySnapshot[]
  /** the machine half: base64 (RFC 4648 §4) of Y.encodeStateAsUpdate(doc) */
  doc: string
}

/** the file can't be read as a spool export */
export class SpoolExportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SpoolExportError'
  }
}

/** @internal Spool.export() calls this with its own parts */
export const buildExport = (code: string, entries: EntrySnapshot[], doc: Y.Doc): string =>
  JSON.stringify(
    {
      format: EXPORT_FORMAT,
      version: EXPORT_VERSION,
      code,
      exportedAt: Date.now(),
      entries,
      doc: b64encode(Y.encodeStateAsUpdate(doc)),
    } satisfies SpoolExport,
    null,
    2
  )

/** @internal importSpool's validation half; loud on anything unreadable */
export const parseExport = (input: string | unknown): { code: string; update: Uint8Array } => {
  let raw: unknown = input
  if (typeof input === 'string') {
    try {
      raw = JSON.parse(input)
    } catch {
      throw new SpoolExportError('not JSON — is this really a spool export file?')
    }
  }
  const file = raw as Partial<SpoolExport> | null
  if (!file || typeof file !== 'object' || file.format !== EXPORT_FORMAT) {
    throw new SpoolExportError(`missing "format": "${EXPORT_FORMAT}" — not a spool export`)
  }
  if (typeof file.version !== 'number' || file.version > EXPORT_VERSION) {
    throw new SpoolExportError(
      `export version ${String(file.version)} is newer than this SDK understands (${EXPORT_VERSION})`
    )
  }
  if (typeof file.code !== 'string' || !isValidCode(file.code)) {
    throw new SpoolExportError(`bad spool code in export: ${String(file.code)}`)
  }
  if (typeof file.doc !== 'string') {
    throw new SpoolExportError('export has no doc field — the machine half is missing')
  }
  let update: Uint8Array
  try {
    update = b64decode(file.doc)
  } catch {
    throw new SpoolExportError('the doc field is not valid base64')
  }
  return { code: file.code, update }
}
