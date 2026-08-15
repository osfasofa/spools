/**
 * The token system (design README: "the core deliverable"). The UI never
 * hard-codes a color, font, or radius — everything reads these 8 custom
 * properties + a radius scalar. A theme = one set of values, per device
 * (localStorage, key precedent `spool-view`); themes sync nothing.
 * The picker UI lands in T-122; the tokens are load-bearing from day one.
 */

export interface Theme {
  bg: string
  sf: string
  tx: string
  dim: string
  ac: string
  acTx: string
  ln: string
  bodyfont: string
}

const SANS = "-apple-system,system-ui,'Helvetica Neue',sans-serif"
const MONO = "'JetBrains Mono',ui-monospace,monospace"
const SERIF = "ui-serif,'Iowan Old Style',Georgia,serif"

// daylight/paper `ac` and `dim` are minimally darkened from the handoff
// README's values — the README also mandates WCAG AA for text (T-122's
// acceptance criterion) and its literal values measured 4.05–4.44 on the
// accent-bubble and dim-on-surface pairs; these are the nearest passing
// values (≥4.5), recorded in T-122's Notes and annotated in the README.
export const THEMES: Record<string, Theme> = {
  blackout: { bg: '#000000', sf: '#161616', tx: '#F2F2F2', dim: '#9A9A9A', ac: '#D6D6D6', acTx: '#0D0D0D', ln: '#1F1F1F', bodyfont: SANS },
  terminal: { bg: '#0A0D0A', sf: '#141B13', tx: '#D9E7D9', dim: '#7A8C7A', ac: '#00E653', acTx: '#04220E', ln: '#1B231B', bodyfont: MONO },
  daylight: { bg: '#FAFAF7', sf: '#EFEFEA', tx: '#171717', dim: '#6D6D69', ac: '#0B893A', acTx: '#FFFFFF', ln: '#E3E3DE', bodyfont: SANS },
  paper: { bg: '#F4EEE1', sf: '#EAE1CD', tx: '#29221A', dim: '#6E6254', ac: '#BB4F3A', acTx: '#FFF6EC', ln: '#D9CFB8', bodyfont: SERIF },
}

const KEY = 'room-theme'
export const DEFAULT_THEME = 'blackout'

export const currentTheme = (): string => {
  const stored = localStorage.getItem(KEY)
  return stored && THEMES[stored] ? stored : DEFAULT_THEME
}

export const applyTheme = (name: string): void => {
  const t = THEMES[name] ?? THEMES[DEFAULT_THEME]
  const root = document.documentElement
  root.style.setProperty('--bg', t.bg)
  root.style.setProperty('--sf', t.sf)
  root.style.setProperty('--tx', t.tx)
  root.style.setProperty('--dim', t.dim)
  root.style.setProperty('--ac', t.ac)
  root.style.setProperty('--acTx', t.acTx)
  root.style.setProperty('--ln', t.ln)
  root.style.setProperty('--bodyfont', t.bodyfont)
  root.style.setProperty('--radius', '6px')
  root.style.setProperty('--radius-tail', '1px')
  localStorage.setItem(KEY, name)
}

export const applyStoredTheme = (): void => applyTheme(currentTheme())
