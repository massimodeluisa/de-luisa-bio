/**
 * White-label site configuration.
 *
 * Edit `content/site.json` to rebrand this project (domain, brand name, SEO copy,
 * copyright, GitHub repo). All UI, OG cards, admin chrome and docs helpers read
 * from here — no hardcoded product name in app code.
 */
export interface ISiteHomeConfig {
  title: string
  description: string
  author: string
  ogImageAlt: string
  collectionName: string
}

export interface ISiteOgConfig {
  homeEyebrow: string
  homeTitle: string
  homeTagline: string
}

export interface ISiteSeoConfig {
  llmsTitle: string
  llmsBlurb: string
}

export interface ISiteConfig {
  brand: string
  domain: string
  origin: string
  githubRepo: string
  /** Path inside the repo for the LICENSE link, e.g. `LICENSE.md`. */
  licensePath: string
  copyrightOwner: string
  adminTitle: string
  /** Optional family/org surname stripped from display names on the home grid. */
  nameSuffix?: string
  home: ISiteHomeConfig
  og: ISiteOgConfig
  seo: ISiteSeoConfig
  privacyContactEmail: string
}

const modules = import.meta.glob<{ default: ISiteConfig }>('../../content/site.json', {
  eager: true,
})

const loaded = Object.values(modules)[0]?.default
if (!loaded) {
  throw new Error('Missing content/site.json — required for white-label site config')
}

export const site: ISiteConfig = loaded

export const siteOrigin = site.origin.replace(/\/$/, '')
export const siteDomain = site.domain
export const licenseUrl = `https://github.com/${site.githubRepo}/blob/master/${site.licensePath}`

export function copyrightLine(year = new Date().getFullYear()): string {
  return `© ${year} ${site.copyrightOwner}`
}

export function publicBioUrl(slug: string): string {
  return `${siteOrigin}/${slug}`
}

export function bioSubdomainUrl(slug: string): string {
  return `https://${slug}.${siteDomain}/`
}
