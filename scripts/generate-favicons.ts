import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { IBio } from '../src/content/bio'
import { FAVICON_RADIUS, letterGlyphSvg } from '../src/lib/letter-glyph'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const FAV_DIR = join(DIST, 'favicons')
const BIOS_DIR = join(ROOT, 'content/bios')

if (!existsSync(DIST)) {
  console.error('[favicons] dist/ not found — run this after `vite-ssg build`.')
  process.exit(1)
}
mkdirSync(FAV_DIR, { recursive: true })

const files = readdirSync(BIOS_DIR).filter((f) => f.endsWith('.json'))
for (const file of files) {
  const bio = JSON.parse(readFileSync(join(BIOS_DIR, file), 'utf8')) as IBio
  const color = bio.theme.glyphColor ?? bio.theme.primary
  writeFileSync(join(FAV_DIR, `${bio.slug}.svg`), letterGlyphSvg(bio.name[0], color, FAVICON_RADIUS))
}

console.log(`[favicons] generated ${files.length} favicon(s) in dist/favicons/`)
