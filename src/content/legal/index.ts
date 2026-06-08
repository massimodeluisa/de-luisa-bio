import type { LegalContent, LegalLocale } from './types'

import { en } from './en'
import { it } from './it'
import { ja } from './ja'
import { ru } from './ru'
import { uk } from './uk'

export const legalContent: Record<LegalLocale, LegalContent> = { en, it, ja, ru, uk }

export const LEGAL_LOCALES: LegalLocale[] = ['en', 'it', 'ja', 'ru', 'uk']

/** Detects the closest supported legal locale from the browser; defaults to English. */
export function detectLegalLocale(): LegalLocale {
  if (typeof navigator === 'undefined') {
    return 'en'
  }
  const list = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const entry of list) {
    const code = entry.toLowerCase().split('-')[0] ?? ''
    if ((LEGAL_LOCALES as string[]).includes(code)) {
      return code as LegalLocale
    }
  }
  return 'en'
}

export function getLegalContent(locale: LegalLocale = detectLegalLocale()): LegalContent {
  return legalContent[locale]
}

export type { LegalContent, LegalLocale } from './types'
