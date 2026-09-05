// Folds the rig into one file, tape-deck.html, that opens from a double-click
// (no server, no module fetches): the page's style and markup, the global
// bundle, and deck.js with its import line swapped for the global.
//
//   node scratch/riff-tape-deck/build-single.mjs            # → tape-deck.html beside this file
//   node scratch/riff-tape-deck/build-single.mjs --bare     # → tape-deck.bare.html: no doctype/html/head/body,
//                                                            #   for hosts that wrap the page themselves
// Needs spools.global.js first (tsup.global.config.ts).

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const here = (p) => fileURLToPath(new URL(p, import.meta.url))
const html = readFileSync(here('./index.html'), 'utf8')
const bundle = readFileSync(here('./spools.global.js'), 'utf8')
const deck = readFileSync(here('./deck.js'), 'utf8')

const between = (s, open, close) => s.slice(s.indexOf(open), s.indexOf(close) + close.length)
const style = between(html, '<style>', '</style>')
const main = between(html, '<main>', '</main>')
const importLine = deck.split('\n').find((l) => l.startsWith('import {'))
if (!importLine) throw new Error('deck.js: no import line to swap')
const names = importLine.slice(importLine.indexOf('{') + 1, importLine.indexOf('}')).trim()
const deckInline = deck
  .replace(importLine, `const { ${names} } = globalThis.spools`)
  .replaceAll('</script', '<\\/script') // belt and braces: none expected, but it would end the tag

const bare = process.argv.includes('--bare')
const body = `<title>the tape deck</title>
${style}
${main}
<script>${bundle}</script>
<script type="module">
${deckInline}
</script>
`
const out = bare
  ? body
  : `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<body>\n${body}</body>\n</html>\n`
const file = here(bare ? './tape-deck.bare.html' : './tape-deck.html')
writeFileSync(file, out)
console.log(`${file}: ${(out.length / 1024).toFixed(0)} KB`)
