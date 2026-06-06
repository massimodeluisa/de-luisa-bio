# deluisa.bio

Family **link-in-bio** site (Linktree-style) for the De Luisa family, built with Vue 3 + Vite +
Tailwind CSS v4 + Pug + i18next.

## Concept

`deluisa.bio` will serve one link-in-bio page **per family member / business**, each on its own
subdomain, all rendered by the same `SocialLinksView` component but with **its own colors, avatar,
links, copy and social profiles**:

| Subdomain                 | Person / entity            | Notes                                      |
| ------------------------- | -------------------------- | ------------------------------------------ |
| `massimo.deluisa.bio`     | Massimo De Luisa           | CTO & Product Engineer (also at deluisa.me)|
| `arianna.deluisa.bio`     | Arianna De Luisa           |                                            |
| `giovanni.deluisa.bio`    | Giovanni De Luisa          |                                            |
| `nicole.deluisa.bio`      | Nicole De Luisa            |                                            |
| `camilla.deluisa.bio`     | Camilla De Luisa           |                                            |
| `andrea.deluisa.bio`      | Andrea De Luisa            |                                            |
| `pasticceria.deluisa.bio` | Pasticceria De Luisa       | Business — https://www.pasticceriadeluisa.it/ |

(list is non-exhaustive; more members may be added)

The root `deluisa.bio` and the per-member subdomains are still **to be designed** — see
[Open questions](#open-questions-structure--config).

## Analytics

- Google Tag Manager container: **`GTM-MCT4XSDM`** (distinct from the deluisa.me container).
- Loaded client-side by `src/composables/use-analytics.ts`; `<noscript>` fallback in `index.html`.
- Every interaction is tracked to the dataLayer: `page_view`, `link_click`
  (`{ link_id, link_url, location }`), `share_open`, `share_native`.
- Configure GA4 / Facebook Pixel as tags inside GTM (triggered on those dataLayer events).

## Current state

- A single, fully working bio page (`src/App.vue`, ex `SocialLinksView`) — Massimo's profile, with
  the share dialog (copy + preselect link), brand-colored social icons, the deluisa.me OG card, and
  i18n (auto-detected browser language, `en` / `it`).
- Theme tokens, fonts (Geist) and look ported from deluisa.me for visual consistency.

## Open questions (structure & config)

To turn this into a multi-tenant, per-member system we still need to decide:

1. **Per-member data** — a config object/file per member (name, avatar, accent color, tagline,
   links, social profiles, share URL, GTM-or-GA per member?). Likely `src/members/<slug>.ts` or a
   single registry.
2. **Subdomain → member resolution** — read `window.location.hostname` at runtime to pick the
   member, with a fallback (root `deluisa.bio` = directory of members? redirect? a landing?).
3. **Hosting / DNS** — wildcard `*.deluisa.bio` DNS + a host that serves the same SPA on every
   subdomain (e.g. Vercel/Netlify/Cloudflare Pages with wildcard domains), or per-subdomain builds.
4. **SEO / OG per member** — per-subdomain `<title>`, description and OG image.
5. **Share URL** — currently hardcoded to `deluisa.me/links`; should become the member's own
   `https://<slug>.deluisa.bio`.

## Tech

- Vue 3 (beta) · Vite 8 · Tailwind CSS v4 (`@tailwindcss/vite`) · Pug templates · i18next · TypeScript.

## Project setup

```sh
bun install
```

### Develop

```sh
bun dev
```

### Type-check + build

```sh
bun run build
```

### Lint

```sh
bun lint
```
