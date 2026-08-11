// Vendor bundle for apps/client (T-020): one self-contained classic-script
// file exposing a `spools` global. IIFE, not ESM, because module scripts
// don't load over file:// and the client must work from a USB stick.
// noExternal inlines yjs + providers, so the client gets exactly one Yjs
// instance — through this bundle only (T-001 Notes).
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { spools: 'src/index.ts' },
  format: ['iife'],
  globalName: 'spools',
  outExtension: () => ({ js: '.js' }),
  dts: false,
  clean: false,
  outDir: '../../apps/client/vendor',
  platform: 'browser',
  noExternal: [/.*/],
})
