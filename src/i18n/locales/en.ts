export const en = {
  social: {
    eyebrow: 'CTO & Product Engineer',
    tagline: 'Platforms, mobile apps and AI-assisted workflows that stay simple under pressure.',
    book: 'Book a 30-min call',
    email: 'Email me',
    cv: 'Download CV',
    siteCard: 'Explore the full site',
    shareTitle: 'Share this page',
    shareHint: 'Copy the link and share it anywhere.',
    shareCopy: 'Copy link',
    shareCopied: 'Copied!',
    shareNative: 'Share…',
    shareClose: 'Close',
  },
  contact: {
    links: {
      github: 'GitHub',
      linkedin: 'LinkedIn',
      x: 'X',
      telegram: 'Telegram',
      line: 'Line',
      instagram: 'Instagram',
      facebook: 'Facebook',
    },
  },
  footer: {
    copyright: '© 2026 Massimo De Luisa',
    licenseAriaLabel: 'License (opens in new tab)',
  },
} as const

export type TMessages = typeof en
