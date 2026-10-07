import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { type Env, type IStorage, handleRequest } from '../server/core/handler'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(HERE, '..')

const localStorage: IStorage = {
  async putFile(path, contentBase64) {
    const file = join(REPO_ROOT, path)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, Buffer.from(contentBase64, 'base64'))
    console.log(`[dev] wrote ${path}`)
  },
}

function loadDevVars(): Record<string, string> {
  const out: Record<string, string> = {}
  let raw = ''
  try {
    raw = readFileSync(join(HERE, '.dev.vars'), 'utf8')
  } catch {
    console.warn('[dev] worker/.dev.vars not found — copy .dev.vars.example')
    return out
  }
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m) {
      continue
    }
    let value = m[2]!.trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[m[1]!] = value
  }
  return out
}

const vars = loadDevVars()
const env = {
  ADMIN_USERS: vars.ADMIN_USERS ?? '[]',
  SESSION_SECRET: vars.SESSION_SECRET ?? 'dev-secret',
  GITHUB_TOKEN: vars.GITHUB_TOKEN ?? '',
  GITHUB_REPO: vars.GITHUB_REPO ?? 'your-org/open-bio-page',
  GITHUB_BRANCH: vars.GITHUB_BRANCH ?? 'master',
  POSTHOG_HOST: vars.POSTHOG_HOST ?? 'https://eu.posthog.com',
  POSTHOG_PROJECT_ID: vars.POSTHOG_PROJECT_ID ?? '',
  POSTHOG_READ_KEY: vars.POSTHOG_READ_KEY ?? '',
  ALLOWED_ORIGIN: vars.ALLOWED_ORIGIN ?? 'http://localhost:5173',
  storage: localStorage,
} satisfies Env

const port = Number(process.env.PORT ?? 8787)
try {
  Bun.serve({ port, fetch: (request) => handleRequest(request, env) })
  console.log(`admin API (dev) → http://localhost:${port}`)
} catch (err) {
  if ((err as { code?: string })?.code === 'EADDRINUSE') {
    console.warn(`admin API: port ${port} already in use — assuming it's already running.`)
    process.exit(0)
  }
  throw err
}
