import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' — the built dist/ must serve from any path on any host
// (gh-pages subdirectory, a USB stick, whatever URL the room's people share)
export default defineConfig({
  plugins: [react()],
  base: './',
})
