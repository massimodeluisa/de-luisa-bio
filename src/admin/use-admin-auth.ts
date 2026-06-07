import { ref } from 'vue'

import type { IBio } from '@/content/bio'

function resolveApi(): string {
  const explicit = import.meta.env.VITE_ADMIN_API as string | undefined
  if (explicit) {
    return explicit
  }
  if (
    typeof window !== 'undefined' &&
    /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
  ) {
    return 'http://localhost:8787'
  }
  return ''
}

const API = resolveApi()

export interface IAdminSession {
  user: string
  slug: string
}

export interface IBioStats {
  range: number
  visits: number
  uniques: number
  links: { link: string; clicks: number }[]
  series: { day: string; views: number }[]
  sources: { source: string; count: number }[]
  countries: { country: string; count: number }[]
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API}${path}`, {
      credentials: 'include',
      headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
      ...init,
    })
  } catch {
    throw new Error(
      `Cannot reach the admin API at ${API || '(unset)'}. Is the worker running? → bun worker/dev-server.ts`,
    )
  }
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error(
      API
        ? `Unexpected response from admin API (${res.status})`
        : 'VITE_ADMIN_API is not configured',
    )
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`)
  }
  return data
}

function isSession(value: unknown): value is IAdminSession {
  return typeof (value as IAdminSession | null)?.slug === 'string'
}

const session = ref<IAdminSession | null>(null)

export function useAdminAuth() {
  async function refresh(): Promise<IAdminSession | null> {
    try {
      const me = await api<IAdminSession>('/me')
      session.value = isSession(me) ? me : null
    } catch {
      session.value = null
    }
    return session.value
  }

  async function login(user: string, pass: string): Promise<void> {
    const me = await api<IAdminSession>('/login', {
      method: 'POST',
      body: JSON.stringify({ user, pass }),
    })
    if (!isSession(me)) {
      throw new Error('Login failed')
    }
    session.value = me
  }

  async function logout(): Promise<void> {
    await api('/logout', { method: 'POST' }).catch(() => undefined)
    session.value = null
  }

  function fetchStats(range: number): Promise<IBioStats> {
    return api<IBioStats>(`/stats?range=${range}`)
  }

  function saveBio(bio: IBio): Promise<{ ok: boolean }> {
    return api<{ ok: boolean }>('/bio', { method: 'POST', body: JSON.stringify(bio) })
  }

  function uploadMedia(name: string, dataBase64: string): Promise<{ ok: boolean; path: string }> {
    return api<{ ok: boolean; path: string }>('/media', {
      method: 'POST',
      body: JSON.stringify({ name, dataBase64 }),
    })
  }

  return { session, refresh, login, logout, fetchStats, saveBio, uploadMedia }
}
