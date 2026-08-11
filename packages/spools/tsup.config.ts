import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  // dts via `tsc --emitDeclarationOnly` in the build script: tsup's dts
  // bundler (rollup-plugin-dts) needs the pre-TS7 JS compiler API.
  dts: false,
  clean: true,
})
