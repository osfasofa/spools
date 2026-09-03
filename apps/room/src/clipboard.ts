/**
 * Copy text with a fallback for contexts without the async Clipboard API
 * (T-176, review finding F18). `navigator.clipboard` exists only in secure
 * contexts — https or localhost — so a room served over plain http on a LAN,
 * the off-grid kit's whole point, has none, and the copy-link buttons would
 * throw on the first tap. Order:
 *
 *  1. the Clipboard API, called synchronously inside the gesture (Safari
 *     refuses a write after an await);
 *  2. a readonly off-screen textarea + `document.execCommand('copy')`, which
 *     still works on http and still needs the gesture — the promise chain
 *     above stays within it;
 *  3. `false`, so the caller shows the text itself with a long-press hint.
 *
 * Focus is handed back to whatever had it, so a copy never steals the
 * composer (T-030's lesson holds here too).
 */
export const copyText = (text: string): Promise<boolean> => {
  let viaApi: Promise<boolean>
  try {
    const clip = navigator.clipboard
    viaApi =
      clip && typeof clip.writeText === 'function'
        ? clip.writeText(text).then(
            () => true,
            () => false
          )
        : Promise.resolve(false)
  } catch {
    viaApi = Promise.resolve(false)
  }
  return viaApi.then((ok) => ok || viaExecCommand(text))
}

const viaExecCommand = (text: string): boolean => {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false
  const active = document.activeElement as HTMLElement | null
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '') // no keyboard on iOS
  ta.setAttribute('aria-hidden', 'true')
  ta.style.position = 'fixed'
  ta.style.top = '0'
  ta.style.left = '0'
  ta.style.opacity = '0'
  ta.style.fontSize = '16px' // no iOS auto-zoom on focus
  document.body.appendChild(ta)
  let ok = false
  try {
    ta.focus()
    ta.select()
    ta.setSelectionRange(0, text.length)
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  ta.remove()
  active?.focus?.()
  return ok
}
