import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { type Browser, chromium } from 'playwright-core'
import sharp from 'sharp'
import { type ViteDevServer, createServer } from 'vite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OG_DIR = join(ROOT, 'assets/og')
const EXAMPLES_DIR = join(ROOT, 'examples')
const PNG_PATH = join(ROOT, 'assets/og.png')
const JPG_PATH = join(ROOT, 'assets/og.jpg')

const WIDTH = 1200
const HEIGHT = 630
const SETTLE_MS = 500
const JPEG_START_QUALITY = 86
const JPEG_MIN_QUALITY = 50
const JPEG_MAX_BYTES = 500_000

function countPortraits(): number {
  if (!existsSync(EXAMPLES_DIR)) {
    return 0
  }
  return readdirSync(EXAMPLES_DIR).reduce((total, id) => {
    const media = join(EXAMPLES_DIR, id, 'public/media')
    if (!existsSync(media) || !statSync(media).isDirectory()) {
      return total
    }
    return total + readdirSync(media).filter((file) => file.endsWith('.webp')).length
  }, 0)
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

async function capture(browser: Browser, url: string): Promise<Buffer> {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 })
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto(url)
  await page.waitForSelector('body[data-ready="1"]')
  await page.waitForTimeout(SETTLE_MS)
  if (pageErrors.length) {
    throw new Error(`Page errors:\n${pageErrors.join('\n')}`)
  }
  return page.locator('.frame').screenshot({ path: PNG_PATH })
}

/** Steps the quality down until the JPEG fits the size limit social previews accept. */
async function writeJpeg(png: Buffer): Promise<number> {
  for (let quality = JPEG_START_QUALITY; quality >= JPEG_MIN_QUALITY; quality -= 2) {
    const jpeg = await sharp(png).jpeg({ quality, mozjpeg: true }).toBuffer()
    if (jpeg.length < JPEG_MAX_BYTES) {
      writeFileSync(JPG_PATH, jpeg)
      return quality
    }
  }
  throw new Error(`og.jpg stays over ${JPEG_MAX_BYTES} bytes even at quality ${JPEG_MIN_QUALITY}.`)
}

if (countPortraits() === 0) {
  console.error(
    `No example portraits found in ${relative(ROOT, EXAMPLES_DIR)}/*/public/media/*.webp. ` +
      'The mosaic needs them; restore the examples folder, then retry.',
  )
  process.exit(1)
}

let server: ViteDevServer | undefined
let browser: Browser | undefined

try {
  server = await createServer({ configFile: join(OG_DIR, 'vite.config.ts') })
  await server.listen()
  const url = server.resolvedUrls?.local[0]
  if (!url) {
    throw new Error('The OG dev server did not report a local URL.')
  }
  browser = await launchBrowser()
  const png = await capture(browser, url)
  const quality = await writeJpeg(png)
  console.log(`${relative(ROOT, PNG_PATH)} ${statSync(PNG_PATH).size} bytes`)
  console.log(`${relative(ROOT, JPG_PATH)} ${statSync(JPG_PATH).size} bytes (quality ${quality})`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await browser?.close()
  await server?.close()
}
