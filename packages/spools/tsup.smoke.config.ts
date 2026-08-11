// T-010 manual smoke only: self-contained browser bundle for scratch/smoke-t011
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { engine: 'src/index.ts' },
  format: ['esm'],
  dts: false,
  clean: false,
  outDir: '../../scratch/smoke-t011',
  platform: 'browser',
  noExternal: [/.*/],
})
