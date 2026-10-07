<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import i18next from 'i18next'

import type { IBio, IBioLink, TLocale } from '@/content/bio'
import { copyrightLine, licenseUrl } from '@/content/site'
import { track } from '@/composables/use-analytics'
import { useSiteCardImage } from '@/composables/use-site-card-image'
import { avatarSources } from '@/lib/avatar'
import { letterGlyphDataUri } from '@/lib/letter-glyph'
import { FONT_STACK } from '@/lib/load-font'
import { ICONS } from '@/generated/icons'

const props = withDefaults(
  defineProps<{
    bio: IBio
    locale?: TLocale
    avatarOverride?: string | null
    interactive?: boolean
  }>(),
  {
    locale: 'en',
    avatarOverride: null,
    interactive: true,
  },
)

const LICENSE_URL = licenseUrl
const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary'
const CARD_HOVER = `active:scale-[0.99] hover:border-site-secondary ${FOCUS_RING}`

const year = new Date().getFullYear()

const content = computed(
  () => props.bio.content[props.locale] ?? props.bio.content.en,
)
const label = (link: IBioLink) =>
  link.label[props.locale] ?? link.label.en ?? link.id

const iconUrl = (icon: string | undefined) =>
  icon ? (ICONS[icon] ?? `https://api.iconify.design/${icon}.svg`) : ''

const avatar = computed(() => {
  if (props.avatarOverride) {
    return { src: props.avatarOverride, srcset: undefined as string | undefined }
  }
  return (
    avatarSources(props.bio.avatar) ?? {
      src: letterGlyphDataUri(
        props.bio.name[0] || 'S',
        props.bio.theme.glyphColor ?? props.bio.theme.primary,
      ),
    }
  )
})

const themeStyle = computed(() => {
  const theme = props.bio.theme
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
  () => [props.bio.slug, props.bio.siteCard?.image, props.bio.siteCard?.url],
  () => {
    siteCardImgOk.value = true
  },
)

const siteCardDomain = computed(
  () => props.bio.siteCard?.url.replace(/^https?:\/\//, '') ?? '',
)

const { src: siteCardImageSrc } = useSiteCardImage(
  () => props.bio.siteCard?.url,
  () => props.bio.siteCard?.image,
)

const showSiteCard = computed(
  () =>
    Boolean(props.bio.siteCard?.url) && props.bio.siteCard?.enabled !== false,
)

const siteCardPosition = computed(
  () => props.bio.siteCard?.position ?? 'before',
)

type TLinkBlock = 'site' | 'links' | 'socials'
const linkBlocks = computed((): TLinkBlock[] => {
  const blocks: TLinkBlock[] = ['links', 'socials']
  if (!showSiteCard.value) {
    return blocks
  }
  if (siteCardPosition.value === 'after') {
    return [...blocks, 'site']
  }
  return ['site', ...blocks]
})

const isSplitLayout = computed(() => (props.bio.layout?.columns ?? 2) === 2)

const mainGridClass = computed(() =>
  isSplitLayout.value
    ? 'lg:w-auto lg:max-w-none lg:grid lg:grid-cols-[23rem_26rem] lg:items-center lg:gap-12'
    : '',
)

const quickSocials = computed(() =>
  props.bio.socials.filter((s) => s.quick !== false),
)

const siteCardLabel = computed(() => i18next.t('social.siteCard', { lng: props.locale }))
const licenseAriaLabel = computed(() =>
  i18next.t('footer.licenseAriaLabel', { lng: props.locale }),
)

const interactiveClass = (classes: string) =>
  props.interactive ? classes : 'pointer-events-none'

const linkClass = (link: IBioLink) => {
  const base = link.primary
    ? 'border-transparent bg-site-heading text-site-background'
    : 'border-site-border bg-site-surface/70 text-site-heading'
  const hover = link.primary
    ? 'hover:bg-site-secondary hover:text-white'
    : 'hover:border-site-secondary'
  return `${base} ${interactiveClass(`active:scale-[0.99] ${hover} ${FOCUS_RING}`)}`
}

const onClick = (link: { id: string; href: string }) => {
  if (!props.interactive) {
    return
  }
  track('link_click', {
    link_id: link.id,
    link_url: link.href,
    location: 'social',
    bio: props.bio.slug,
  })
}
</script>

<template lang="pug">
.bio-profile.relative.flex.flex-col.items-center.overflow-x-clip.bg-site-background.text-site-text.px-3(
  :style="themeStyle"
)
  .bio-profile__glow.pointer-events-none.absolute.inset-0.-z-10(aria-hidden="true")

  .w-full.max-w-sm.flex-1.flex.flex-col.items-center.justify-center.gap-6.py-8(
    :class="mainGridClass"
  )
    .flex.flex-col.items-center.gap-6.text-center(class="lg:gap-7")
      .social-rise.flex.flex-col.items-center.gap-2
        component.transition-transform(
          :is="interactive && bio.site ? 'a' : 'div'"
          :href="interactive && bio.site ? bio.site : undefined"
          :target="interactive && bio.site ? '_blank' : undefined"
          :rel="interactive && bio.site ? 'noopener noreferrer' : undefined"
          :aria-label="interactive ? bio.site : undefined"
          :class="interactive ? 'active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-secondary' : undefined"
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
            :is="interactive && bio.site ? 'a' : 'div'"
            :href="interactive && bio.site ? bio.site : undefined"
            :target="interactive && bio.site ? '_blank' : undefined"
            :rel="interactive && bio.site ? 'noopener noreferrer' : undefined"
            class="no-underline"
            @click="bio.site && onClick({ id: 'name', href: bio.site })"
          )
            h1.font-sans.text-2xl.font-semibold.leading-none.text-site-heading(class="tracking-[-0.02em] lg:text-[2rem]") {{ bio.name }}
          p.font-mono.font-semibold.uppercase.text-site-secondary(class="text-[11px] tracking-[0.22em]") {{ content.eyebrow }}
        p.text-sm.leading-relaxed.text-pretty.text-site-muted(class="max-w-[19rem]") {{ content.tagline }}

      nav(v-if="quickSocials.length" aria-label="Social profiles")
        h2.sr-only Social profiles
        ul.social-rise.m-0.flex.list-none.flex-wrap.items-center.justify-center.gap-2.p-0(
          class="[animation-delay:0.08s]"
        )
          li(v-for="s in quickSocials" :key="s.id")
            a.flex.size-11.items-center.justify-center.rounded-full.bg-white.shadow-sm.ring-1.transition-all(
              :href="interactive ? s.href : undefined"
              :target="s.external && interactive ? '_blank' : undefined"
              rel="me noopener noreferrer"
              :aria-label="label(s)"
              class="ring-black/5"
              :class="interactiveClass(`active:scale-90 hover:-translate-y-0.5 hover:shadow-md ${FOCUS_RING}`)"
              @click="onClick(s)"
            )
              span.social-icon(
                :style="{ maskImage: `url(${iconUrl(s.icon)})`, WebkitMaskImage: `url(${iconUrl(s.icon)})`, backgroundColor: s.color, width: s.iconSize || '1.5rem', height: s.iconSize || '1.5rem' }"
                aria-hidden="true"
              )

    nav.social-rise.flex.w-full.flex-col.gap-3(
      aria-label="Profile links"
      class="[animation-delay:0.16s]"
    )
      h2.sr-only Links and contact details
      template(v-for="block in linkBlocks" :key="block")
        a.group.block.w-full.overflow-hidden.border.border-site-border.no-underline.transition-all(
          v-if="block === 'site' && bio.siteCard"
          :href="interactive ? bio.siteCard.url : undefined"
          :style="cardStyle"
          :target="interactive ? '_blank' : undefined"
          rel="noopener noreferrer"
          class="bg-site-surface/70"
          :class="interactiveClass(CARD_HOVER)"
          @click="onClick({ id: 'website_card', href: bio.siteCard.url })"
        )
          img.block.w-full.object-cover(
            v-if="siteCardImgOk && siteCardImageSrc"
            :src="siteCardImageSrc"
            :alt="siteCardDomain + ' preview'"
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
              span.text-xs.text-site-muted {{ siteCardLabel }}
            span.text-base.opacity-40.transition-transform(
              aria-hidden="true"
              :class="{ 'group-hover:translate-x-0.5': interactive }"
            ) →

        template(v-else-if="block === 'links'")
          a.group.flex.h-14.w-full.items-center.gap-3.border.px-4.no-underline.transition-all(
            v-for="link in bio.links"
            :key="link.id"
            :href="interactive ? link.href : undefined"
            :style="cardStyle"
            :target="link.external && interactive ? '_blank' : undefined"
            :rel="link.external ? 'noopener noreferrer' : undefined"
            :download="link.download ? '' : undefined"
            :class="linkClass(link)"
            @click="onClick(link)"
          )
            span.size-5.shrink-0.bg-current.social-icon(
              v-if="link.icon"
              :style="{ maskImage: `url(${iconUrl(link.icon)})`, WebkitMaskImage: `url(${iconUrl(link.icon)})` }"
              aria-hidden="true"
            )
            span.flex-1.text-center.text-sm.font-medium {{ label(link) }}
            span.text-base.opacity-40.transition-transform(
              aria-hidden="true"
              :class="{ 'group-hover:translate-x-0.5': interactive }"
            ) →

        template(v-else-if="block === 'socials'")
          a.group.flex.h-14.w-full.items-center.gap-3.border.border-site-border.px-4.text-site-heading.no-underline.transition-all(
            v-for="s in bio.socials"
            :key="`btn-${s.id}`"
            :href="interactive ? s.href : undefined"
            :style="cardStyle"
            :target="interactive ? '_blank' : undefined"
            rel="me noopener noreferrer"
            class="bg-site-surface/70"
            :class="interactiveClass(CARD_HOVER)"
            @click="onClick(s)"
          )
            span.size-5.shrink-0.social-icon(
              :class="s.mono ? 'bg-current' : ''"
              :style="{ maskImage: `url(${iconUrl(s.icon)})`, WebkitMaskImage: `url(${iconUrl(s.icon)})`, backgroundColor: s.mono ? undefined : s.color }"
              aria-hidden="true"
            )
            span.flex-1.text-center.text-sm.font-medium {{ label(s) }}
            span.text-base.opacity-40.transition-transform(
              aria-hidden="true"
              :class="{ 'group-hover:translate-x-0.5': interactive }"
            ) →

  footer.social-rise.pt-6.pb-8.font-mono.text-site-muted(
    class="text-[10px] tracking-[0.2em] [animation-delay:0.28s]"
  )
    a.no-underline.text-inherit.transition-colors(
      v-if="interactive"
      :href="LICENSE_URL"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="licenseAriaLabel"
      class="hover:text-site-heading"
      @click="onClick({ id: 'license', href: LICENSE_URL })"
    ) {{ copyrightLine(year) }}
    span(v-else) {{ copyrightLine(year) }}
</template>

<style scoped lang="scss">
.bio-profile__glow {
  background: radial-gradient(
    62% 42% at 50% 0%,
    color-mix(in oklab, var(--site-secondary) 13%, transparent),
    transparent 72%
  );
}

.social-icon {
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-mode: alpha;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
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
