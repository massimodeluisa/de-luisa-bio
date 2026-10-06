import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

/**
 * Resolve the site-card preview image: explicit `image` wins; otherwise
 * fetch the page's Open Graph image (via Microlink metadata API).
 */
export function useSiteCardImage(
  url: MaybeRefOrGetter<string | undefined>,
  explicitImage: MaybeRefOrGetter<string | undefined>,
) {
  const src = ref('')
  const loading = ref(false)

  watch(
    () => [toValue(url), toValue(explicitImage)] as const,
    async ([pageUrl, explicit], _prev, onCleanup) => {
      const trimmed = explicit?.trim()
      if (trimmed) {
        src.value = trimmed
        loading.value = false
        return
      }

      src.value = ''
      if (!pageUrl?.trim()) {
        loading.value = false
        return
      }

      const ctrl = new AbortController()
      onCleanup(() => ctrl.abort())
      loading.value = true
      try {
        const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(pageUrl.trim())}`
        const res = await fetch(endpoint, { signal: ctrl.signal })
        if (!res.ok) {
          return
        }
        const body = (await res.json()) as {
          status?: string
          data?: { image?: { url?: string } | string }
        }
        if (ctrl.signal.aborted || body.status !== 'success') {
          return
        }
        const image = body.data?.image
        const imageUrl = typeof image === 'string' ? image : image?.url
        if (imageUrl) {
          src.value = imageUrl
        }
      } catch {
        // abort / network — leave src empty
      } finally {
        if (!ctrl.signal.aborted) {
          loading.value = false
        }
      }
    },
    { immediate: true },
  )

  return { src, loading }
}
