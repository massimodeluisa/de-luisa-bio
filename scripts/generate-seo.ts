import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { IBio } from '../src/content/bio'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const BIOS_DIR = join(ROOT, 'content/bios')
const ORIGIN = 'https://deluisa.bio'

if (!existsSync(DIST)) {
  console.error('[seo] dist/ not found — run after `vite-ssg build`.')
  process.exit(1)
}

const bios = readdirSync(BIOS_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(BIOS_DIR, f), 'utf8')) as IBio)
  .sort((a, b) => a.slug.localeCompare(b.slug))

const today = new Date().toISOString().slice(0, 10)
const urls = ['', ...bios.map((b) => b.slug)].map((slug) => `${ORIGIN}/${slug}`)

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`

writeFileSync(join(DIST, 'sitemap.xml'), sitemap)

const indexLines = [
  '# De Luisa',
  '',
  '> The De Luisa family link-in-bio. One page per person with their links and social profiles. Canonical URLs are https://deluisa.bio/<slug>.',
  '',
  '## People',
  ...bios.map((b) => {
    const role = b.content.en.eyebrow
    const tagline = b.content.en.tagline
    const summary = [role, tagline].filter(Boolean).join(' — ')
    return `- [${b.name}](${ORIGIN}/${b.slug})${summary ? `: ${summary}` : ''}`
  }),
  '',
  '## Resources',
  `- [Sitemap](${ORIGIN}/sitemap.xml)`,
  `- [Full content for LLMs](${ORIGIN}/llms-full.txt)`,
  '',
]
writeFileSync(join(DIST, 'llms.txt'), indexLines.join('\n'))

const fullSections = bios.map((b) => {
  const lines = [`## ${b.name}`, `URL: ${ORIGIN}/${b.slug}`]
  if (b.content.en.eyebrow) {
    lines.push(`Role: ${b.content.en.eyebrow}`)
  }
  if (b.content.en.tagline) {
    lines.push(`About: ${b.content.en.tagline}`)
  }
  if (b.site) {
    lines.push(`Website: ${b.site}`)
  }
  if (b.links.length) {
    lines.push('Links:')
    for (const l of b.links) {
      lines.push(`- ${l.label.en}: ${l.href}`)
    }
  }
  if (b.socials.length) {
    lines.push('Socials:')
    for (const s of b.socials) {
      lines.push(`- ${s.label.en}: ${s.href}`)
    }
  }
  return lines.join('\n')
})

const full = [
  '# De Luisa — full content for LLMs',
  '',
  '> One section per family member with their role, tagline, links and social profiles.',
  '',
  fullSections.join('\n\n'),
  '',
].join('\n')
writeFileSync(join(DIST, 'llms-full.txt'), full)

console.log(`[seo] wrote sitemap.xml (${urls.length} urls) + llms.txt + llms-full.txt`)
