// T-010 manual smoke only: self-contained browser bundle for scratch/smoke-t010
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { engine: 'src/index.ts' },
  format: ['esm'],
  dts: false,
  clean: false,
  outDir: '../../scratch/smoke-t010',
  platform: 'browser',
  noExternal: [/.*/],
})
