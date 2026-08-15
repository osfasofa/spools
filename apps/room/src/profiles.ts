import { seatSuffix } from './seat'

/**
 * The shared profile table (D1/D2): nicknames are `room:profile` entries —
 * body = display name, data.seat = the TARGET seat — resolved newest-wins per
 * seat at render time. Anyone can rename anyone, retroactively, because
 * nothing is ever denormalized into a message (fosho's chat.ts mistake).
 * The entry's own `author` is the free audit trail ("renamed by —").
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
  /** the renamer's self-declared author string, straight off the entry */
  renamedBy: string
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
    table.set(target, { name, renamedBy: rec.author, at: rec.createdAt })
  }
  return table
}

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
