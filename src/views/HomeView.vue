<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useHead, useSeoMeta } from '@unhead/vue'
import { useFavicon } from '@vueuse/core'

import type { IBio } from '@/content/bio'
import { bios } from '@/composables/use-bios'
import { track } from '@/composables/use-analytics'
import { avatarSources } from '@/lib/avatar'
import { FAVICON_RADIUS, letterGlyphDataUri } from '@/lib/letter-glyph'

function shuffle(input: IBio[]): IBio[] {
  const a = input.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
  }
  return a
}

const people = ref<IBio[]>(Object.values(bios))
onMounted(() => {
  people.value = shuffle(Object.values(bios))
})

const tileAvatar = (b: IBio) =>
  avatarSources(b.avatar) ?? {
    src: letterGlyphDataUri(b.name[0], b.theme.glyphColor ?? b.theme.primary),
  }

const firstName = (name: string) => name.replace(/ De Luisa$/, '')
const onOpen = (slug: string) => track('home_open_bio', { bio: slug })

const homeDescription = 'La famiglia De Luisa — i nostri link, in un posto solo.'
const homeOgImage = 'https://deluisa.bio/og/home.jpg'

useSeoMeta({
  title: 'De Luisa',
  description: homeDescription,
  ogTitle: 'De Luisa',
  ogDescription: homeDescription,
  ogType: 'website',
  ogSiteName: 'De Luisa',
  ogUrl: 'https://deluisa.bio/',
  ogImage: homeOgImage,
  ogImageWidth: '1200',
  ogImageHeight: '630',
  ogImageAlt: 'La famiglia De Luisa',
  ogImageType: 'image/jpeg',
  twitterCard: 'summary_large_image',
  twitterTitle: 'De Luisa',
  twitterDescription: homeDescription,
  twitterImage: homeOgImage,
  twitterImageAlt: 'La famiglia De Luisa',
  robots: 'index, follow, max-image-preview:large',
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'De Luisa',
  url: 'https://deluisa.bio/',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: Object.values(bios)
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://deluisa.bio/${b.slug}`,
        name: b.name,
      })),
  },
}
useHead({ script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd) }] })

useFavicon(letterGlyphDataUri('D', '#b68370', FAVICON_RADIUS))
</script>

<template lang="pug">
main.relative.min-h-dvh.w-full.bg-site-background
  .flex.min-h-dvh.flex-wrap.content-stretch
    router-link.tile.group.relative.grow.overflow-hidden.no-underline(
      v-for="p in people"
      :key="p.slug"
      :to="`/${p.slug}`"
      :style="{ '--c': p.theme.primary }"
      @click="onOpen(p.slug)"
    )
      img.absolute.inset-0.h-full.w-full.object-cover(
        :src="tileAvatar(p).src"
        :srcset="tileAvatar(p).srcset"
        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
        :alt="p.name"
        loading="lazy"
      )
      .pointer-events-none.absolute.inset-x-0.bottom-0.flex.items-end.p-4.pt-16(
        class="bg-gradient-to-t from-black/60 via-black/15 to-transparent"
      )
        span.text-lg.font-semibold.leading-tight.text-white(class="drop-shadow") {{ firstName(p.name) }}
      .pointer-events-none.absolute.inset-0.opacity-0.transition-opacity(
        aria-hidden="true"
        class="group-hover:opacity-100 hover:opacity-100"
        :style="{ boxShadow: 'inset 0 0 0 4px color-mix(in oklab, var(--c) 70%, transparent)' }"
      )

  .pointer-events-none.absolute.inset-x-0.top-0.z-10.flex.justify-center(
    class="pt-[max(1rem,env(safe-area-inset-top))]"
  )
    .rounded-full.px-4.py-1.backdrop-blur-md(class="bg-black/35")
      span.font-sans.text-sm.font-semibold.tracking-tight.text-white De Luisa
</template>

<style scoped lang="scss">
.tile {
  flex-basis: 50%;
}

@media (min-width: 640px) {
  .tile {
    flex-basis: 33.333%;
  }
}

@media (min-width: 1024px) {
  .tile {
    flex-basis: 25%;
  }
}

@media (min-width: 1280px) {
  .tile {
    flex-basis: 20%;
  }
}
</style>
