<script setup>import UiShot from './.vitepress/theme/components/UiShot.vue'</script>

# site.json

This is the brand file. `src/content/site.ts` loads it.

<UiShot
  name="home"
  alt="The Ferraresi family directory home, with a portrait and first name for each of the five family members."
  url="your-domain.com/"
  caption="The directory home uses the brand and home fields from site.json"
/>

```json
{
  "brand": "Open Bio Page",
  "domain": "openbio.page",
  "origin": "https://openbio.page",
  "githubRepo": "your-org/open-bio-page",
  "licensePath": "LICENSE.md",
  "copyrightOwner": "Open Bio Page",
  "adminTitle": "Open Bio Page: Admin",
  "home": { "title": "...", "description": "...", "author": "...", "ogImageAlt": "...", "collectionName": "..." },
  "og": { "homeEyebrow": "...", "homeTitle": "...", "homeTagline": "..." },
  "seo": { "llmsTitle": "...", "llmsBlurb": "..." },
  "privacyContactEmail": "hello@openbio.page"
}
```

Change this file. Do not hardcode the brand in Vue views.
