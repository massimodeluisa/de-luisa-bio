<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { useFavicon } from '@vueuse/core'
import { useHead, useSeoMeta } from '@unhead/vue'

import BioProfile from '@/components/BioProfile.vue'
import { site, siteOrigin } from '@/content/site'
import { useCurrentBio } from '@/composables/use-current-bio'
import { track } from '@/composables/use-analytics'
import { withBase } from '@/lib/base'
import { bioThemeStyle } from '@/lib/bio-theme'
import { ROBOTS_CONTENT } from '@/lib/demo'
import { DEFAULT_FAVICON, FAVICON_RADIUS, letterGlyphDataUri } from '@/lib/letter-glyph'
import { loadFont } from '@/lib/load-font'
import { ICONS } from '@/generated/icons'
import { useI18n } from '@/i18n'

const { t, locale } = useI18n()
const { slug, bio, notFound } = useCurrentBio()

const content = computed(() => bio.value?.content[locale.value])

const iconUrl = (icon: string | undefined) =>
  icon ? (ICONS[icon] ?? `https://api.iconify.design/${icon}.svg`) : ''

const canonical = computed(() => `${siteOrigin}/${bio.value?.slug ?? ''}`)
const shareUrl = computed(() => canonical.value)
const ogImage = computed(() => `${siteOrigin}/og/${bio.value?.slug ?? 'home'}.png`)

const seoTitle = computed(() => {
  const name = bio.value?.name ?? site.brand
  return content.value?.eyebrow ? `${name} — ${content.value.eyebrow}` : name
})
const seoDescription = computed(
  () =>
    content.value?.tagline ||
    `Official websites, contact links and public social profiles for ${bio.value?.name ?? site.brand}.`,
)
const imageAlt = computed(() => `${bio.value?.name ?? site.brand} — ${site.brand}`)

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  author: () => bio.value?.name,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogType: 'profile',
  ogSiteName: site.brand,
  ogUrl: () => canonical.value,
  ogImage: () => ogImage.value,
  ogImageWidth: '1200',
  ogImageHeight: '630',
  ogImageAlt: () => imageAlt.value,
  ogImageType: 'image/png',
  ogLocale: () => (locale.value === 'it' ? 'it_IT' : 'en_US'),
  ogLocaleAlternate: () => (locale.value === 'it' ? 'en_US' : 'it_IT'),
  twitterCard: 'summary_large_image',
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
  twitterImage: () => ogImage.value,
  twitterImageAlt: () => imageAlt.value,
  robots: ROBOTS_CONTENT,
})

const jsonLd = computed(() => {
  const b = bio.value
  if (!b) {
    return {}
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${canonical.value}#webpage`,
        url: canonical.value,
        name: seoTitle.value,
        description: seoDescription.value,
        dateModified: __BUILD_DATE__,
        isPartOf: { '@id': `${siteOrigin}/#website` },
        mainEntity: { '@id': `${canonical.value}#identity` },
      },
      {
        '@type': b.slug === 'pasticceria' ? 'Organization' : 'Person',
        '@id': `${canonical.value}#identity`,
        name: b.name,
        url: canonical.value,
        image: ogImage.value,
        ...(content.value?.tagline ? { description: content.value.tagline } : {}),
        ...(content.value?.eyebrow && b.slug !== 'pasticceria'
          ? { jobTitle: content.value.eyebrow }
          : {}),
        sameAs:
          b.slug === 'pasticceria'
            ? [b.site, ...b.socials.map((s) => s.href)].filter(Boolean)
            : b.socials.map((s) => s.href),
      },
    ],
  }
})

useHead({
  htmlAttrs: { lang: () => locale.value },
  link: [
    { rel: 'canonical', href: () => canonical.value },
    {
      rel: 'icon',
      href: () => (bio.value ? withBase(`/favicons/${bio.value.slug}.svg`) : DEFAULT_FAVICON),
    },
  ],
  script: [{ type: 'application/ld+json', innerHTML: () => JSON.stringify(jsonLd.value) }],
})
useFavicon(
  computed(() =>
    bio.value
      ? letterGlyphDataUri(
          bio.value.name[0] || site.brand[0] || 'B',
          bio.value.theme.glyphColor ?? bio.value.theme.primary,
          FAVICON_RADIUS,
        )
      : DEFAULT_FAVICON,
  ),
)

watchEffect(() => {
  if (bio.value) {
    void loadFont(bio.value.theme.font)
  }
})

const shareOpen = ref(false)
const copied = ref(false)
const shareInput = ref<HTMLInputElement | null>(null)
const canNativeShare = computed(
  () => typeof navigator !== 'undefined' && typeof navigator.share === 'function',
)

const selectLink = () => {
  const el = shareInput.value
  if (!el) {
    return
  }
  el.focus()
  el.setSelectionRange(0, el.value.length)
}

const copyLink = async () => {
  selectLink()
  try {
    await navigator.clipboard?.writeText(shareUrl.value)
    copied.value = true
  } catch {
    copied.value = false
  }
}

const openShare = () => {
  shareOpen.value = true
  copied.value = false
  track('share_open', { location: 'social', bio: slug.value })
  void nextTick(copyLink)
}

const closeShare = () => {
  shareOpen.value = false
}

const nativeShare = async () => {
  try {
    await navigator.share({ title: bio.value?.name, url: shareUrl.value })
    track('share_native', { location: 'social', bio: slug.value })
  } catch {
    /* dismissed */
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeShare()
  }
}

watch(shareOpen, (open) => {
  if (typeof document === 'undefined') {
    return
  }
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    document.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})
</script>

<template lang="pug">
main.social-page.bio-theme.relative.flex.min-h-dvh.flex-col.bg-site-background(
  v-if="bio && content"
  :style="bioThemeStyle(bio.theme)"
  class="pt-[max(2.75rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]"
)
  button.share-btn.fixed.right-5.z-20.flex.size-11.items-center.justify-center.rounded-full.text-site-heading.transition-transform(
    type="button"
    :aria-label="t('social.shareTitle')"
    class="top-[max(1rem,env(safe-area-inset-top))] active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
    @click="openShare"
  )
    span.size-5.bg-current.social-icon(
      :style="{ maskImage: `url(${iconUrl('mdi:export-variant')})`, WebkitMaskImage: `url(${iconUrl('mdi:export-variant')})` }"
      aria-hidden="true"
    )

  BioProfile(:bio="bio" :locale="locale")

  transition(name="share")
    .fixed.inset-0.z-50.flex.items-center.justify-center.p-4(v-if="shareOpen")
      .absolute.inset-0.backdrop-blur-sm(
        class="bg-[color-mix(in_oklab,var(--site-heading)_45%,transparent)]"
        @click="closeShare"
      )
      .share-sheet.relative.w-full.max-w-sm.rounded-3xl.border.border-site-border.bg-site-surface.p-5.shadow-2xl(
        role="dialog"
        aria-modal="true"
        :aria-label="t('social.shareTitle')"
      )
        .flex.items-start.justify-between.gap-4
          .flex.flex-col.gap-1
            h2.text-base.font-semibold.text-site-heading {{ t('social.shareTitle') }}
            p.text-xs.text-site-muted {{ t('social.shareHint') }}
          button.shrink-0.text-lg.leading-none.text-site-muted.transition-colors(
            type="button"
            :aria-label="t('social.shareClose')"
            class="hover:text-site-heading"
            @click="closeShare"
          ) ✕

        input.mt-4.w-full.rounded-xl.border.border-site-border.bg-site-background.px-3.py-3.font-mono.text-sm.text-site-text(
          ref="shareInput"
          :value="shareUrl"
          readonly
          class="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
          @focus="selectLink"
        )

        .mt-3.flex.gap-2
          button.flex-1.rounded-xl.bg-site-heading.py-3.text-sm.font-medium.text-site-background.transition-all(
            type="button"
            class="active:scale-[0.99] hover:bg-site-secondary hover:text-white"
            @click="copyLink"
          ) {{ copied ? t('social.shareCopied') : t('social.shareCopy') }}
          button.rounded-xl.border.border-site-border.px-4.py-3.text-sm.font-medium.text-site-heading.transition-all(
            v-if="canNativeShare"
            type="button"
            class="active:scale-[0.99] hover:border-site-secondary"
            @click="nativeShare"
          ) {{ t('social.shareNative') }}

main.flex.min-h-dvh.flex-col.items-center.justify-center.gap-3.bg-site-background.text-site-text.px-6.text-center(
  v-else-if="notFound"
)
  h1.text-2xl.font-semibold.text-site-heading 404
  p.text-sm.text-site-muted No bio found for “{{ slug }}”.
  a.text-sm.text-site-secondary.no-underline(:href="withBase('/')") ← {{ site.domain }}
</template>

<style scoped lang="scss">
.social-icon {
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-mode: alpha;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}

.share-btn {
  background: color-mix(in oklab, var(--site-surface) 50%, transparent);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid color-mix(in oklab, var(--site-heading) 12%, transparent);
  box-shadow:
    0 8px 28px -10px color-mix(in oklab, var(--site-heading) 35%, transparent),
    inset 0 1px 0 color-mix(in oklab, white 40%, transparent);
}

.share-enter-active,
.share-leave-active {
  transition: opacity 0.22s ease;

  .share-sheet {
    transition: transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
}

.share-enter-from,
.share-leave-to {
  opacity: 0;

  .share-sheet {
    transform: translateY(16px) scale(0.97);
  }
}
</style>
