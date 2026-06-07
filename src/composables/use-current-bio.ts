import { computed } from 'vue'
import { useRoute } from 'vue-router'

import type { IBio } from '@/content/bio'
import { DEFAULT_SLUG, getBio } from '@/composables/use-bios'

export function useCurrentBio() {
  const route = useRoute()
  const slug = computed(() => {
    const raw = route.params.slug
    const value = Array.isArray(raw) ? raw[0] : raw
    return value || DEFAULT_SLUG
  })
  const bio = computed<IBio | undefined>(() => getBio(slug.value))
  const notFound = computed(() => bio.value === undefined)
  return { slug, bio, notFound }
}
