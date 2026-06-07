import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Resvg } from '@resvg/resvg-js'
import satori, { type SatoriOptions } from 'satori'
import sharp from 'sharp'

import type { IBio } from '../src/content/bio'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const OG_DIR = join(DIST, 'og')
const BIOS_DIR = join(ROOT, 'content/bios')
const PUBLIC_DIR = join(ROOT, 'public')

const WIDTH = 1200
const HEIGHT = 630
const HALF = WIDTH / 2

const INTER_DIR = join(ROOT, 'node_modules/@fontsource/inter/files')
const MONO_DIR = join(ROOT, 'node_modules/@fontsource/jetbrains-mono/files')
const FONTS: SatoriOptions['fonts'] = [
  ...([400, 600, 700] as const).map((weight) => ({
    name: 'Inter',
    data: readFileSync(join(INTER_DIR, `inter-latin-${weight}-normal.woff`)),
    weight,
    style: 'normal' as const,
  })),
  {
    name: 'JetBrains Mono',
    data: readFileSync(join(MONO_DIR, 'jetbrains-mono-latin-400-normal.woff')),
    weight: 400,
    style: 'normal' as const,
  },
]

type TSatoriStyle = Record<string, string | number | undefined>
interface ISatoriNode {
  type: string
  props: {
    style?: TSatoriStyle
    children?: string | ISatoriNode | Array<string | ISatoriNode>
    src?: string
    width?: number
    height?: number
  }
}

function readableOn(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#121111' : '#ffffff'
}

function fade(ink: string): string {
  return ink === '#121111' ? 'rgba(18,17,17,0.62)' : 'rgba(255,255,255,0.72)'
}

function text(content: string, style: TSatoriStyle): ISatoriNode {
  return { type: 'div', props: { style: { display: 'flex', ...style }, children: content } }
}

function resolveAvatarFile(avatar: string): string | null {
  if (!avatar || avatar.startsWith('data:') || /^https?:/.test(avatar)) {
    return null
  }
  const rel = avatar.replace(/^\//, '')
  const isFile = (f: string) => existsSync(f) && statSync(f).isFile()
  if (/\.(webp|png|jpe?g|avif)$/i.test(avatar)) {
    const f = join(PUBLIC_DIR, rel)
    return isFile(f) ? f : null
  }
  for (const suffix of ['2000', 'original', '600', '250']) {
    const f = join(PUBLIC_DIR, `${rel}-${suffix}.webp`)
    if (isFile(f)) {
      return f
    }
  }
  return null
}

async function photoDataUri(avatar: string): Promise<string | null> {
  const file = resolveAvatarFile(avatar)
  if (!file) {
    return null
  }
  const jpeg = await sharp(file).resize(HALF, HEIGHT, { fit: 'cover' }).jpeg({ quality: 90 }).toBuffer()
  return `data:image/jpeg;base64,${jpeg.toString('base64')}`
}

function nameLines(name: string): string[] {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) {
    return parts
  }
  return [parts[0], parts.slice(1).join(' ')]
}

async function buildCard(bio: IBio): Promise<ISatoriNode> {
  const { theme } = bio
  const ink = readableOn(theme.primary)
  const photo = await photoDataUri(bio.avatar)
  const eyebrow = bio.content.en.eyebrow
  const tagline = bio.content.en.tagline

  const left: ISatoriNode = photo
    ? { type: 'img', props: { src: photo, width: HALF, height: HEIGHT, style: { objectFit: 'cover' } } }
    : {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            width: `${HALF}px`,
            height: `${HEIGHT}px`,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.secondary,
            color: readableOn(theme.secondary),
            fontSize: 220,
            fontWeight: 700,
          },
          children: (bio.name[0] ?? '?').toUpperCase(),
        },
      }

  const right: ISatoriNode = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: `${HALF}px`,
        height: `${HEIGHT}px`,
        padding: '72px',
        backgroundColor: theme.primary,
      },
      children: [
        text(eyebrow.toUpperCase(), {
          fontFamily: 'JetBrains Mono',
          fontSize: 22,
          fontWeight: 400,
          color: fade(ink),
          letterSpacing: '2px',
          marginBottom: '24px',
        }),
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: nameLines(bio.name).map((line) =>
              text(line, {
                fontFamily: 'Inter',
                fontSize: 72,
                fontWeight: 700,
                color: ink,
                lineHeight: 1.04,
                letterSpacing: '-2px',
              }),
            ),
          },
        },
        text(tagline, {
          fontFamily: 'JetBrains Mono',
          fontSize: 24,
          fontWeight: 400,
          color: ink,
          opacity: ink === '#121111' ? 0.82 : 0.92,
          lineHeight: 1.42,
          marginTop: '30px',
        }),
      ],
    },
  }

  return {
    type: 'div',
    props: {
      style: { display: 'flex', width: '100%', height: '100%', backgroundColor: '#121111' },
      children: [left, right],
    },
  }
}

async function writeCard(node: ISatoriNode, slug: string): Promise<void> {
  const element = node as unknown as Parameters<typeof satori>[0]
  const svg = await satori(element, { width: WIDTH, height: HEIGHT, fonts: FONTS })
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng()
  const file = join(OG_DIR, `${slug}.png`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, png)
}

if (!existsSync(DIST)) {
  console.error('[og] dist/ not found — run this after `vite-ssg build`.')
  process.exit(1)
}
mkdirSync(OG_DIR, { recursive: true })

const files = readdirSync(BIOS_DIR).filter((f) => f.endsWith('.json'))
for (const file of files) {
  const bio = JSON.parse(readFileSync(join(BIOS_DIR, file), 'utf8')) as IBio
  await writeCard(await buildCard(bio), bio.slug)
}

console.log(`[og] generated ${files.length} OG card(s) in dist/og/`)
