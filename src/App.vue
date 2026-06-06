<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import avatar from '@/assets/me-squared-clean.webp'
import { track } from '@/composables/use-analytics'
import { useI18n } from '@/i18n'

interface ILink {
  id: string
  labelKey: string
  href: string
  icon: string
  iconSize?: string
  color?: string
  mono?: boolean
  primary?: boolean
  external?: boolean
  download?: boolean
}

const { t } = useI18n()

const SITE_URL = 'https://deluisa.me'
const SHARE_URL = 'https://deluisa.me/links'

const links: ILink[] = [
  {
    id: 'book',
    labelKey: 'social.book',
    href: 'https://www.cal.eu/massimodeluisa/30min',
    icon: 'mdi:calendar-check-outline',
    primary: true,
    external: true,
  },
  { id: 'email', labelKey: 'social.email', href: 'mailto:massimodeluisa@me.com', icon: 'mdi:email-outline' },
  { id: 'cv', labelKey: 'social.cv', href: 'https://deluisa.me/cv.pdf', icon: 'mdi:file-document-outline', external: true },
]

const socials: ILink[] = [
  { id: 'github', labelKey: 'contact.links.github', href: 'https://github.com/massimodeluisa', icon: 'mdi:github', color: '#181717', mono: true, external: true, iconSize: '2rem' },
  { id: 'linkedin', labelKey: 'contact.links.linkedin', href: 'https://www.linkedin.com/in/massimodeluisa', icon: 'mdi:linkedin', color: '#0A66C2', external: true, iconSize: '2rem' },
  { id: 'x', labelKey: 'contact.links.x', href: 'https://x.com/massimodeluisa', icon: 'simple-icons:x', color: '#000000', mono: true, external: true, iconSize: '1.5rem' },
  { id: 'telegram', labelKey: 'contact.links.telegram', href: 'https://t.me/massimodeluisa', icon: 'fa-brands:telegram', color: '#26A5E4', external: true, iconSize: '2rem' },
  { id: 'line', labelKey: 'contact.links.line', href: 'https://line.me/ti/p/KrsSKLsYE9', icon: 'fa-brands:line', color: '#06C755', external: true, iconSize: '2rem' },
  { id: 'instagram', labelKey: 'contact.links.instagram', href: 'https://www.instagram.com/massimodeluisa', icon: 'mdi:instagram', color: '#E4405F', external: true, iconSize: '2rem' },
  { id: 'facebook', labelKey: 'contact.links.facebook', href: 'https://facebook.com/massimodeluisa', icon: 'mdi:facebook', color: '#1877F2', external: true, iconSize: '2rem' },
]

const iconUrl = (icon: string) => `https://api.iconify.design/${icon}.svg`

const ogImage = ref('https://deluisa.me/og/home.png')
const onOgError = () => {
  ogImage.value = avatar
}

const onClick = (link: { id: string; href: string }) =>
  track('link_click', { link_id: link.id, link_url: link.href, location: 'social' })

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
    await navigator.clipboard?.writeText(SHARE_URL)
    copied.value = true
  } catch {
    copied.value = false
  }
}

const openShare = () => {
  shareOpen.value = true
  copied.value = false
  track('share_open', { location: 'social' })
  void nextTick(copyLink)
}

const closeShare = () => {
  shareOpen.value = false
}

const nativeShare = async () => {
  try {
    await navigator.share({ title: 'Massimo De Luisa', url: SHARE_URL })
    track('share_native', { location: 'social' })
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

  .flex.w-full.max-w-sm.flex-1.flex-col.items-center.justify-center.gap-6
    .social-rise.flex.flex-col.items-center.gap-2.text-center
      a.rounded-full.transition-transform(
        :href="SITE_URL"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="deluisa.me"
        class="active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-secondary"
        @click="onClick({ id: 'avatar', href: SITE_URL })"
      )
        img.size-52.rounded-full.object-cover.bg-site-primary.shadow-sm.ring-1.ring-site-border(
          :src="avatar"
          alt="Massimo De Luisa"
          fetchpriority="high"
        )
      .flex.flex-col.items-center.gap-1
        a.no-underline(
          :href="SITE_URL"
          target="_blank"
          rel="noopener noreferrer"
          @click="onClick({ id: 'name', href: SITE_URL })"
        )
          h1.font-sans.text-2xl.font-semibold.leading-none.text-site-heading(class="tracking-[-0.02em]") Massimo De Luisa
        p.font-mono.font-semibold.uppercase.text-site-secondary(class="text-[11px] tracking-[0.22em]") {{ t('social.eyebrow') }}
      p.text-sm.leading-relaxed.text-pretty.text-site-muted(class="max-w-[19rem]") {{ t('social.tagline') }}

    ul.social-rise.m-0.flex.list-none.flex-wrap.items-center.justify-center.gap-2.p-0(
      class="[animation-delay:0.08s]"
    )
      li(v-for="s in socials" :key="s.id")
        a.flex.size-11.items-center.justify-center.rounded-full.bg-white.shadow-sm.ring-1.transition-all(
          :href="s.href"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t(s.labelKey)"
          class="ring-black/5 active:scale-90 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
          @click="onClick(s)"
        )
          span.social-icon(
            :style="{ maskImage: `url(${iconUrl(s.icon)})`, WebkitMaskImage: `url(${iconUrl(s.icon)})`, backgroundColor: s.color, width: s.iconSize, height: s.iconSize }"
            aria-hidden="true"
          )

    .social-rise.flex.w-full.flex-col.gap-3(class="[animation-delay:0.16s]")
      a.group.block.w-full.overflow-hidden.rounded-2xl.border.border-site-border.no-underline.transition-all(
        :href="SITE_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="bg-site-surface/70 active:scale-[0.99] hover:border-site-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
        @click="onClick({ id: 'website_card', href: SITE_URL })"
      )
        img.block.w-full.object-cover(
          :src="ogImage"
          alt="deluisa.me"
          loading="lazy"
          class="aspect-[1200/540]"
          @error="onOgError"
        )
        .flex.items-center.justify-between.gap-3.px-4.py-3
          span.flex.flex-col
            span.text-sm.font-semibold.text-site-heading deluisa.me
            span.text-xs.text-site-muted {{ t('social.siteCard') }}
          span.text-base.opacity-40.transition-transform(aria-hidden="true" class="group-hover:translate-x-0.5") →

      a.group.flex.h-14.w-full.items-center.gap-3.rounded-2xl.border.px-4.no-underline.transition-all(
        v-for="link in links"
        :key="link.id"
        :href="link.href"
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
        span.flex-1.text-center.text-sm.font-medium {{ t(link.labelKey) }}
        span.text-base.opacity-40.transition-transform(aria-hidden="true" class="group-hover:translate-x-0.5") →

      a.group.flex.h-14.w-full.items-center.gap-3.rounded-2xl.border.border-site-border.px-4.text-site-heading.no-underline.transition-all(
        v-for="s in socials"
        :key="`btn-${s.id}`"
        :href="s.href"
        target="_blank"
        rel="noopener noreferrer"
        class="bg-site-surface/70 active:scale-[0.99] hover:border-site-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
        @click="onClick(s)"
      )
        span.size-5.shrink-0.social-icon(
          :class="s.mono ? 'bg-current' : ''"
          :style="{ maskImage: `url(${iconUrl(s.icon)})`, WebkitMaskImage: `url(${iconUrl(s.icon)})`, backgroundColor: s.mono ? undefined : s.color }"
          aria-hidden="true"
        )
        span.flex-1.text-center.text-sm.font-medium {{ t(s.labelKey) }}
        span.text-base.opacity-40.transition-transform(aria-hidden="true" class="group-hover:translate-x-0.5") →

  a.social-rise.pt-8.font-mono.no-underline.opacity-70.text-site-muted.transition-opacity(
    href="https://github.com/massimodeluisa/website/blob/main/LICENSE.md"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="t('footer.licenseAriaLabel')"
    class="text-[10px] tracking-[0.2em] hover:opacity-100 [animation-delay:0.28s]"
    @click="onClick({ id: 'license', href: 'https://github.com/massimodeluisa/website/blob/main/LICENSE.md' })"
  ) {{ t('footer.copyright') }}

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
          :value="SHARE_URL"
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
