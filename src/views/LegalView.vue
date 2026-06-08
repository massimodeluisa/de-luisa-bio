<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useHead } from '@unhead/vue'

import { showCookiePreferences } from '@/composables/use-consent'
import { detectLegalLocale, legalContent } from '@/content/legal'
import type { LegalLocale } from '@/content/legal'

const props = defineProps<{ kind: 'privacy' | 'cookie' }>()

const locale = ref<LegalLocale>('en')
const content = computed(() => legalContent[locale.value])
const pageTitle = computed(() =>
  props.kind === 'privacy' ? content.value.privacy.title : content.value.cookie.title,
)

onMounted(() => {
  locale.value = detectLegalLocale()
  document.documentElement.lang = locale.value
})

useHead({
  title: computed(() => `${pageTitle.value} — De Luisa`),
  htmlAttrs: { lang: locale },
})
</script>

<template>
  <main class="mx-auto min-h-svh w-full max-w-2xl px-5 py-12 text-site-heading">
    <a
      href="/"
      class="font-mono text-[11px] uppercase tracking-[0.18em] text-site-secondary hover:text-site-heading"
    >
      ← {{ content.backHome }}
    </a>

    <h1 class="mt-6 text-2xl font-semibold leading-tight tracking-[-0.02em]">{{ pageTitle }}</h1>
    <p class="mt-1 text-xs text-site-muted">{{ content.lastUpdated }}</p>

    <!-- Privacy Policy -->
    <template v-if="kind === 'privacy'">
      <section v-for="section in content.privacy.sections" :key="section.heading" class="mt-8">
        <h2 class="mb-2 text-lg font-semibold">{{ section.heading }}</h2>
        <p
          v-for="(paragraph, i) in section.body"
          :key="i"
          class="mb-3 break-words text-sm leading-relaxed text-site-muted"
        >
          {{ paragraph }}
        </p>
      </section>
    </template>

    <!-- Cookie Policy -->
    <template v-else>
      <p
        v-for="(paragraph, i) in content.cookie.intro"
        :key="i"
        class="mt-6 text-sm leading-relaxed text-site-muted"
      >
        {{ paragraph }}
      </p>

      <section v-for="category in content.cookie.categories" :key="category.title" class="mt-8">
        <h2 class="mb-3 text-lg font-semibold">{{ category.title }}</h2>
        <div class="overflow-x-auto rounded-lg border border-site-border">
          <table class="w-full border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-site-border text-site-heading">
                <th class="px-3 py-2 font-semibold">{{ content.cookie.tableHeaders.name }}</th>
                <th class="px-3 py-2 font-semibold">{{ content.cookie.tableHeaders.provider }}</th>
                <th class="px-3 py-2 font-semibold">{{ content.cookie.tableHeaders.purpose }}</th>
                <th class="px-3 py-2 font-semibold">{{ content.cookie.tableHeaders.duration }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in category.rows"
                :key="row.name"
                class="border-b border-site-border/60 text-site-muted last:border-0"
              >
                <td class="whitespace-nowrap px-3 py-2 font-mono text-[13px] text-site-heading">
                  {{ row.name }}
                </td>
                <td class="px-3 py-2">{{ row.provider }}</td>
                <td class="px-3 py-2">{{ row.purpose }}</td>
                <td class="whitespace-nowrap px-3 py-2">{{ row.duration }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <button
      type="button"
      class="mt-10 rounded-full border border-site-border bg-site-surface/70 px-5 py-2 text-sm font-semibold text-site-heading transition active:scale-[0.99] hover:border-site-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-secondary"
      @click="showCookiePreferences()"
    >
      {{ content.managePreferences }}
    </button>
  </main>
</template>
