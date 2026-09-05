// Self-contained browser bundle for the tape-deck rig (the T-010 smoke pattern).
// Plain object on purpose: this file lives outside packages/spools, so it must
// not import from 'tsup'. Run from packages/spools:
//   corepack pnpm exec tsup --config ../../scratch/riff-tape-deck/tsup.config.ts
export default {
  entry: { spools: '../../scratch/riff-tape-deck/src/entry.ts' },
  format: ['esm'],
  dts: false,
  clean: false,
  outDir: '../../scratch/riff-tape-deck',
  platform: 'browser',
  noExternal: [/.*/],
}
