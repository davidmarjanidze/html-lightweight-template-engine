import { rmSync } from 'node:fs'
import { build } from 'esbuild'

const common = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  target: 'es2022'
}

rmSync('dist', { recursive: true, force: true })

await Promise.all([
  build({ ...common, format: 'esm', outfile: 'dist/index.js' }),
  build({
    ...common,
    format: 'iife',
    globalName: 'htmlLightweightTemplateEngine',
    minify: true,
    outfile: 'dist/html-lightweight-template-engine.min.js'
  })
])
