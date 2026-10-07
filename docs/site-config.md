# site.json

White-label control plane. Loaded by `src/content/site.ts`.

```json
{
  "brand": "Open Bio Page",
  "domain": "openbio.page",
  "origin": "https://openbio.page",
  "githubRepo": "your-org/open-bio-page",
  "licensePath": "LICENSE.md",
  "copyrightOwner": "Open Bio Page",
  "adminTitle": "Open Bio Page — Admin",
  "home": { "title": "...", "description": "...", "author": "...", "ogImageAlt": "...", "collectionName": "..." },
  "og": { "homeEyebrow": "...", "homeTitle": "...", "homeTagline": "..." },
  "seo": { "llmsTitle": "...", "llmsBlurb": "..." },
  "privacyContactEmail": "hello@openbio.page"
}
```

Change this file — do not hardcode brand strings in Vue views.
