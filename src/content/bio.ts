export type TLocale = 'en' | 'it'

export type TFont = 'geist-sans' | 'inter' | 'geist-mono' | 'fraunces' | 'space-grotesk'

export interface IBioLink {
  id: string
  label: Record<TLocale, string>
  href: string
  icon?: string
  iconSize?: string
  color?: string
  mono?: boolean
  primary?: boolean
  external?: boolean
  download?: boolean
  /** When true (default), also show as a circular quick button under the profile. */
  quick?: boolean
}

export interface IBioContent {
  eyebrow: string
  tagline: string
}

export type TSiteCardPosition = 'before' | 'after'

export interface IBioSiteCard {
  url: string
  /** Explicit preview image. When empty, the OG image of `url` is fetched. */
  image?: string
  /** When false, hide the card even if url/image are set. Default true. */
  enabled?: boolean
  /** Place before the links list, or last in the links column. Default 'before'. */
  position?: TSiteCardPosition
}

export interface IBioTheme {
  primary: string
  secondary: string
  glyphColor?: string
  font: TFont
  cardRadius: number
  avatarRadius: number
  avatarBorderWidth: number
  avatarBorderColor: string
}

export type TBioColumns = 1 | 2

export interface IBioLayout {
  /**
   * Main profile grid: 2 = split (profile | links) on lg+,
   * 1 = single column capped at max-w-sm. Default 2.
   */
  columns?: TBioColumns
}

export interface IBio {
  slug: string
  name: string
  avatar: string
  site?: string
  siteCard?: IBioSiteCard
  layout?: IBioLayout
  theme: IBioTheme
  content: Record<TLocale, IBioContent>
  links: IBioLink[]
  socials: IBioLink[]
}
