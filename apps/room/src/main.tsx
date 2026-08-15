import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { applyStoredTheme } from './theme'
import './styles.css'

// pasting a different room's link into the URL bar is a fragment-only
// navigation — reload so the new spool actually opens (T-021 finding)
window.addEventListener('hashchange', () => location.reload())

applyStoredTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
