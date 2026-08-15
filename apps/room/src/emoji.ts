/**
 * Emoji normalization for reaction grouping (T-118). 👍 and 👍🏽 are
 * different body strings; grouped counts must not fragment. Chosen rule:
 * strip skin-tone modifiers (U+1F3FB–U+1F3FF) and variation selectors
 * (U+FE0F), keep ZWJ sequences intact — 👍🏽 groups with 👍, but 👨‍👩‍👧
 * stays a family instead of shattering into people.
 */
export const normalizeEmoji = (s: string): string =>
  s.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '').replace(/\uFE0F/gu, '')

/** the design's quick row — also the seed for the recents row */
export const QUICK_EMOJI = ['👍', '😆', '💀', '🔥', '❤️']

const RECENTS_KEY = 'room-recent-emoji'

export const recentEmoji = (): string[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]') as unknown
    if (Array.isArray(stored) && stored.every((x) => typeof x === 'string') && stored.length > 0) {
      return stored.slice(0, 5)
    }
  } catch {
    // fall through to the default row
  }
  return QUICK_EMOJI
}

export const rememberEmoji = (emoji: string): void => {
  const next = [emoji, ...recentEmoji().filter((e) => e !== emoji)].slice(0, 5)
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
}
