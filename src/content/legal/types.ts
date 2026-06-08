export type LegalLocale = 'en' | 'it' | 'ja' | 'ru' | 'uk'

export interface LegalSection {
  heading: string
  body: string[]
}

export interface CookieRow {
  name: string
  provider: string
  purpose: string
  duration: string
}

export interface CookieCategory {
  title: string
  rows: CookieRow[]
}

/** Short strings used by the vanilla-cookieconsent banner. */
export interface BannerStrings {
  title: string
  description: string
  acceptAll: string
  reject: string
  preferences: string
  prefsTitle: string
  rejectAll: string
  save: string
  necessaryTitle: string
  necessaryDesc: string
  analyticsTitle: string
  analyticsDesc: string
  marketingTitle: string
  marketingDesc: string
}

export interface LegalContent {
  banner: BannerStrings
  cookiePolicyLabel: string
  privacyPolicyLabel: string
  /** Localized "Last updated: 8 June 2026". */
  lastUpdated: string
  /** Label for the "manage cookie preferences" button on the pages. */
  managePreferences: string
  backHome: string
  privacy: {
    title: string
    sections: LegalSection[]
  }
  cookie: {
    title: string
    intro: string[]
    tableHeaders: { name: string; provider: string; purpose: string; duration: string }
    categories: CookieCategory[]
  }
}
