import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles.css'

// pasting a different tape's link into the URL bar is a fragment-only
// navigation — reload so the new spool actually opens (T-021 finding)
window.addEventListener('hashchange', () => location.reload())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
