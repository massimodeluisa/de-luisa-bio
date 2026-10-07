/**
 * Build Env from process.env / platform env maps.
 * Platform-specific secrets stay out of the repo — load via secrets.local / host dashboards.
 */
import type { Env } from './handler'

const KEYS = [
  'ADMIN_USERS',
  'SESSION_SECRET',
  'GITHUB_TOKEN',
  'GITHUB_REPO',
  'GITHUB_BRANCH',
  'POSTHOG_HOST',
  'POSTHOG_PROJECT_ID',
  'POSTHOG_READ_KEY',
  'ALLOWED_ORIGIN',
] as const

export function envFromRecord(source: Record<string, string | undefined>): Env {
  const get = (key: (typeof KEYS)[number], fallback = '') => source[key] ?? fallback
  return {
    ADMIN_USERS: get('ADMIN_USERS', '[]'),
    SESSION_SECRET: get('SESSION_SECRET'),
    GITHUB_TOKEN: get('GITHUB_TOKEN'),
    GITHUB_REPO: get('GITHUB_REPO', 'your-org/open-bio-page'),
    GITHUB_BRANCH: get('GITHUB_BRANCH', 'master'),
    POSTHOG_HOST: get('POSTHOG_HOST', 'https://eu.posthog.com'),
    POSTHOG_PROJECT_ID: get('POSTHOG_PROJECT_ID'),
    POSTHOG_READ_KEY: get('POSTHOG_READ_KEY'),
    ALLOWED_ORIGIN: get('ALLOWED_ORIGIN', 'https://openbio.page'),
  }
}

export function envFromProcess(): Env {
  return envFromRecord(process.env as Record<string, string | undefined>)
}
