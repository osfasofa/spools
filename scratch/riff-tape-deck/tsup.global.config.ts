// The same bundle as tsup.config.ts, as one classic script that sets
// globalThis.spools — what build-single.mjs inlines into tape-deck.html.
// Run from packages/spools:
//   corepack pnpm exec tsup --config ../../scratch/riff-tape-deck/tsup.global.config.ts
export default {
  entry: { spools: '../../scratch/riff-tape-deck/src/entry.ts' },
  format: ['iife'],
  globalName: 'spools',
  splitting: false,
  dts: false,
  clean: false,
  outDir: '../../scratch/riff-tape-deck',
  platform: 'browser',
  noExternal: [/.*/],
}
