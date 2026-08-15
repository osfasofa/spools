/**
 * Seat identity (D1). The seat id is an OPAQUE, VARIABLE-LENGTH string —
 * never parse it, never assume a length (it may become an Ed25519 public key
 * later, with zero migration). One per device, stored beside `spool-author`.
 * A seat is a device, not a person. Display names live in the shared profile
 * table (profiles.ts), resolved at render — never written into messages.
 */

const KEY = 'spool-seat'

const generate = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const mySeat = (): string => {
  let seat = localStorage.getItem(KEY)
  if (!seat) {
    seat = generate()
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

/**
 * The always-rendered short id (`#k7f2`) — collision legibility without
 * uniqueness rules: two "sam"s stay distinguishable, an unnamed seat is
 * presentable before its first profile entry exists.
 */
export const seatSuffix = (seat: string): string => `#${seat.slice(-4).toLowerCase()}`

/** tile initial: first letter of the current display name */
export const initialOf = (name: string): string =>
  (name.startsWith('#') ? name.slice(1, 2) : name.slice(0, 1)).toUpperCase()
