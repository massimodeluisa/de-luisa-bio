const GTM_ID = 'GTM-MCT4XSDM'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

function ensureDataLayer(): Record<string, unknown>[] {
  window.dataLayer = window.dataLayer ?? []
  return window.dataLayer
}

let scriptLoaded = false

function loadGtm() {
  if (scriptLoaded || typeof document === 'undefined') {
    return
  }
  scriptLoaded = true
  ensureDataLayer().push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
  document.head.appendChild(script)
}

/** Push a custom event to the GTM dataLayer. */
export function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return
  }
  ensureDataLayer().push({ event, ...payload })
}

/** Load GTM and report the initial page view. */
export function initAnalytics() {
  if (typeof window === 'undefined') {
    return
  }
  loadGtm()
  track('page_view', {
    page_path: window.location.pathname,
    page_title: document.title,
    page_location: window.location.href,
  })
}
