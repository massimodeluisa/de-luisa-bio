import { computed, ref } from 'vue'

import i18next from 'i18next'

import { en } from './locales/en'
import { it } from './locales/it'

export type TLocaleCode = 'en' | 'it'

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

void i18next.init({
  lng: 'en',
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

const currentLocale = ref<TLocaleCode>('en')

export function syncBrowserLocale(): void {
  const detected = detectLocale()
  currentLocale.value = detected
  if (typeof document !== 'undefined') {
    document.documentElement.lang = detected
  }
}

function t(key: string, fallback?: string): string {
  const value: unknown = i18next.t(key, { lng: currentLocale.value, defaultValue: fallback })
  return typeof value === 'string' ? value : key
}

export function useI18n() {
  return { t, locale: computed(() => currentLocale.value) }
}
