import type { LegalContent, LegalLocale } from './types'

import { site } from '@/content/site'

import { en } from './en'
import { it } from './it'
import { ja } from './ja'
import { ru } from './ru'
import { uk } from './uk'

const rawLegalContent: Record<LegalLocale, LegalContent> = { en, it, ja, ru, uk }

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

function fill(template: string): string {
  return template
    .replaceAll('{{domain}}', site.domain)
    .replaceAll('{{brand}}', site.brand)
    .replaceAll('{{email}}', site.privacyContactEmail)
}

function fillLegal(content: LegalContent): LegalContent {
  return {
    ...content,
    privacy: {
      ...content.privacy,
      sections: content.privacy.sections.map((section) => ({
        ...section,
        body: section.body.map(fill),
      })),
    },
    cookie: {
      ...content.cookie,
      intro: content.cookie.intro.map(fill),
      categories: content.cookie.categories.map((category) => ({
        ...category,
        rows: category.rows.map((row) => ({
          ...row,
          provider: fill(row.provider),
          purpose: fill(row.purpose),
        })),
      })),
    },
  }
}

/** Locale legal copy with `{{domain}}` / `{{brand}}` / `{{email}}` filled from site.json. */
export const legalContent: Record<LegalLocale, LegalContent> = {
  en: fillLegal(rawLegalContent.en),
  it: fillLegal(rawLegalContent.it),
  ja: fillLegal(rawLegalContent.ja),
  ru: fillLegal(rawLegalContent.ru),
  uk: fillLegal(rawLegalContent.uk),
}

export function getLegalContent(locale: LegalLocale = detectLegalLocale()): LegalContent {
  return legalContent[locale]
}

export type { LegalContent, LegalLocale } from './types'
