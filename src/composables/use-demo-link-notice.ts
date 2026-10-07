import { onBeforeUnmount, onMounted } from 'vue'

const HIDE_AFTER_MS = 2600
const REGION_CLASS =
  'pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4'
const PILL_CLASS =
  'rounded-full bg-site-heading px-4 py-2 text-center text-xs font-medium text-site-background shadow-lg'

function isPlaceholderHref(href: string): boolean {
  if (/^(mailto|tel):/i.test(href)) {
    return true
  }
  try {
    const url = new URL(href)
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.endsWith('.example')
  } catch {
    return false
  }
}

/**
 * Example bios link to made-up `.example` hosts, emails and phone numbers. The live region is
 * created on the client so the prerendered HTML matches non-demo builds.
 */
export function useDemoLinkNotice(message: () => string) {
  let region: HTMLDivElement | null = null
  let hideTimer: number | undefined

  const hide = () => region?.replaceChildren()

  onMounted(() => {
    region = document.createElement('div')
    region.className = REGION_CLASS
    region.setAttribute('role', 'status')
    region.setAttribute('aria-live', 'polite')
    region.setAttribute('aria-atomic', 'true')
    document.body.append(region)
  })

  onBeforeUnmount(() => {
    window.clearTimeout(hideTimer)
    region?.remove()
    region = null
  })

  return (event: MouseEvent, href: string): void => {
    if (!isPlaceholderHref(href)) {
      return
    }
    event.preventDefault()
    if (!region) {
      return
    }
    window.clearTimeout(hideTimer)
    hide()
    const pill = document.createElement('span')
    pill.className = PILL_CLASS
    pill.textContent = message()
    // Appending on the next frame makes screen readers announce a repeated message again.
    window.requestAnimationFrame(() => region?.append(pill))
    hideTimer = window.setTimeout(hide, HIDE_AFTER_MS)
  }
}
