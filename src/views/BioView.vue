<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { useFavicon } from '@vueuse/core'
import { useHead, useSeoMeta } from '@unhead/vue'

import type { IBioLink } from '@/content/bio'
import { useCurrentBio } from '@/composables/use-current-bio'
import { track } from '@/composables/use-analytics'
import { avatarSources } from '@/lib/avatar'
import { FAVICON_RADIUS, letterGlyphDataUri } from '@/lib/letter-glyph'
import { FONT_STACK, loadFont } from '@/lib/load-font'
import { ICONS } from '@/generated/icons'
import { useI18n } from '@/i18n'

const SITE_ORIGIN = 'https://deluisa.bio'
const LICENSE_URL = 'https://github.com/massimodeluisa/de-luisa-bio/blob/main/LICENSE.md'

const { t, locale } = useI18n()
const { slug, bio, notFound } = useCurrentBio()

const content = computed(() => bio.value?.content[locale.value])
const label = (link: IBioLink) => link.label[locale.value] ?? link.label.en
const year = new Date().getFullYear()

const iconUrl = (icon: string | undefined) =>
  icon ? (ICONS[icon] ?? `https://api.iconify.design/${icon}.svg`) : ''

const canonical = computed(() => `${SITE_ORIGIN}/${bio.value?.slug ?? ''}`)
const shareUrl = computed(() => canonical.value)
const ogImage = computed(() => `${SITE_ORIGIN}/og/${bio.value?.slug ?? 'massimo'}.png`)

const avatar = computed(() => {
  const b = bio.value
  if (!b) {
    return { src: '' }
  }
  return (
    avatarSources(b.avatar) ?? {
      src: letterGlyphDataUri(b.name[0], b.theme.glyphColor ?? b.theme.primary),
    }
  )
})

const themeStyle = computed(() => {
  const theme = bio.value?.theme
  if (!theme) {
    return {}
  }
  return {
    '--site-primary': theme.primary,
    '--site-secondary': theme.secondary,
    '--bio-card-radius': `${theme.cardRadius}px`,
    '--bio-avatar-radius': `${theme.avatarRadius}px`,
    '--bio-avatar-border': `${theme.avatarBorderWidth}px solid ${theme.avatarBorderColor}`,
    fontFamily: FONT_STACK[theme.font],
  } as Record<string, string>
})
const cardStyle = { borderRadius: 'var(--bio-card-radius)' }

const siteCardImgOk = ref(true)
watch(
  () => bio.value?.slug,
  () => {
    siteCardImgOk.value = true
  },
)

const seoTitle = computed(() => {
  const name = bio.value?.name ?? 'De Luisa'
  return content.value?.eyebrow ? `${name} — ${content.value.eyebrow}` : name
})
const seoDescription = computed(
  () => content.value?.tagline || `${bio.value?.name ?? 'De Luisa'} — links`,
)
const imageAlt = computed(() => `${bio.value?.name ?? 'De Luisa'} — De Luisa`)
const siteCardDomain = computed(() => bio.value?.siteCard?.url.replace(/^https?:\/\//, '') ?? '')

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  author: () => bio.value?.name,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogType: 'profile',
  ogSiteName: 'De Luisa',
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
  robots: 'index, follow, max-image-preview:large',
})

const jsonLd = computed(() => {
  const b = bio.value
  if (!b) {
    return {}
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: b.name,
    url: canonical.value,
    image: ogImage.value,
    ...(content.value?.tagline ? { description: content.value.tagline } : {}),
    ...(content.value?.eyebrow ? { jobTitle: content.value.eyebrow } : {}),
    sameAs: b.socials.map((s) => s.href),
  }
})

useHead({
  htmlAttrs: { lang: () => locale.value },
  link: [
    { rel: 'canonical', href: () => canonical.value },
    { rel: 'icon', href: () => `/favicons/${bio.value?.slug ?? 'massimo'}.svg` },
  ],
  script: [{ type: 'application/ld+json', innerHTML: () => JSON.stringify(jsonLd.value) }],
})
useFavicon(
  computed(() =>
    bio.value
      ? letterGlyphDataUri(
          bio.value.name[0],
          bio.value.theme.glyphColor ?? bio.value.theme.primary,
          FAVICON_RADIUS,
        )
      : null,
  ),
)

watchEffect(() => {
  if (bio.value) {
    void loadFont(bio.value.theme.font)
  }
})

const onClick = (link: { id: string; href: string }) =>
  track('link_click', {
    link_id: link.id,
    link_url: link.href,
    location: 'social',
    bio: slug.value,
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
main.social-page.relative.flex.min-h-dvh.flex-col.items-center.overflow-x-clip.bg-site-background.text-site-text.px-3(
  v-if="bio && content"
  :style="themeStyle"
  class="pt-[max(2.75rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]"
)
  .pointer-events-none.absolute.inset-0(
    aria-hidden="true"
    class="-z-10 bg-[radial-gradient(62%_42%_at_50%_0%,color-mix(in_oklab,var(--site-secondary)_13%,transparent),transparent_72%)]"
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

  .w-full.max-w-sm.flex-1.flex.flex-col.items-center.justify-center.gap-6(
    class="lg:w-auto lg:max-w-none lg:grid lg:grid-cols-[23rem_26rem] lg:items-center lg:gap-12"
  )
    .flex.flex-col.items-center.gap-6.text-center(class="lg:gap-7")
      .social-rise.flex.flex-col.items-center.gap-2
        component.transition-transform(
          :is="bio.site ? 'a' : 'div'"
          :href="bio.site || undefined"
          :target="bio.site ? '_blank' : undefined"
          :rel="bio.site ? 'noopener noreferrer' : undefined"
          :aria-label="bio.site"
          class="active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-secondary"
          @click="bio.site && onClick({ id: 'avatar', href: bio.site })"
        )
          img.size-52.object-cover.bg-site-primary.shadow-sm(
            :src="avatar.src"
            :srcset="avatar.srcset"
            sizes="(min-width: 1024px) 240px, 208px"
            width="240"
            height="240"
            :alt="`${bio.name} — avatar`"
            :style="{ borderRadius: 'var(--bio-avatar-radius)', border: 'var(--bio-avatar-border)' }"
            class="lg:size-60"
            fetchpriority="high"
            decoding="async"
          )
        .flex.flex-col.items-center.gap-1
          component(
            :is="bio.site ? 'a' : 'div'"
            :href="bio.site || undefined"
            :target="bio.site ? '_blank' : undefined"
            :rel="bio.site ? 'noopener noreferrer' : undefined"
            class="no-underline"
            @click="bio.site && onClick({ id: 'name', href: bio.site })"
          )
            h1.font-sans.text-2xl.font-semibold.leading-none.text-site-heading(class="tracking-[-0.02em] lg:text-[2rem]") {{ bio.name }}
          p.font-mono.font-semibold.uppercase.text-site-secondary(class="text-[11px] tracking-[0.22em]") {{ content.eyebrow }}
        p.text-sm.leading-relaxed.text-pretty.text-site-muted(class="max-w-[19rem]") {{ content.tagline }}

      ul.social-rise.m-0.flex.list-none.flex-wrap.items-center.justify-center.gap-2.p-0(
        class="[animation-delay:0.08s]"
      )
        li(v-for="s in bio.socials" :key="s.id")
          a.flex.size-11.items-center.justify-center.rounded-full.bg-white.shadow-sm.ring-1.transition-all(
            :href="s.href"
            :target="s.external ? '_blank' : undefined"
            rel="me noopener noreferrer"
            :aria-label="label(s)"
            class="ring-black/5 active:scale-90 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
            @click="onClick(s)"
          )
            span.social-icon(
              :style="{ maskImage: `url(${iconUrl(s.icon)})`, WebkitMaskImage: `url(${iconUrl(s.icon)})`, backgroundColor: s.color, width: s.iconSize, height: s.iconSize }"
              aria-hidden="true"
            )

    .social-rise.flex.w-full.flex-col.gap-3(class="[animation-delay:0.16s]")
      a.group.block.w-full.overflow-hidden.border.border-site-border.no-underline.transition-all(
        v-if="bio.siteCard"
        :href="bio.siteCard.url"
        :style="cardStyle"
        target="_blank"
        rel="noopener noreferrer"
        class="bg-site-surface/70 active:scale-[0.99] hover:border-site-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
        @click="onClick({ id: 'website_card', href: bio.siteCard.url })"
      )
        img.block.w-full.object-cover(
          v-if="siteCardImgOk"
          :src="bio.siteCard.image"
          :alt="`${siteCardDomain} preview`"
          width="1200"
          height="540"
          loading="lazy"
          decoding="async"
          class="aspect-[1200/540]"
          @error="siteCardImgOk = false"
        )
        .flex.items-center.justify-between.gap-3.px-4.py-3
          span.flex.flex-col
            span.text-sm.font-semibold.text-site-heading {{ siteCardDomain }}
            span.text-xs.text-site-muted {{ t('social.siteCard') }}
          span.text-base.opacity-40.transition-transform(aria-hidden="true" class="group-hover:translate-x-0.5") →

      a.group.flex.h-14.w-full.items-center.gap-3.border.px-4.no-underline.transition-all(
        v-for="link in bio.links"
        :key="link.id"
        :href="link.href"
        :style="cardStyle"
        :target="link.external ? '_blank' : undefined"
        :rel="link.external ? 'noopener noreferrer' : undefined"
        :download="link.download ? '' : undefined"
        :class="link.primary ? 'border-transparent bg-site-heading text-site-background hover:bg-site-secondary hover:text-white' : 'border-site-border bg-site-surface/70 text-site-heading hover:border-site-secondary'"
        class="active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
        @click="onClick(link)"
      )
        span.size-5.shrink-0.bg-current.social-icon(
          :style="{ maskImage: `url(${iconUrl(link.icon)})`, WebkitMaskImage: `url(${iconUrl(link.icon)})` }"
          aria-hidden="true"
        )
        span.flex-1.text-center.text-sm.font-medium {{ label(link) }}
        span.text-base.opacity-40.transition-transform(aria-hidden="true" class="group-hover:translate-x-0.5") →

      a.group.flex.h-14.w-full.items-center.gap-3.border.border-site-border.px-4.text-site-heading.no-underline.transition-all(
        v-for="s in bio.socials"
        :key="`btn-${s.id}`"
        :href="s.href"
        :style="cardStyle"
        target="_blank"
        rel="me noopener noreferrer"
        class="bg-site-surface/70 active:scale-[0.99] hover:border-site-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
        @click="onClick(s)"
      )
        span.size-5.shrink-0.social-icon(
          :class="s.mono ? 'bg-current' : ''"
          :style="{ maskImage: `url(${iconUrl(s.icon)})`, WebkitMaskImage: `url(${iconUrl(s.icon)})`, backgroundColor: s.mono ? undefined : s.color }"
          aria-hidden="true"
        )
        span.flex-1.text-center.text-sm.font-medium {{ label(s) }}
        span.text-base.opacity-40.transition-transform(aria-hidden="true" class="group-hover:translate-x-0.5") →

  a.social-rise.pt-8.font-mono.no-underline.text-site-muted.transition-colors(
    :href="LICENSE_URL"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="t('footer.licenseAriaLabel')"
    class="text-[10px] tracking-[0.2em] hover:text-site-heading [animation-delay:0.28s]"
    @click="onClick({ id: 'license', href: LICENSE_URL })"
  ) © {{ year }} {{ bio.name }}

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
  a.text-sm.text-site-secondary.no-underline(href="/") ← deluisa.bio
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

@media (prefers-reduced-motion: no-preference) {
  .social-rise {
    animation: social-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }
}

@keyframes social-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
