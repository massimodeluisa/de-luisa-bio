import type { LegalContent } from './types'

export const en: LegalContent = {
  banner: {
    title: 'We value your privacy',
    description:
      'We use necessary cookies to make the site work and, only with your consent, statistics and marketing tools. You can accept, reject, or choose your preferences.',
    acceptAll: 'Accept all',
    reject: 'Reject',
    preferences: 'Preferences',
    prefsTitle: 'Cookie preferences',
    rejectAll: 'Reject all',
    save: 'Save preferences',
    necessaryTitle: 'Necessary cookies',
    necessaryDesc: 'Required for the site to work. Always on.',
    analyticsTitle: 'Statistics',
    analyticsDesc:
      'Google Analytics 4 and PostHog: they measure visits in aggregate to help us improve the site.',
    marketingTitle: 'Marketing',
    marketingDesc: 'Meta (Facebook) Pixel: measures and optimizes advertising campaigns.',
  },
  cookiePolicyLabel: 'Cookie Policy',
  privacyPolicyLabel: 'Privacy Policy',
  lastUpdated: 'Last updated: 8 June 2026',
  managePreferences: 'Manage cookie preferences',
  backHome: 'Back to home',
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Data Controller',
        body: [
          'This website (deluisa.bio) is operated by the De Luisa family, who is the data controller for the processing described here. For any privacy request you can write to massimodeluisa@me.com.',
        ],
      },
      {
        heading: 'What data we process',
        body: [
          'When you visit, technical navigation data is generated: IP address, browser and device type, pages visited, and timestamps.',
          'In addition, only after you give consent, the analytics and marketing tools listed below set identifiers used to measure and analyze visits.',
        ],
      },
      {
        heading: 'Purposes and legal basis',
        body: [
          'Operating and securing the website — legal basis: our legitimate interest and the technical necessity to deliver the service (Art. 6(1)(b) and (f) GDPR).',
          'Aggregate statistics via Google Analytics 4 and PostHog — legal basis: your consent (Art. 6(1)(a) GDPR).',
          'Advertising measurement via Meta Pixel — legal basis: your consent (Art. 6(1)(a) GDPR).',
        ],
      },
      {
        heading: 'Tools and third parties',
        body: [
          'Google Analytics 4 — provided by Google Ireland Ltd. Privacy: https://policies.google.com/privacy',
          'Meta (Facebook) Pixel — provided by Meta Platforms Ireland Ltd. Privacy: https://www.facebook.com/privacy/policy',
          'PostHog — product analytics processed in the European Union (EU region). Privacy: https://posthog.com/privacy',
          'Hosting and delivery — GitHub Pages (GitHub, Inc.) and Cloudflare (Cloudflare, Inc.) for serving and protecting the site; their server logs may include your IP address for security and operation.',
        ],
      },
      {
        heading: 'International data transfers',
        body: [
          'Google and Meta may transfer data outside the EU/EEA, including to the United States, on the basis of adequacy decisions or Standard Contractual Clauses. PostHog data is hosted in the European Union. Cloudflare operates a global network and applies appropriate safeguards.',
        ],
      },
      {
        heading: 'Data retention',
        body: [
          'Analytics and marketing data is retained for the periods set by each provider (see the Cookie Policy for cookie lifetimes). Your consent choices are stored for 6 months, after which we ask you again.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'Under the GDPR you may request access to, rectification or erasure of your data, restriction of or objection to processing, and data portability. You may withdraw your consent at any time without affecting processing carried out beforehand.',
          'You also have the right to lodge a complaint with your supervisory authority — in Italy, the Garante per la protezione dei dati personali (www.garanteprivacy.it).',
        ],
      },
      {
        heading: 'Managing your consent',
        body: [
          'You can change or withdraw your consent at any time using the button below, or from the cookie banner.',
        ],
      },
      {
        heading: 'Changes to this policy',
        body: [
          'We may update this policy from time to time. The date shown below indicates the latest version.',
        ],
      },
    ],
  },
  cookie: {
    title: 'Cookie Policy',
    intro: [
      'This site uses cookies and similar technologies. Necessary cookies are always active because the site cannot work without them. Statistics and marketing cookies are loaded only after you give consent, and you can change your choice at any time.',
    ],
    tableHeaders: {
      name: 'Cookie',
      provider: 'Provider',
      purpose: 'Purpose',
      duration: 'Duration',
    },
    categories: [
      {
        title: 'Necessary',
        rows: [
          {
            name: 'cc_cookie',
            provider: 'deluisa.bio',
            purpose: 'Stores your cookie consent choices.',
            duration: '6 months',
          },
        ],
      },
      {
        title: 'Statistics',
        rows: [
          {
            name: '_ga, _ga_*',
            provider: 'Google Analytics',
            purpose: 'Distinguishes users and sessions for aggregate statistics.',
            duration: 'up to 2 years',
          },
          {
            name: 'ph_* (PostHog)',
            provider: 'PostHog (EU)',
            purpose: 'Product analytics; distinguishes users and visits.',
            duration: 'up to 1 year',
          },
        ],
      },
      {
        title: 'Marketing',
        rows: [
          {
            name: '_fbp',
            provider: 'Meta',
            purpose: 'Tracks visits for advertising measurement.',
            duration: '3 months',
          },
          {
            name: 'fr',
            provider: 'Meta',
            purpose: 'Ad delivery and measurement.',
            duration: '3 months',
          },
        ],
      },
    ],
  },
}
