import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { type Browser, type BrowserContextOptions, type Page, chromium } from 'playwright-core'
import sharp from 'sharp'

import type { IBioStats } from '../src/admin/use-admin-auth'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC_DIR = join(ROOT, 'docs/public')
const EXAMPLE_ID = 'ferraresi'
const EXAMPLE_DIR = join(PUBLIC_DIR, 'examples', EXAMPLE_ID)
const BIO_PATH = join(ROOT, 'examples', EXAMPLE_ID, 'content/bios/giulia.json')
const OUT_DIR = join(PUBLIC_DIR, 'screens')

const ADMIN_API = 'http://localhost:8787'
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost'])
const ADMIN_PATH = `/examples/${EXAMPLE_ID}/admin`
const STATS_RANGE = 30
const SETTLE_MS = 800
const RANDOM_SEED = 20261007

type TDevice = 'desktop' | 'mobile'
type TScheme = 'light' | 'dark'

interface IDevice {
  context: BrowserContextOptions
  outputWidth: number
}

interface IShot {
  id: string
  path: string
  signedIn: boolean
  prepare?: (page: Page) => Promise<void>
}

const DEVICES: Record<TDevice, IDevice> = {
  desktop: {
    context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    outputWidth: 1440,
  },
  mobile: {
    context: {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
    outputWidth: 780,
  },
}

const SCHEMES: TScheme[] = ['light', 'dark']

const SHOTS: IShot[] = [
  { id: 'home', path: `/examples/${EXAMPLE_ID}/`, signedIn: false },
  { id: 'bio', path: `/examples/${EXAMPLE_ID}/giulia`, signedIn: false },
  {
    id: 'admin-login',
    path: ADMIN_PATH,
    signedIn: false,
    prepare: (page) => page.getByRole('button', { name: 'Sign in' }).waitFor(),
  },
  {
    id: 'admin-editor',
    path: ADMIN_PATH,
    signedIn: true,
    prepare: async (page) => {
      await page.getByRole('button', { name: 'Editor', exact: true }).click()
      await page.getByText('Live preview').waitFor()
    },
  },
  {
    id: 'admin-stats',
    path: ADMIN_PATH,
    signedIn: true,
    prepare: async (page) => {
      await page.getByRole('button', { name: 'Stats', exact: true }).click()
      await page.locator('select').selectOption(String(STATS_RANGE))
    },
  },
]

function isFile(path: string): boolean {
  return statSync(path, { throwIfNoEntry: false })?.isFile() === true
}

/** Mirrors the static host: flat `<slug>.html` pages plus an SPA fallback for client-only routes. */
function resolveFile(pathname: string): string | null {
  const target = normalize(join(PUBLIC_DIR, pathname))
  if (!target.startsWith(PUBLIC_DIR + sep)) {
    return null
  }
  if (isFile(target)) {
    return target
  }
  const match = /^\/examples\/([a-z0-9-]+)\/(.*)$/.exec(pathname)
  if (!match) {
    return null
  }
  const exampleRoot = join(PUBLIC_DIR, 'examples', match[1] ?? '')
  const index = join(exampleRoot, 'index.html')
  const rest = (match[2] ?? '').replace(/\/$/, '')
  if (rest && extname(rest) === '') {
    const page = join(exampleRoot, `${rest}.html`)
    if (isFile(page)) {
      return page
    }
  }
  return isFile(index) ? index : null
}

function serveStatic(request: Request): Response {
  const file = resolveFile(decodeURIComponent(new URL(request.url).pathname))
  return file ? new Response(Bun.file(file)) : new Response('Not found', { status: 404 })
}

function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function sampleStats(): IBioStats {
  const today = new Date()
  const series = Array.from({ length: STATS_RANGE }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (STATS_RANGE - 1 - index))
    const views = Math.round(41 + 15 * Math.sin(index / 2.2) + 8 * Math.sin(index * 1.3))
    return { day: dayKey(date), views }
  })
  return {
    range: STATS_RANGE,
    visits: 1240,
    uniques: 812,
    links: [
      { link: 'recipes', clicks: 214 },
      { link: 'email', clicks: 63 },
      { link: 'instagram', clicks: 158 },
    ],
    series,
    sources: [
      { source: 'instagram.example', count: 412 },
      { source: 'direct', count: 389 },
      { source: 'bottega-ferraresi.example', count: 121 },
      { source: 'search', count: 98 },
    ],
    countries: [
      { country: 'IT', count: 702 },
      { country: 'CH', count: 91 },
      { country: 'DE', count: 64 },
      { country: 'FR', count: 43 },
      { country: 'GB', count: 31 },
    ],
  }
}

function adminResponse(pathname: string, signedIn: boolean, bio: string): [number, string] {
  if (!signedIn) {
    return pathname === '/me'
      ? [401, JSON.stringify({ error: 'Not signed in' })]
      : [404, JSON.stringify({ error: 'Not found' })]
  }
  switch (pathname) {
    case '/me':
      return [200, JSON.stringify({ user: 'giulia', slug: 'giulia' })]
    case '/bio':
      return [200, bio]
    case '/stats':
      return [200, JSON.stringify(sampleStats())]
    default:
      return [404, JSON.stringify({ error: 'Not found' })]
  }
}

/** The home page shuffles its portraits, so a seeded mulberry32 keeps every run and theme identical. */
async function seedRandom(page: Page) {
  await page.addInitScript((seed: number) => {
    let state = seed
    Math.random = () => {
      state = (state + 0x6d2b79f5) | 0
      let t = Math.imul(state ^ (state >>> 15), state | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }, RANDOM_SEED)
}

/** Screenshots must not depend on third-party services, such as the Microlink site-card lookup. */
async function blockExternalRequests(page: Page) {
  await page.route('**/*', async (route) => {
    if (LOCAL_HOSTS.has(new URL(route.request().url()).hostname)) {
      await route.fallback()
      return
    }
    await route.abort('blockedbyclient')
  })
}

async function mockAdminApi(page: Page, signedIn: boolean, bio: string, fallbackOrigin: string) {
  await page.route(`${ADMIN_API}/**`, async (route) => {
    const request = route.request()
    const headers = {
      'access-control-allow-origin': (await request.headerValue('origin')) ?? fallbackOrigin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': 'content-type',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'content-type': 'application/json',
    }
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers })
      return
    }
    const [status, body] = adminResponse(new URL(request.url()).pathname, signedIn, bio)
    await route.fulfill({ status, headers, body })
  })
}

async function launchBrowser(): Promise<Browser> {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined
  try {
    return await chromium.launch({ executablePath })
  } catch (error) {
    throw new Error(
      `Could not launch Chromium: ${error instanceof Error ? error.message : String(error)}\n` +
        'Set PLAYWRIGHT_CHROMIUM_PATH to a Chromium or Chrome binary, ' +
        'or install one with `bunx playwright-core install chromium`.',
      { cause: error },
    )
  }
}

async function capture(browser: Browser, origin: string, bio: string): Promise<string[]> {
  const pageErrors: string[] = []
  mkdirSync(OUT_DIR, { recursive: true })
  for (const [device, { context: contextOptions, outputWidth }] of Object.entries(DEVICES)) {
    for (const scheme of SCHEMES) {
      const context = await browser.newContext({ ...contextOptions, colorScheme: scheme })
      try {
        for (const shot of SHOTS) {
          const name = `${shot.id}-${device}-${scheme}`
          const page = await context.newPage()
          page.on('pageerror', (error) => pageErrors.push(`${name}: ${error.message}`))
          await seedRandom(page)
          await blockExternalRequests(page)
          await mockAdminApi(page, shot.signedIn, bio, origin)
          await page.goto(`${origin}${shot.path}`, { waitUntil: 'networkidle' })
          if (shot.prepare) {
            await shot.prepare(page)
            await page.waitForLoadState('networkidle')
          }
          await page.evaluate(() => window.scrollTo(0, 0))
          await page.waitForTimeout(SETTLE_MS)
          const png = await page.screenshot({ type: 'png' })
          await page.close()
          const out = join(OUT_DIR, `${name}.webp`)
          const info = await sharp(png)
            .resize({ width: outputWidth })
            .webp({ quality: 80 })
            .toFile(out)
          console.log(`${relative(ROOT, out)} ${info.size} bytes`)
        }
      } finally {
        await context.close()
      }
    }
  }
  return pageErrors
}

if (!existsSync(join(EXAMPLE_DIR, 'index.html'))) {
  console.error(
    `Missing ${relative(ROOT, EXAMPLE_DIR)}. Run \`bun run examples:build\` first, then retry.`,
  )
  process.exit(1)
}

const bio = readFileSync(BIO_PATH, 'utf8')
const server = Bun.serve({ hostname: '127.0.0.1', port: 0, fetch: serveStatic })
const origin = `http://127.0.0.1:${server.port}`
let browser: Browser | undefined

try {
  browser = await launchBrowser()
  const pageErrors = await capture(browser, origin, bio)
  if (pageErrors.length) {
    console.error(`Page errors:\n${pageErrors.join('\n')}`)
    process.exitCode = 1
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await browser?.close()
  await server.stop(true)
}
