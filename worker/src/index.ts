import { type ISessionPayload, pbkdf2, signSession, timingSafeEqual, verifySession } from './crypto'

interface IAdminUser {
  user: string
  slug: string
  passHash: string
  salt: string
}

export interface IStorage {
  putFile(path: string, contentBase64: string, message: string): Promise<void>
}

export interface Env {
  ADMIN_USERS: string
  SESSION_SECRET: string
  GITHUB_TOKEN: string
  GITHUB_REPO: string
  GITHUB_BRANCH: string
  POSTHOG_HOST: string
  POSTHOG_PROJECT_ID: string
  POSTHOG_READ_KEY: string
  ALLOWED_ORIGIN: string
  storage?: IStorage
}

const COOKIE = 'dlb_session'
const SESSION_TTL = 60 * 60 * 8
const SLUG_RE = /^[a-z0-9-]+$/

function cors(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

function json(data: unknown, env: Env, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(env), ...extra },
  })
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie') ?? ''
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) {
      return decodeURIComponent(v.join('='))
    }
  }
  return null
}

function cookieAttrs(secure: boolean): string {
  return secure ? 'HttpOnly; Secure; SameSite=None' : 'HttpOnly; SameSite=Lax'
}

function isSecure(request: Request): boolean {
  return new URL(request.url).protocol === 'https:'
}

function sessionCookie(token: string, secure: boolean): string {
  return `${COOKIE}=${encodeURIComponent(token)}; ${cookieAttrs(secure)}; Path=/; Max-Age=${SESSION_TTL}`
}

function clearCookie(secure: boolean): string {
  return `${COOKIE}=; ${cookieAttrs(secure)}; Path=/; Max-Age=0`
}

async function authed(request: Request, env: Env): Promise<ISessionPayload | null> {
  const token = readCookie(request, COOKIE)
  return token ? verifySession(token, env.SESSION_SECRET) : null
}

function ghHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'de-luisa-bio-admin',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function ghGetSha(env: Env, path: string): Promise<string | undefined> {
  const url = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}?ref=${env.GITHUB_BRANCH}`
  const res = await fetch(url, { headers: ghHeaders(env) })
  if (res.status === 404) {
    return undefined
  }
  if (!res.ok) {
    throw new Error(`GitHub GET ${path} failed: ${res.status}`)
  }
  const body = (await res.json()) as { sha: string }
  return body.sha
}

async function ghPut(env: Env, path: string, contentB64: string, message: string): Promise<void> {
  const sha = await ghGetSha(env, path)
  const url = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...ghHeaders(env), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: contentB64, branch: env.GITHUB_BRANCH, sha }),
  })
  if (!res.ok) {
    throw new Error(`GitHub PUT ${path} failed: ${res.status} ${await res.text()}`)
  }
}

function toBase64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) {
    bin += String.fromCharCode(b)
  }
  return btoa(bin)
}

function githubStorage(env: Env): IStorage {
  return { putFile: (path, contentB64, message) => ghPut(env, path, contentB64, message) }
}

function storage(env: Env): IStorage {
  return env.storage ?? githubStorage(env)
}

async function hogql(
  env: Env,
  query: string,
  attempt = 0,
): Promise<{ columns: string[]; results: unknown[][] }> {
  const res = await fetch(`${env.POSTHOG_HOST}/api/projects/${env.POSTHOG_PROJECT_ID}/query/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.POSTHOG_READ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  })
  if (!res.ok) {
    if ((res.status >= 500 || res.status === 429) && attempt < 2) {
      await new Promise((r) => setTimeout(r, 350 * (attempt + 1)))
      return hogql(env, query, attempt + 1)
    }
    const body = (await res.text()).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    throw new Error(`PostHog query failed (${res.status}): ${body.slice(0, 160)}`)
  }
  return (await res.json()) as { columns: string[]; results: unknown[][] }
}

async function getStats(env: Env, slug: string, days: number) {
  const pathLike = `%/${slug}%`
  const since = `now() - INTERVAL ${days} DAY`
  const pageviewWhere = `event = '$pageview' AND properties.$current_url LIKE '${pathLike}' AND timestamp >= ${since}`

  const [summary, links, series, sources, countries] = await Promise.all([
    hogql(
      env,
      `SELECT count() AS visits, count(DISTINCT distinct_id) AS uniques FROM events WHERE ${pageviewWhere}`,
    ),
    hogql(
      env,
      `SELECT properties.link_id AS link, count() AS clicks
       FROM events
       WHERE event = 'link_click' AND properties.bio = '${slug}' AND timestamp >= ${since}
       GROUP BY link ORDER BY clicks DESC LIMIT 50`,
    ),
    hogql(
      env,
      `SELECT toDate(timestamp) AS day, count() AS views FROM events WHERE ${pageviewWhere} GROUP BY day ORDER BY day`,
    ),
    hogql(
      env,
      `SELECT coalesce(nullIf(properties.$referring_domain, ''), '$direct') AS source, count() AS c
       FROM events WHERE ${pageviewWhere} GROUP BY source ORDER BY c DESC LIMIT 10`,
    ),
    hogql(
      env,
      `SELECT coalesce(properties.$geoip_country_name, 'Unknown') AS country, count() AS c
       FROM events WHERE ${pageviewWhere} GROUP BY country ORDER BY c DESC LIMIT 10`,
    ),
  ])

  const row = summary.results[0] ?? [0, 0]
  return {
    range: days,
    visits: Number(row[0] ?? 0),
    uniques: Number(row[1] ?? 0),
    links: links.results.map((r) => ({ link: String(r[0] ?? ''), clicks: Number(r[1] ?? 0) })),
    series: series.results.map((r) => ({ day: String(r[0] ?? ''), views: Number(r[1] ?? 0) })),
    sources: sources.results.map((r) => ({ source: String(r[0] ?? '$direct'), count: Number(r[1] ?? 0) })),
    countries: countries.results.map((r) => ({ country: String(r[0] ?? 'Unknown'), count: Number(r[1] ?? 0) })),
  }
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const { user, pass } = (await request.json().catch(() => ({}))) as { user?: string; pass?: string }
  if (!user || !pass) {
    return json({ error: 'missing credentials' }, env, 400)
  }
  const users = JSON.parse(env.ADMIN_USERS) as IAdminUser[]
  const found = users.find((u) => u.user === user)
  if (!found) {
    return json({ error: 'invalid credentials' }, env, 401)
  }
  const hash = await pbkdf2(pass, found.salt)
  if (!timingSafeEqual(hash, found.passHash)) {
    return json({ error: 'invalid credentials' }, env, 401)
  }
  const payload: ISessionPayload = {
    user: found.user,
    slug: found.slug,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL,
  }
  const token = await signSession(payload, env.SESSION_SECRET)
  return json({ user: found.user, slug: found.slug }, env, 200, {
    'Set-Cookie': sessionCookie(token, isSecure(request)),
  })
}

async function handleBio(request: Request, env: Env, session: ISessionPayload): Promise<Response> {
  const bio = (await request.json().catch(() => null)) as { slug?: string } | null
  if (!bio || typeof bio.slug !== 'string') {
    return json({ error: 'invalid bio' }, env, 400)
  }
  if (bio.slug !== session.slug) {
    return json({ error: 'forbidden: you may only edit your own bio' }, env, 403)
  }
  if (!SLUG_RE.test(bio.slug)) {
    return json({ error: 'invalid slug' }, env, 400)
  }
  const content = `${JSON.stringify(bio, null, 2)}\n`
  await storage(env).putFile(
    `content/bios/${bio.slug}.json`,
    toBase64(new TextEncoder().encode(content)),
    `chore(bio): update ${bio.slug} via admin`,
  )
  return json({ ok: true }, env)
}

async function handleMedia(request: Request, env: Env, session: ISessionPayload): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { name?: string; dataBase64?: string } | null
  if (!body?.name || !body.dataBase64) {
    return json({ error: 'missing file' }, env, 400)
  }
  if (!new RegExp(`^${session.slug}-(original|250|600|2000)\\.webp$`).test(body.name)) {
    return json({ error: 'invalid filename' }, env, 400)
  }
  await storage(env).putFile(
    `public/media/${body.name}`,
    body.dataBase64,
    `chore(media): update ${session.slug} avatar (${body.name})`,
  )
  return json({ ok: true, path: `/media/${body.name}` }, env)
}

async function handleStats(request: Request, env: Env, session: ISessionPayload): Promise<Response> {
  if (!SLUG_RE.test(session.slug)) {
    return json({ error: 'invalid session' }, env, 400)
  }
  if (!env.POSTHOG_PROJECT_ID || !env.POSTHOG_READ_KEY) {
    return json({ error: 'PostHog not configured (set POSTHOG_PROJECT_ID and POSTHOG_READ_KEY)' }, env, 503)
  }
  const url = new URL(request.url)
  const days = Math.min(365, Math.max(1, parseInt(url.searchParams.get('range') ?? '30', 10) || 30))
  try {
    return json(await getStats(env, session.slug, days), env)
  } catch (err) {
    return json({ error: String(err) }, env, 502)
  }
}

function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin')
  if (!origin) {
    return null
  }
  if (origin === env.ALLOWED_ORIGIN || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return origin
  }
  return null
}

async function route(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url)

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors(env) })
  }

  try {
    if (pathname === '/login' && request.method === 'POST') {
      return await handleLogin(request, env)
    }
    if (pathname === '/logout' && request.method === 'POST') {
      return json({ ok: true }, env, 200, { 'Set-Cookie': clearCookie(isSecure(request)) })
    }

    const session = await authed(request, env)
    if (pathname === '/me') {
      return session ? json({ user: session.user, slug: session.slug }, env) : json({ error: 'unauthorized' }, env, 401)
    }
    if (!session) {
      return json({ error: 'unauthorized' }, env, 401)
    }
    if (pathname === '/stats' && request.method === 'GET') {
      return await handleStats(request, env, session)
    }
    if (pathname === '/bio' && request.method === 'POST') {
      return await handleBio(request, env, session)
    }
    if (pathname === '/media' && request.method === 'POST') {
      return await handleMedia(request, env, session)
    }
    return json({ error: 'not found' }, env, 404)
  } catch (err) {
    return json({ error: String(err) }, env, 500)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const res = await route(request, env)
    const origin = allowedOrigin(request, env)
    if (origin && origin !== env.ALLOWED_ORIGIN) {
      const headers = new Headers(res.headers)
      headers.set('Access-Control-Allow-Origin', origin)
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
    }
    return res
  },
}
