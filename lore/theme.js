/* lore themes. The room's token system verbatim (8 properties + radius;
   skins change tokens, never layout), with the vessel's own default skin —
   field: near-black with the TE-orange accent, the second color of the house
   seat palette. Per-device, synced nowhere. */
/* exported LoreTheme */
const LoreTheme = (() => {
  const SANS = "-apple-system,system-ui,'Helvetica Neue',sans-serif"
  const MONO = "'JetBrains Mono',ui-monospace,monospace"
  const SERIF = "ui-serif,'Iowan Old Style',Georgia,serif"

  // blackout/terminal/daylight/paper carry over from the room (T-122's
  // AA-corrected values); field is lore's own.
  const THEMES = {
    field: { bg: '#0A0A0A', sf: '#161511', tx: '#F2EFE9', dim: '#918B80', ac: '#FF6A2B', acTx: '#1A0D05', ln: '#242019', bodyfont: SANS },
    blackout: { bg: '#000000', sf: '#161616', tx: '#F2F2F2', dim: '#9A9A9A', ac: '#D6D6D6', acTx: '#0D0D0D', ln: '#1F1F1F', bodyfont: SANS },
    terminal: { bg: '#0A0D0A', sf: '#141B13', tx: '#D9E7D9', dim: '#7A8C7A', ac: '#00E653', acTx: '#04220E', ln: '#1B231B', bodyfont: MONO },
    daylight: { bg: '#FAFAF7', sf: '#EFEFEA', tx: '#171717', dim: '#6D6D69', ac: '#0B893A', acTx: '#FFFFFF', ln: '#E3E3DE', bodyfont: SANS },
    paper: { bg: '#F4EEE1', sf: '#EAE1CD', tx: '#29221A', dim: '#6E6254', ac: '#BB4F3A', acTx: '#FFF6EC', ln: '#D9CFB8', bodyfont: SERIF },
  }

  const KEY = 'lore-theme'
  const DEFAULT = 'field'

  const current = () => {
    const stored = localStorage.getItem(KEY)
    return stored && THEMES[stored] ? stored : DEFAULT
  }

  const apply = (name) => {
    const t = THEMES[name] || THEMES[DEFAULT]
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
    localStorage.setItem(KEY, name)
  }

  // canvas reads the applied tokens once per paint via this, so the tape and
  // the DOM can never disagree about the palette
  const tokens = () => {
    const s = getComputedStyle(document.documentElement)
    return {
      bg: s.getPropertyValue('--bg').trim(),
      sf: s.getPropertyValue('--sf').trim(),
      tx: s.getPropertyValue('--tx').trim(),
      dim: s.getPropertyValue('--dim').trim(),
      ac: s.getPropertyValue('--ac').trim(),
      ln: s.getPropertyValue('--ln').trim(),
      tracks: [
        s.getPropertyValue('--t0').trim(),
        s.getPropertyValue('--t1').trim(),
        s.getPropertyValue('--t2').trim(),
        s.getPropertyValue('--t3').trim(),
      ],
    }
  }

  return { THEMES, KEY, DEFAULT, current, apply, tokens }
})()
