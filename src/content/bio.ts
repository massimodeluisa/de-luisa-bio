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
}

export interface IBioContent {
  eyebrow: string
  tagline: string
}

export interface IBioSiteCard {
  url: string
  image: string
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

export interface IBio {
  slug: string
  name: string
  avatar: string
  site?: string
  siteCard?: IBioSiteCard
  theme: IBioTheme
  content: Record<TLocale, IBioContent>
  links: IBioLink[]
  socials: IBioLink[]
}
