import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' — the built dist/ must serve from any path on any host
// (a subdirectory, a USB stick, whatever URL the tape's owner already has)
export default defineConfig({
  plugins: [react()],
  base: './',
})
