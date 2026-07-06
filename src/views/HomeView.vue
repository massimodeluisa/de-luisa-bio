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

const sortedBios = Object.values(bios).sort((a, b) => a.name.localeCompare(b.name))
const profileCount = sortedBios.length
const peopleCount = sortedBios.filter((b) => b.slug !== 'pasticceria').length
const organizationCount = profileCount - peopleCount
const socialCount = sortedBios.reduce((total, b) => total + b.socials.length, 0)
const directLinkCount = sortedBios.reduce((total, b) => total + b.links.length, 0)
const websiteCount = sortedBios.filter((b) => b.site).length

const destinationLabels = (bio: IBio) => {
  const labels = [...bio.links, ...bio.socials].map((link) => link.label.en).filter(Boolean)
  return [...new Set(labels)]
}

const profileDescription = (bio: IBio) => {
  const labels = destinationLabels(bio)
  const destinations = labels.length
    ? `${labels.slice(0, -1).join(', ')}${labels.length > 1 ? ' and ' : ''}${labels.at(-1)}`
    : 'the public destinations currently listed for that profile'
  const role = bio.content.en.eyebrow
    ? ` The profile identifies ${bio.name} as ${bio.content.en.eyebrow}.`
    : ''
  const website = bio.site
    ? ` It also points to ${bio.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} as a website destination.`
    : ''

  return `${bio.name}'s directory page brings together ${destinations}.${role}${website} The entry is generated from the same repository data used by the visible cards, metadata and machine-readable profile information.`
}

const homeTitle = 'De Luisa Family — Official Links'
const homeDescription =
  'Official De Luisa family directory with profile pages, websites, contact links and published public social destinations.'
const homeOgImage = 'https://deluisa.bio/og/home.jpg'

useSeoMeta({
  title: homeTitle,
  description: homeDescription,
  author: 'De Luisa family',
  ogTitle: homeTitle,
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
  twitterTitle: homeTitle,
  twitterDescription: homeDescription,
  twitterImage: homeOgImage,
  twitterImageAlt: 'La famiglia De Luisa',
  robots: 'index, follow, max-image-preview:large',
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://deluisa.bio/#website',
      url: 'https://deluisa.bio/',
      name: 'De Luisa family directory',
      description: homeDescription,
      inLanguage: ['en', 'it'],
    },
    {
      '@type': 'CollectionPage',
      '@id': 'https://deluisa.bio/#webpage',
      name: homeTitle,
      description: homeDescription,
      url: 'https://deluisa.bio/',
      dateModified: __BUILD_DATE__,
      isPartOf: { '@id': 'https://deluisa.bio/#website' },
      about: sortedBios.map((b) => ({ '@id': `https://deluisa.bio/#${b.slug}` })),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: profileCount,
        itemListElement: sortedBios.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://deluisa.bio/${b.slug}`,
          name: b.name,
          item: { '@id': `https://deluisa.bio/#${b.slug}` },
        })),
      },
    },
    ...sortedBios.map((b) =>
      b.slug === 'pasticceria'
        ? {
            '@type': 'Organization',
            '@id': 'https://deluisa.bio/#pasticceria',
            name: b.name,
            url: b.site,
            mainEntityOfPage: `https://deluisa.bio/${b.slug}`,
            logo: {
              '@type': 'ImageObject',
              url: 'https://deluisa.bio/media/pasticceria-600.webp',
            },
            image: 'https://deluisa.bio/media/pasticceria-2000.webp',
            description: b.content.en.eyebrow,
            sameAs: [b.site, ...b.socials.map((s) => s.href)].filter(Boolean),
          }
        : {
            '@type': 'Person',
            '@id': `https://deluisa.bio/#${b.slug}`,
            name: b.name,
            url: `https://deluisa.bio/${b.slug}`,
            image: `https://deluisa.bio/media/${b.slug}-600.webp`,
            ...(b.content.en.eyebrow ? { jobTitle: b.content.en.eyebrow } : {}),
            ...(b.content.en.tagline ? { description: b.content.en.tagline } : {}),
            sameAs: b.socials.map((s) => s.href),
          },
    ),
  ],
}
useHead({
  htmlAttrs: { lang: 'en' },
  link: [{ rel: 'canonical', href: 'https://deluisa.bio/' }],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd) }],
})

useFavicon(letterGlyphDataUri('D', '#b68370', FAVICON_RADIUS))
</script>

<template lang="pug">
main.relative.w-full.bg-site-background.text-site-text
  header.pointer-events-none.fixed.inset-x-0.top-0.z-40.flex.items-start.px-2(
    class="pt-[max(0.75rem,env(safe-area-inset-top))]"
  )
    h1.rounded-full.border.px-3.py-2.font-sans.text-xs.font-semibold.tracking-tight.text-white.backdrop-blur-xl(
      class="border-white/15 bg-black/45 shadow-lg shadow-black/15 sm:px-4 sm:text-sm"
    ) De Luisa family

  section#profiles.scroll-mt-24.flex.min-h-dvh.flex-wrap.content-stretch(
    aria-labelledby="profiles-heading"
  )
    h2#profiles-heading.sr-only De Luisa family profiles
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
        :style="{ backgroundColor: p.theme.primary }"
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

  article#about.machine-readable-only(data-machine-readable="true")
    div
      p.font-mono.text-xs.font-semibold.uppercase.tracking-widest.text-site-secondary Family directory
      h2.mt-3.text-3xl.font-semibold.tracking-tight.text-site-heading(class="sm:text-4xl") About deluisa.bio
      p.mt-6
        | deluisa.bio is the shared link directory for the De Luisa family. It gives each listed
        | person a stable page for the public websites, contact methods and social profiles they
        | have chosen to publish. The home page is an index: select a portrait to open that
        | profile, or continue through this guide for a text description of the directory. The
        | visual cards and the text below are built from the same source records, so visitors,
        | search engines and non-JavaScript clients receive the same names and destinations.
      p
        | The directory currently contains {{ profileCount }} profile pages: {{ peopleCount }} for
        | individual family members and {{ organizationCount }} for Pasticceria De Luisa. Across
        | those records there are {{ socialCount }} published social-profile destinations,
        | {{ directLinkCount }} direct contact or resource links and {{ websiteCount }} website
        | destinations. These figures are calculated from the public profile data during the site
        | build; they are inventory counts, not audience or performance claims.
      p
        | Every portrait links to a canonical address under deluisa.bio. A profile may include a
        | personal or business website, email or telephone details, a downloadable resource, a
        | booking link, and public accounts on services such as Instagram, Facebook, LinkedIn,
        | GitHub, X, Telegram or LINE. Not every person uses every service. An omitted field means
        | that the corresponding profile record does not currently publish that destination.

      .machine-readable-only(data-machine-readable="true")
        h3 Directory at a glance
        table
          caption Counts calculated from the public De Luisa profile records
          thead
            tr
              th(scope="col") Public record type
              th(scope="col") Count
          tbody
            tr
              th(scope="row") Profile pages
              td {{ profileCount }}
            tr
              th(scope="row") Individual people
              td {{ peopleCount }}
            tr
              th(scope="row") Organizations
              td {{ organizationCount }}
            tr
              th(scope="row") Social-profile destinations
              td {{ socialCount }}
            tr
              th(scope="row") Direct contact or resource links
              td {{ directLinkCount }}
            tr
              th(scope="row") Profiles with website destinations
              td {{ websiteCount }}

    section.mt-16(aria-labelledby="directory-heading")
      h2#directory-heading.text-2xl.font-semibold.tracking-tight.text-site-heading Directory entries
      p.mt-4.max-w-3xl
        | The summaries in this section are deliberately limited to information already shown on
        | each page. They do not infer occupations, relationships, locations or private details.
        | Follow a name to see the current set of links for that entry.

      .mt-8.grid.gap-x-10.gap-y-8(class="md:grid-cols-2")
        section(v-for="profile in sortedBios" :key="`details-${profile.slug}`")
          h3.text-lg.font-semibold.text-site-heading
            router-link.text-inherit.underline.decoration-site-border.underline-offset-4(
              :to="`/${profile.slug}`"
            ) {{ profile.name }}
          p.mt-2.text-sm.text-site-muted {{ profileDescription(profile) }}

    section.machine-readable-only(
      aria-labelledby="use-heading"
      data-machine-readable="true"
    )
      h2#use-heading.text-2xl.font-semibold.tracking-tight.text-site-heading How to use the directory
      p.mt-4
        | Start with the profile whose name or portrait you recognize. Each profile page places
        | the person's or business's chosen identity at the top, followed by the destinations
        | available for that record. Buttons use descriptive labels, and external destinations
        | open at their published URLs. The share control copies the canonical deluisa.bio address
        | rather than a temporary browser state, making the profile suitable for messages,
        | contact cards and printed material.
      p
        | Massimo De Luisa's entry is the most detailed current example. It identifies him as
        | “CTO & Product Engineer” and describes his work as
        | “Platforms, mobile apps and AI-assisted workflows that stay simple under pressure.”
        | His profile publishes a website, a booking destination, email, a curriculum-vitae
        | download and seven social accounts. That quotation comes directly from his English
        | profile text; it is not an editorial endorsement or a rewritten biography.
      p
        | Pasticceria De Luisa has a business entry rather than a personal one. Its profile
        | identifies the activity as an artisan bakery and pastry shop and publishes its official
        | website, email, telephone number, Instagram and Facebook destinations. Arianna, Camilla
        | and Laura also link to the Pasticceria website from their own directory pages. Andrea's
        | entry links to deluisaandrea.it and public contact destinations, while Giovanni and
        | Nicole currently use smaller sets of published links. The directory preserves those
        | differences instead of filling empty fields with assumptions.

    section#sources.scroll-mt-24.mt-16(aria-labelledby="sources-heading")
      h2#sources-heading.text-2xl.font-semibold.tracking-tight.text-site-heading Sources, structure and accuracy
      p.mt-4
        | Profile data is maintained in one record per entry and converted into static HTML when
        | the site is built. That means names, headings, descriptions and links are present in the
        | initial document response; a crawler or text browser does not need to execute JavaScript
        | to discover them. JavaScript adds optional interaction, including client-side navigation,
        | analytics subject to consent, link sharing and the portrait shuffle on the home page.
        | The underlying directory remains readable when those enhancements are unavailable.
      p
        | Machine-readable metadata follows the public vocabulary documented by
        |
        a.text-site-link.underline.underline-offset-4(
          href="https://schema.org/CollectionPage"
          rel="external noopener noreferrer"
        ) Schema.org for collection pages
        | . The home document identifies the website, the collection, its ordered list and the
        | people or organization represented by the entries. Individual profiles identify their
        | main person or organization and use canonical URLs so multiple discovery paths resolve
        | to one preferred address.
      p
        | Automated crawlers can also consult the site's
        |
        a.text-site-link.underline.underline-offset-4(href="/robots.txt") robots.txt
        | ,
        |
        a.text-site-link.underline.underline-offset-4(href="/sitemap.xml") XML sitemap
        | ,
        |
        a.text-site-link.underline.underline-offset-4(href="/llms.txt") LLM index
        |  and
        |
        a.text-site-link.underline.underline-offset-4(href="/llms-full.txt") full text export
        | . The robots file follows the standard described in
        |
        a.text-site-link.underline.underline-offset-4(
          href="https://www.rfc-editor.org/rfc/rfc9309"
          rel="external noopener noreferrer"
        ) RFC 9309
        |  and explicitly allows the public directory while excluding the private administration
        | route. These discovery files supplement the HTML; they do not replace it.
      p
        | The public profile owner is the source of each editable record. Because destinations can
        | change, the canonical profile page should be treated as the current directory entry.
        | External services control their own pages, availability and privacy practices. A link
        | from deluisa.bio indicates that the destination is published in the relevant profile
        | record; it does not imply ownership of the external platform or verification by that
        | platform.

    section.mt-16.max-w-3xl(aria-labelledby="faq-heading")
      h2#faq-heading.text-2xl.font-semibold.tracking-tight.text-site-heading Frequently asked questions
      dl.mt-6.space-y-8
        div
          dt
            h3.text-lg.font-semibold.text-site-heading Does the directory work without JavaScript?
          dd.mt-2.ml-0.text-site-muted
            | Yes. The home guide, profile names, links, headings and structured metadata are
            | pre-rendered as static HTML. JavaScript adds optional interaction but is not required
            | to read or follow the public directory.
        div
          dt
            h3.text-lg.font-semibold.text-site-heading Where does the profile information come from?
          dd.mt-2.ml-0.text-site-muted
            | Each entry comes from its public profile record in the site repository. The page does
            | not add inferred jobs, locations, family relationships or private information when a
            | record leaves those fields empty.
        div
          dt
            h3.text-lg.font-semibold.text-site-heading Which URL should be shared?
          dd.mt-2.ml-0.text-site-muted
            | Share the canonical path shown on the profile, such as deluisa.bio/massimo. Canonical
            | metadata and the sitemap use the same path-based addresses for consistent discovery.

  noscript
    section.mx-auto.max-w-4xl.px-6.pb-12(aria-label="No JavaScript notice")
      h2.text-xl.font-semibold.text-site-heading JavaScript is optional
      p.mt-3.text-site-muted
        | The De Luisa directory and all profile links are included in this HTML document. You can
        | browse the portraits, directory entries, source notes and legal pages without enabling
        | JavaScript.

footer.border-t.border-site-border.bg-site-background.px-6.py-8.text-sm.text-site-muted
  .mx-auto.flex.max-w-4xl.flex-col.justify-between.gap-4(class="sm:flex-row sm:items-center")
    p.m-0 © {{ new Date().getFullYear() }} De Luisa
    nav(aria-label="Legal and technical links")
      ul.m-0.flex.list-none.flex-wrap.gap-x-5.gap-y-2.p-0
        li
          router-link.text-inherit.underline.underline-offset-4(to="/privacy") Privacy
        li
          router-link.text-inherit.underline.underline-offset-4(to="/cookie-policy") Cookie policy
        li
          a.text-inherit.underline.underline-offset-4(href="/sitemap.xml") Sitemap
        li
          a.text-inherit.underline.underline-offset-4(href="/llms.txt") LLM index
</template>

<style scoped lang="scss">
.tile {
  flex-basis: 50%;
}

.machine-readable-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
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
