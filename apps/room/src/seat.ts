/**
 * Seat identity, the T-113 placeholder half. T-114 owns the profile table
 * (nicknames anyone can edit); this module is shaped so nothing has to
 * unlearn it: the seat id is an OPAQUE, VARIABLE-LENGTH string (never parse
 * it, never assume a length — D1's forward-compat rule; it may become an
 * Ed25519 public key later), one per device, stored beside `spool-author`.
 */

const KEY = 'spool-seat'

export const mySeat = (): string => {
  let seat = localStorage.getItem(KEY)
  if (!seat) {
    seat = crypto.randomUUID().replace(/-/g, '')
    localStorage.setItem(KEY, seat)
  }
  return seat
}

/** design README: palette[hash(seatId) % 6], stable through renames */
const PALETTE = ['#00E653', '#FF6A2B', '#4DC4FF', '#C79BFF', '#FFD43B', '#FF8FB3']

const hash = (s: string): number => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const seatColor = (seat: string): string => PALETTE[hash(seat) % PALETTE.length]

/** the mono short id (`#k7f2`) — collision legibility without uniqueness rules */
export const seatSuffix = (seat: string): string => `#${seat.slice(-4)}`

/**
 * Display name for a seat. T-114 replaces the internals with the shared
 * profile table (newest `room:profile` entry per seat, resolved at render —
 * never denormalized); until then every seat shows as its short id.
 */
export const displayName = (seat: string): string => seatSuffix(seat)

/** tile initial: first letter of the current display name */
export const seatInitial = (seat: string): string => {
  const name = displayName(seat)
  const ch = name.startsWith('#') ? name.slice(1, 2) : name.slice(0, 1)
  return ch.toUpperCase()
}
