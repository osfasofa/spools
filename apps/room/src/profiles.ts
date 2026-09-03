import { seatSuffix } from './seat'

/**
 * The shared profile table (D1/D2): nicknames are `room:profile` entries —
 * body = display name, data.seat = the TARGET seat, data.by = the RENAMER's
 * seat (T-172) — resolved newest-wins per seat at render time. Anyone can
 * rename anyone, retroactively, because nothing is ever denormalized into a
 * message (fosho's chat.ts mistake). The audit trail ("renamed by —") is
 * `by`, resolved through this same table so it follows renames too; the
 * entry's `author` is the fallback for entries wound before `by` existed
 * (the room never writes `spool-author`, so that reads "anonymous").
 */

/** what both live Entries and frozen EntrySnapshots look like */
export interface ProfileRec {
  readonly id: string
  readonly author: string
  readonly kind: string
  readonly createdAt: number
  readonly data?: Record<string, unknown>
  readonly body: string
}

export interface Profile {
  name: string
  /** the renamer's self-declared author string, straight off the entry — the fallback when `by` is absent */
  renamedBy: string
  /** the renamer's seat (data.by), when the entry carries one (T-172) */
  by?: string
  at: number
}

/**
 * records must arrive in the entries-getter order (createdAt, id tie-break) —
 * the same deterministic order every peer computes — so "last one wins" here
 * IS newest-wins, identically on every device.
 */
export const profileTable = (records: readonly ProfileRec[]): Map<string, Profile> => {
  const table = new Map<string, Profile>()
  for (const rec of records) {
    if (rec.kind !== 'room:profile') continue
    const target = rec.data?.seat
    if (typeof target !== 'string' || target === '') continue
    const name = rec.body.trim()
    if (!name) continue
    const by = rec.data?.by
    table.set(target, {
      name,
      renamedBy: rec.author,
      ...(typeof by === 'string' && by !== '' ? { by } : {}),
      at: rec.createdAt,
    })
  }
  return table
}

/** who renamed this seat, as a display name: the renamer's seat resolved through the table, else the entry's author */
export const renamedByFor = (table: Map<string, Profile>, profile: Profile): string =>
  profile.by ? nameFor(table, profile.by) : profile.renamedBy

/** every seat that has ever written or been named, mine first, then by first appearance */
export const participants = (records: readonly ProfileRec[], mine: string): string[] => {
  const seen = new Set<string>([mine])
  const out: string[] = [mine]
  for (const rec of records) {
    const seat = rec.data?.seat
    if (typeof seat === 'string' && seat !== '' && !seen.has(seat)) {
      seen.add(seat)
      out.push(seat)
    }
  }
  return out
}

export const nameFor = (table: Map<string, Profile>, seat: string): string =>
  table.get(seat)?.name ?? seatSuffix(seat)
