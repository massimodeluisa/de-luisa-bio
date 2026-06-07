import type { PostHog } from 'posthog-js'

const GTM_ID = 'GTM-MCT4XSDM'
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

function ensureDataLayer(): Record<string, unknown>[] {
  window.dataLayer = window.dataLayer ?? []
  return window.dataLayer
}

let gtmLoaded = false
function loadGtm() {
  if (gtmLoaded || typeof document === 'undefined') {
    return
  }
  gtmLoaded = true
  ensureDataLayer().push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
  document.head.appendChild(script)
}

let posthog: PostHog | null = null
async function loadPosthog() {
  if (posthog || typeof window === 'undefined' || !POSTHOG_KEY) {
    return
  }
  const { default: ph } = await import('posthog-js')
  ph.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    autocapture: true,
    person_profiles: 'identified_only',
  })
  posthog = ph
}

export function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return
  }
  ensureDataLayer().push({ event, ...payload })
  posthog?.capture(event, payload, { send_instantly: true })
}

export function initAnalytics() {
  if (typeof window === 'undefined') {
    return
  }
  const start = () => {
    loadGtm()
    void loadPosthog()
    track('page_view', {
      page_path: window.location.pathname,
      page_title: document.title,
      page_location: window.location.href,
    })
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 2500 })
  } else {
    setTimeout(start, 1)
  }
}
