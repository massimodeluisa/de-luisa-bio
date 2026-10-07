import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { basename, dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const EXAMPLES_DIR = join(ROOT, 'examples')
const OUT_ROOT = join(ROOT, 'docs/public/examples')
const CACHE_DIR = join(ROOT, 'node_modules/.cache/obp-examples')
const REPO_PUBLIC = join(ROOT, 'public')
const VITE_SSG = join(ROOT, 'node_modules/.bin/vite-ssg')
const EXAMPLE_ID = /^[a-z0-9-]+$/
const REPO_PUBLIC_SKIP = new Set(['CNAME', 'media', 'robots.txt'])

function discoverExamples(): string[] {
  if (!existsSync(EXAMPLES_DIR)) {
    return []
  }
  return readdirSync(EXAMPLES_DIR, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        EXAMPLE_ID.test(entry.name) &&
        existsSync(join(EXAMPLES_DIR, entry.name, 'content/site.json')),
    )
    .map((entry) => entry.name)
    .sort()
}

function run(command: string, args: string[], env: NodeJS.ProcessEnv): void {
  const result = spawnSync(command, args, { cwd: ROOT, env, stdio: 'inherit' })
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with ${result.status ?? result.signal}`)
  }
}

function preparePublicDir(id: string): string {
  const dir = join(CACHE_DIR, id, 'public')
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  cpSync(REPO_PUBLIC, dir, {
    recursive: true,
    filter: (src) =>
      basename(src) !== '.DS_Store' &&
      !REPO_PUBLIC_SKIP.has(relative(REPO_PUBLIC, src).split(sep)[0] ?? ''),
  })
  const examplePublic = join(EXAMPLES_DIR, id, 'public')
  if (existsSync(examplePublic)) {
    cpSync(examplePublic, dir, {
      recursive: true,
      filter: (src) => basename(src) !== '.DS_Store',
    })
  }
  return dir
}

function countPages(dir: string): number {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((file) =>
    file.endsWith('.html'),
  ).length
}

const examples = discoverExamples()

rmSync(OUT_ROOT, { recursive: true, force: true })
run(process.execPath, ['scripts/generate-icons.ts'], process.env)

for (const id of examples) {
  try {
    const outDir = join(OUT_ROOT, id)
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: 'production',
      OBP_CONTENT_DIR: join('examples', id, 'content'),
      OBP_PUBLIC_DIR: preparePublicDir(id),
      OBP_BASE: `/examples/${id}/`,
      OBP_OUT_DIR: outDir,
      VITE_DEMO_INSTANCE: 'true',
      VITE_GTM_ID: '',
      VITE_POSTHOG_KEY: '',
      VITE_ADMIN_API: '',
    }
    run(VITE_SSG, ['build'], env)
    rmSync(join(outDir, '.vite'), { recursive: true, force: true })
    run(process.execPath, ['scripts/generate-favicons.ts'], env)
    console.log(`[examples] ${id}: ${countPages(outDir)} page(s) -> docs/public/examples/${id}/`)
  } catch (err) {
    console.error(`[examples] ${id} failed: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }
}

console.log(`[examples] built ${examples.length} example(s)`)
