import { computed, ref } from 'vue'

import i18next from 'i18next'

import { en } from './locales/en'
import { it } from './locales/it'

export type TLocaleCode = 'en' | 'it'

/* First supported language from the browser's preference list, else 'en'. */
function detectLocale(): TLocaleCode {
  if (typeof navigator === 'undefined') {
    return 'en'
  }
  const list = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const entry of list) {
    const code = entry.toLowerCase().split('-')[0]
    if (code === 'it' || code === 'en') {
      return code
    }
  }
  return 'en'
}

const initial = detectLocale()

void i18next.init({
  lng: initial,
  fallbackLng: 'en',
  supportedLngs: ['en', 'it'],
  resources: {
    en: { translation: en },
    it: { translation: it },
  },
  interpolation: { escapeValue: false },
  returnNull: false,
  initAsync: false,
})

const currentLocale = ref<TLocaleCode>(initial)

if (typeof document !== 'undefined') {
  document.documentElement.lang = initial
}

function t(key: string, fallback?: string): string {
  const value: unknown = i18next.t(key, { lng: currentLocale.value, defaultValue: fallback })
  return typeof value === 'string' ? value : key
}

export function useI18n() {
  return { t, locale: computed(() => currentLocale.value) }
}
