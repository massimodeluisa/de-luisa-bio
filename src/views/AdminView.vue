<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'

import type { IBio, IBioLink, TFont, TLocale } from '@/content/bio'
import { getBio } from '@/composables/use-bios'
import { type IBioStats, useAdminAuth } from '@/admin/use-admin-auth'
import { FONT_STACK, loadFont } from '@/lib/load-font'
import { avatarSources } from '@/lib/avatar'
import { letterGlyphDataUri } from '@/lib/letter-glyph'
import { generateAvatarSet } from '@/admin/image-to-webp'

const { session, refresh, login, logout, fetchStats, saveBio, uploadMedia } = useAdminAuth()

const tab = ref<'stats' | 'editor'>('stats')
const form = ref<IBio | null>(null)
const stats = ref<IBioStats | null>(null)
const range = ref(30)
const avatarPreview = ref<string | null>(null)

const loginUser = ref('')
const loginPass = ref('')
const loginError = ref('')

const busy = ref(false)
const message = ref('')
const error = ref('')

const FONTS = Object.keys(FONT_STACK) as TFont[]
const LOCALES: TLocale[] = ['en', 'it']

const ICONIFY_URL = 'https://icon-sets.iconify.design/'

const sourceLabel = (s: string) => (s === '$direct' ? 'Direct' : s)

function blankBio(slug: string): IBio {
  return {
    slug,
    name: slug,
    avatar: `/media/${slug}.webp`,
    theme: {
      primary: '#8894a9',
      secondary: '#b68370',
      glyphColor: '#b68370',
      font: 'geist-sans',
      cardRadius: 14,
      avatarRadius: 9999,
      avatarBorderWidth: 1,
      avatarBorderColor: '#b68370',
    },
    content: { en: { eyebrow: '', tagline: '' }, it: { eyebrow: '', tagline: '' } },
    links: [],
    socials: [],
  }
}

function initForm() {
  if (!session.value) {
    return
  }
  const existing = getBio(session.value.slug)
  form.value = structuredClone(existing ?? blankBio(session.value.slug))
  avatarPreview.value = null
}

async function loadStats() {
  error.value = ''
  try {
    stats.value = await fetchStats(range.value)
  } catch (e) {
    stats.value = null
    error.value = String(e)
  }
}

onMounted(async () => {
  if (await refresh()) {
    initForm()
    void loadStats()
  }
})

watch(range, loadStats)

watchEffect(() => {
  if (form.value) {
    void loadFont(form.value.theme.font)
  }
})

async function doLogin() {
  loginError.value = ''
  try {
    await login(loginUser.value, loginPass.value)
    initForm()
    void loadStats()
  } catch (e) {
    loginError.value = String(e)
  }
}

async function onAvatar(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !form.value) {
    return
  }
  busy.value = true
  message.value = ''
  error.value = ''
  try {
    const slug = form.value.slug
    const { derivatives, previewDataUrl } = await generateAvatarSet(file)
    avatarPreview.value = previewDataUrl
    for (const d of derivatives) {
      await uploadMedia(`${slug}-${d.suffix}.webp`, d.base64)
    }
    form.value.avatar = `/media/${slug}`
    message.value = 'Avatar uploaded (multi-size WebP)'
  } catch (e) {
    error.value = String(e)
  } finally {
    busy.value = false
  }
}

function blankLink(): IBioLink {
  return { id: '', label: { en: '', it: '' }, href: '', icon: '' }
}
function addLink() {
  form.value?.links.push(blankLink())
}
function addSocial() {
  form.value?.socials.push(blankLink())
}
function remove(list: IBioLink[], index: number) {
  list.splice(index, 1)
}

const isCircle = computed({
  get: () => (form.value?.theme.avatarRadius ?? 0) >= 999,
  set: (v: boolean) => {
    if (form.value) {
      form.value.theme.avatarRadius = v ? 9999 : 24
    }
  },
})

const previewAvatar = computed(() => {
  if (avatarPreview.value) {
    return avatarPreview.value
  }
  const f = form.value
  if (!f) {
    return ''
  }
  return (
    avatarSources(f.avatar)?.src ??
    letterGlyphDataUri(f.name[0], f.theme.glyphColor ?? f.theme.primary)
  )
})
const previewFont = computed(() => (form.value ? FONT_STACK[form.value.theme.font] : ''))

async function save() {
  if (!form.value) {
    return
  }
  busy.value = true
  message.value = ''
  error.value = ''
  try {
    await saveBio(form.value)
    message.value = 'Saved — the site will rebuild shortly.'
  } catch (e) {
    error.value = String(e)
  } finally {
    busy.value = false
  }
}

const paddedSeries = computed(() => {
  const byDay = new Map((stats.value?.series ?? []).map((s) => [s.day, s.views]))
  const out: { day: string; views: number }[] = []
  const today = new Date()
  for (let i = range.value - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    out.push({ day: key, views: byDay.get(key) ?? 0 })
  }
  return out
})

const maxViews = computed(() => Math.max(1, ...paddedSeries.value.map((s) => s.views)))
</script>

<template lang="pug">
main.flex.min-h-dvh.items-center.justify-center.bg-site-background.text-site-text.p-4(v-if="!session")
  form.w-full.max-w-sm.rounded-2xl.border.border-site-border.bg-site-surface.p-6.flex.flex-col.gap-4(@submit.prevent="doLogin")
    h1.text-lg.font-semibold.text-site-heading De Luisa Bio — Admin
    label.flex.flex-col.gap-1.text-sm
      span.text-site-muted Username
      input.rounded-lg.border.border-site-border.bg-site-background.px-3.py-2(v-model="loginUser" autocomplete="username" required)
    label.flex.flex-col.gap-1.text-sm
      span.text-site-muted Password
      input.rounded-lg.border.border-site-border.bg-site-background.px-3.py-2(v-model="loginPass" type="password" autocomplete="current-password" required)
    p.text-sm.text-red-500(v-if="loginError") {{ loginError }}
    button.rounded-lg.bg-site-heading.py-2.font-medium.text-site-background(type="submit") Sign in

main.min-h-dvh.bg-site-background.text-site-text(v-else)
  header.sticky.top-0.z-10.flex.items-center.justify-between.gap-4.border-b.border-site-border.bg-site-surface.px-4.py-3
    .flex.items-center.gap-4
      strong.text-site-heading {{ session.user }}
      nav.flex.gap-1
        button.rounded-lg.px-3.py-1.text-sm(:class="tab === 'stats' ? 'bg-site-heading text-site-background' : 'text-site-muted'" @click="tab = 'stats'") Stats
        button.rounded-lg.px-3.py-1.text-sm(:class="tab === 'editor' ? 'bg-site-heading text-site-background' : 'text-site-muted'" @click="tab = 'editor'") Editor
    button.text-sm.text-site-muted(class="hover:text-site-heading" @click="logout") Sign out

  section.mx-auto.max-w-3xl.p-4.flex.flex-col.gap-4(v-if="tab === 'stats'")
    .flex.items-center.justify-between
      h2.text-base.font-semibold.text-site-heading Your stats
      select.rounded-lg.border.border-site-border.bg-site-surface.px-2.py-1.text-sm(v-model.number="range")
        option(:value="7") Last 7 days
        option(:value="30") Last 30 days
        option(:value="90") Last 90 days
    p.text-sm.text-red-500(v-if="error") {{ error }}
    .grid.grid-cols-2.gap-3
      .rounded-2xl.border.border-site-border.bg-site-surface.p-4
        .text-xs.uppercase.tracking-wide.text-site-muted Visits
        .text-3xl.font-semibold.text-site-heading {{ stats?.visits ?? '—' }}
      .rounded-2xl.border.border-site-border.bg-site-surface.p-4
        .text-xs.uppercase.tracking-wide.text-site-muted Unique visitors
        .text-3xl.font-semibold.text-site-heading {{ stats?.uniques ?? '—' }}
    .rounded-2xl.border.border-site-border.bg-site-surface.p-4(v-if="stats")
      .text-xs.uppercase.tracking-wide.text-site-muted.mb-3 Views per day
      .flex.items-end.gap-px(style="height:120px")
        .flex-1.rounded-t.bg-site-secondary.transition-all(
          v-for="d in paddedSeries"
          :key="d.day"
          :style="{ height: `${Math.round((d.views / maxViews) * 100)}%`, minHeight: '3px', opacity: d.views ? 1 : 0.25 }"
          :title="`${d.day}: ${d.views}`"
        )
    .rounded-2xl.border.border-site-border.bg-site-surface.p-4
      .text-xs.uppercase.tracking-wide.text-site-muted.mb-2 Clicks by link
      ul.flex.flex-col.gap-1(v-if="stats?.links?.length")
        li.flex.justify-between.text-sm(v-for="l in stats.links" :key="l.link")
          span.text-site-text {{ l.link || '—' }}
          span.font-medium.text-site-heading {{ l.clicks }}
      p.text-sm.text-site-muted(v-else) No link clicks yet.
    .grid.gap-3(class="sm:grid-cols-2")
      .rounded-2xl.border.border-site-border.bg-site-surface.p-4
        .text-xs.uppercase.tracking-wide.text-site-muted.mb-2 Sources
        ul.flex.flex-col.gap-1(v-if="stats?.sources?.length")
          li.flex.justify-between.text-sm(v-for="s in stats.sources" :key="s.source")
            span.text-site-text {{ sourceLabel(s.source) }}
            span.font-medium.text-site-heading {{ s.count }}
        p.text-sm.text-site-muted(v-else) —
      .rounded-2xl.border.border-site-border.bg-site-surface.p-4
        .text-xs.uppercase.tracking-wide.text-site-muted.mb-2 Countries
        ul.flex.flex-col.gap-1(v-if="stats?.countries?.length")
          li.flex.justify-between.text-sm(v-for="c in stats.countries" :key="c.country")
            span.text-site-text {{ c.country }}
            span.font-medium.text-site-heading {{ c.count }}
        p.text-sm.text-site-muted(v-else) —

  section.mx-auto.grid.max-w-5xl.gap-6.p-4(v-else-if="form" class="lg:grid-cols-[1fr_320px]")
    .flex.flex-col.gap-5
      fieldset.rounded-2xl.border.border-site-border.bg-site-surface.p-4.flex.flex-col.gap-3
        legend.px-1.text-sm.font-semibold.text-site-heading Profile
        label.flex.flex-col.gap-1.text-sm
          span.text-site-muted Name
          input.rounded-lg.border.border-site-border.bg-site-background.px-3.py-2(v-model="form.name")
        label.flex.flex-col.gap-1.text-sm
          span.text-site-muted Avatar
          input(type="file" accept="image/*" @change="onAvatar")

      fieldset.rounded-2xl.border.border-site-border.bg-site-surface.p-4.flex.flex-col.gap-3
        legend.px-1.text-sm.font-semibold.text-site-heading Appearance
        .grid.grid-cols-2.gap-3
          label.flex.items-center.justify-between.gap-2.text-sm
            span.text-site-muted Primary
            input(type="color" v-model="form.theme.primary")
          label.flex.items-center.justify-between.gap-2.text-sm
            span.text-site-muted Secondary
            input(type="color" v-model="form.theme.secondary")
          label.flex.items-center.justify-between.gap-2.text-sm
            span.text-site-muted Glyph colour
            input(type="color" v-model="form.theme.glyphColor")
          label.flex.items-center.justify-between.gap-2.text-sm
            span.text-site-muted Avatar border
            input(type="color" v-model="form.theme.avatarBorderColor")
        label.flex.flex-col.gap-1.text-sm
          span.text-site-muted Font
          select.rounded-lg.border.border-site-border.bg-site-background.px-3.py-2(v-model="form.theme.font")
            option(v-for="f in FONTS" :key="f" :value="f") {{ f }}
        label.flex.flex-col.gap-1.text-sm
          span.text-site-muted Card radius — {{ form.theme.cardRadius }}px
          input(type="range" min="0" max="32" v-model.number="form.theme.cardRadius")
        label.flex.items-center.gap-2.text-sm
          input(type="checkbox" v-model="isCircle")
          span.text-site-muted Circular avatar
        label.flex.flex-col.gap-1.text-sm(v-if="!isCircle")
          span.text-site-muted Avatar radius — {{ form.theme.avatarRadius }}px
          input(type="range" min="0" max="80" v-model.number="form.theme.avatarRadius")
        label.flex.flex-col.gap-1.text-sm
          span.text-site-muted Avatar border width — {{ form.theme.avatarBorderWidth }}px
          input(type="range" min="0" max="8" v-model.number="form.theme.avatarBorderWidth")

      fieldset.rounded-2xl.border.border-site-border.bg-site-surface.p-4.flex.flex-col.gap-3
        legend.px-1.text-sm.font-semibold.text-site-heading Content
        .flex.flex-col.gap-3(v-for="loc in LOCALES" :key="loc")
          .text-xs.font-semibold.uppercase.tracking-wide.text-site-muted {{ loc }}
          label.flex.flex-col.gap-1.text-sm
            span.text-site-muted Eyebrow
            input.rounded-lg.border.border-site-border.bg-site-background.px-3.py-2(v-model="form.content[loc].eyebrow")
          label.flex.flex-col.gap-1.text-sm
            span.text-site-muted Tagline
            textarea.rounded-lg.border.border-site-border.bg-site-background.px-3.py-2(v-model="form.content[loc].tagline" rows="2")

      fieldset.rounded-2xl.border.border-site-border.bg-site-surface.p-4.flex.flex-col.gap-3
        legend.px-1.text-sm.font-semibold.text-site-heading Links
        .rounded-lg.border.border-site-border.p-3.flex.flex-col.gap-2(v-for="(l, i) in form.links" :key="`l${i}`")
          .grid.grid-cols-2.gap-2
            input.rounded.border.border-site-border.bg-site-background.px-2.py-1.text-sm(v-model="l.id" placeholder="id")
            .flex.items-center.gap-1
              input.w-full.rounded.border.border-site-border.bg-site-background.px-2.py-1.text-sm(v-model="l.icon" placeholder="icon · mdi:github")
              a.shrink-0.text-base.text-site-secondary.no-underline(:href="ICONIFY_URL" target="_blank" rel="noopener noreferrer" title="Sfoglia le icone (Iconify)") ↗
            input.rounded.border.border-site-border.bg-site-background.px-2.py-1.text-sm(v-model="l.label.en" placeholder="label EN")
            input.rounded.border.border-site-border.bg-site-background.px-2.py-1.text-sm(v-model="l.label.it" placeholder="label IT")
          input.rounded.border.border-site-border.bg-site-background.px-2.py-1.text-sm(v-model="l.href" placeholder="https://…")
          .flex.items-center.justify-between.text-sm
            label.flex.items-center.gap-2
              input(type="checkbox" v-model="l.primary")
              span.text-site-muted Primary
            label.flex.items-center.gap-2
              input(type="checkbox" v-model="l.external")
              span.text-site-muted External
            button.text-red-500(type="button" @click="remove(form.links, i)") Remove
        button.self-start.rounded-lg.border.border-site-border.px-3.py-1.text-sm(type="button" @click="addLink") + Add link

      fieldset.rounded-2xl.border.border-site-border.bg-site-surface.p-4.flex.flex-col.gap-3
        legend.px-1.text-sm.font-semibold.text-site-heading Socials
        .rounded-lg.border.border-site-border.p-3.flex.flex-col.gap-2(v-for="(s, i) in form.socials" :key="`s${i}`")
          .grid.grid-cols-2.gap-2
            input.rounded.border.border-site-border.bg-site-background.px-2.py-1.text-sm(v-model="s.id" placeholder="id")
            .flex.items-center.gap-1
              input.w-full.rounded.border.border-site-border.bg-site-background.px-2.py-1.text-sm(v-model="s.icon" placeholder="icon · mdi:instagram")
              a.shrink-0.text-base.text-site-secondary.no-underline(:href="ICONIFY_URL" target="_blank" rel="noopener noreferrer" title="Sfoglia le icone (Iconify)") ↗
            input.rounded.border.border-site-border.bg-site-background.px-2.py-1.text-sm(v-model="s.label.en" placeholder="label EN")
            input.rounded.border.border-site-border.bg-site-background.px-2.py-1.text-sm(v-model="s.label.it" placeholder="label IT")
          input.rounded.border.border-site-border.bg-site-background.px-2.py-1.text-sm(v-model="s.href" placeholder="https://…")
          .flex.items-center.justify-between.text-sm
            label.flex.items-center.gap-2
              span.text-site-muted Colour
              input(type="color" v-model="s.color")
            button.text-red-500(type="button" @click="remove(form.socials, i)") Remove
        button.self-start.rounded-lg.border.border-site-border.px-3.py-1.text-sm(type="button" @click="addSocial") + Add social

      .sticky.bottom-0.flex.items-center.gap-3.border-t.border-site-border.bg-site-background.py-3
        button.rounded-lg.bg-site-heading.px-4.py-2.font-medium.text-site-background(type="button" :disabled="busy" @click="save") {{ busy ? 'Saving…' : 'Save bio' }}
        span.text-sm.text-green-600(v-if="message") {{ message }}
        span.text-sm.text-red-500(v-if="error") {{ error }}

    aside.flex.flex-col.gap-2
      .text-xs.uppercase.tracking-wide.text-site-muted Live preview
      .rounded-3xl.border.border-site-border.p-5.flex.flex-col.items-center.gap-3.text-center(
        :style="{ background: form.theme.primary + '14', fontFamily: previewFont }"
      )
        img.size-24.object-cover(
          v-if="previewAvatar"
          :src="previewAvatar"
          :style="{ borderRadius: `${form.theme.avatarRadius}px`, border: `${form.theme.avatarBorderWidth}px solid ${form.theme.avatarBorderColor}` }"
        )
        div(:style="{ fontWeight: 600, color: '#1a1a1a' }") {{ form.name }}
        div(:style="{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: form.theme.secondary }") {{ form.content.en.eyebrow }}
        p.text-xs(:style="{ color: '#555', maxWidth: '15rem' }") {{ form.content.en.tagline }}
        .flex.w-full.flex-col.gap-2.pt-2
          .px-3.py-2.text-xs.text-white(
            v-for="(l, i) in form.links"
            :key="`pv${i}`"
            :style="{ background: l.primary ? '#1a1a1a' : form.theme.primary, borderRadius: `${form.theme.cardRadius}px` }"
          ) {{ l.label.en || l.id }}
</template>

<style scoped lang="scss">
input[type='color'] {
  inline-size: 2.25rem;
  block-size: 1.75rem;
  padding: 0;
  border: 1px solid var(--site-border);
  border-radius: 6px;
  background: none;
}
</style>
