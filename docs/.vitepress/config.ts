import { defineConfig } from 'vitepress'

const ESiteOrigin = 'https://openbio.page'
const ESiteDescription =
  'White-label, self-hosted link-in-bio. GitHub Fork, customize, publish on Cloudflare, Vercel, Netlify, AWS, or Azure.'

export default defineConfig({
  lang: 'en-US',
  title: 'Open Bio',
  description: ESiteDescription,
  base: '/docs/',
  outDir: '../.docs-dist',
  cleanUrls: false,
  appearance: true,
  sitemap: { hostname: `${ESiteOrigin}/docs/` },
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: 'any' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Open Bio' }],
    ['meta', { property: 'og:title', content: 'Open Bio' }],
    ['meta', { property: 'og:description', content: ESiteDescription }],
    ['meta', { property: 'og:url', content: `${ESiteOrigin}/docs/` }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],
  themeConfig: {
    logo: { light: '/favicon.svg', dark: '/favicon.svg', alt: 'Open Bio' },
    siteTitle: 'Open Bio',
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'Deploy', link: '/deploy/' },
      { text: 'Providers', link: '/providers/' },
      { text: 'Admin & auth', link: '/admin' },
      {
        text: 'GitHub',
        link: 'https://github.com/massimodeluisa/de-luisa-bio',
      },
    ],
    sidebar: [
      {
        text: 'Start',
        items: [
          { text: 'What it is', link: '/' },
          { text: 'Install and usage', link: '/guide' },
          { text: 'Create your bio', link: '/create' },
        ],
      },
      {
        text: 'Deploy',
        items: [
          { text: 'Overview', link: '/deploy/' },
          { text: 'GitHub Pages + secrets', link: '/deploy/github-pages' },
          { text: 'GitHub Fork → deluisa', link: '/deploy/fork-instance' },
        ],
      },
      {
        text: 'Serverless providers',
        items: [
          { text: 'Compare free tiers', link: '/providers/' },
          { text: 'Cloudflare Workers', link: '/providers/cloudflare' },
          { text: 'Vercel', link: '/providers/vercel' },
          { text: 'Netlify', link: '/providers/netlify' },
          { text: 'AWS Lambda', link: '/providers/aws-lambda' },
          { text: 'Azure Functions', link: '/providers/azure' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Admin & scoped auth', link: '/admin' },
          { text: 'site.json', link: '/site-config' },
          { text: 'Secrets checklist', link: '/secrets' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/massimodeluisa/de-luisa-bio' }],
    search: { provider: 'local' },
    footer: {
      message:
        'open-source link-in-bio by <a href="https://deluisa.me">Massimo De Luisa</a> / Smart Squad',
      copyright: '© 2026 Open Bio. White-label. Self-hosted. Your domain.',
    },
    outline: { level: [2, 3] },
  },
})
