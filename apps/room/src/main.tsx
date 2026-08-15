import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { applyStoredTheme } from './theme'
import './styles.css'

// pasting a different room's link into the URL bar is a fragment-only
// navigation — reload so the new spool actually opens (T-021 finding)
window.addEventListener('hashchange', () => location.reload())

// iOS: focusing an input opens the keyboard, which shrinks the VISUAL
// viewport but not the layout one — 100dvh leaves the composer under the
// keyboard and Safari "helpfully" scrolls the page, shearing the layout.
// Track the visual viewport into a CSS var (the shell's height) and pin the
// page scroll, so the keyboard resizes the app instead of shifting it.
const vv = window.visualViewport
if (vv) {
  const sync = () => {
    document.documentElement.style.setProperty('--app-height', `${vv.height}px`)
    window.scrollTo(0, 0)
  }
  vv.addEventListener('resize', sync)
  vv.addEventListener('scroll', sync)
  sync()
}

applyStoredTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
