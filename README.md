# deluisa.bio

Family **link-in-bio** site for the De Luisa family — one page per person, content in the repo as
JSON, edited through a small custom admin, with per-person SEO, OpenGraph images and favicons.

Vue 3 + Vite 8 + Tailwind v4 + Pug + SCSS + i18next, prerendered with **vite-ssg**, deployed to
**GitHub Pages**, with a **Cloudflare Worker** admin API.

## How it works

- **Content** lives in `content/bios/<slug>.json` (one per person), typed by `src/content/bio.ts`
  (`IBio`). It is loaded at build time (`src/composables/use-bios.ts`).
- **Routing** — each bio is `deluisa.bio/<slug>` (canonical). `BioView.vue` renders the resolved
  `IBio`; the subdomain `<slug>.deluisa.bio` 301-redirects to the path (Cloudflare, see DNS below).
- **Prerendering** — `vite-ssg` emits one static HTML per bio (`vite.config.ts` `includedRoutes`)
  so each `/<slug>` ships its own `<title>`/OG/`<meta>` (via `@unhead/vue`) for social scrapers.
- **OG images + favicons** — generated post-build into `dist/og/<slug>.png` and
  `dist/favicons/<slug>.svg` (`scripts/generate-og.ts`, `scripts/generate-favicons.ts`). The OG card
  is a split layout: the person's photo on the left, a panel in their primary colour on the right.
- **Theme per bio** — `IBio.theme` (primary/secondary colours, font, card radius, avatar
  radius/border) is applied via CSS variables in `BioView.vue` and configurable in the admin.

## Admin

`deluisa.bio/admin` is a custom, client-only SPA (`src/views/AdminView.vue`). It talks only to the
Cloudflare Worker (`worker/`), which is the trust boundary holding every secret:

- **Custom basic auth** — users are defined in the Worker's `ADMIN_USERS` secret. Each person logs
  in and is scoped to their own bio.
- **Stats home** — the Worker proxies the **PostHog** query API, scoped to that person's path, so the
  admin home shows their visits, unique visitors, views-per-day and clicks-by-link.
- **Editor** — edit your own bio (profile, appearance/theme, content, links, socials) with a live
  preview. Saving commits `content/bios/<slug>.json` to GitHub via the Worker, which triggers a
  rebuild. A person can only ever save their own slug (enforced server-side).

Generate an `ADMIN_USERS` entry:

```sh
bun worker/hash-password.ts <user> <slug> <password>
# -> {"user":"…","slug":"…","salt":"…","passHash":"…"}
```

## Analytics

Both run, behind one `track()` in `src/composables/use-analytics.ts`:

- **Google Tag Manager** — container `GTM-MCT4XSDM`, lazy-loaded; `<noscript>` fallback in
  `index.html`. Events: `page_view`, `link_click` (`{ link_id, link_url, location, bio }`),
  `share_open`, `share_native`.
- **PostHog** — `VITE_POSTHOG_KEY` (public). Autocapture + the same custom events. Powers the
  admin's per-person dashboard via the Worker (which holds the secret read key).

## Project setup

```sh
bun install
cp .env.example .env.local                 # public VITE_* values for local dev
cp worker/.dev.vars.example worker/.dev.vars # Worker secrets for local dev
```

### Develop

```sh
bun dev                  # public site + admin SPA
bun worker/dev-server.ts # admin API on :8787 (Bun — no wrangler needed locally)
```

Set `VITE_ADMIN_API=http://localhost:8787` in `.env.local`, then log into `/admin` with a
user from `worker/.dev.vars`. (Production deploys the Worker via wrangler — see below.)

### Build / type-check / lint

```sh
bun run build      # type-check + vite-ssg + OG + favicons
bun run type-check
bun lint
```

## Deploy

Two GitHub Actions workflows:

- **`.github/workflows/deploy-site.yml`** — builds and deploys `dist/` to GitHub Pages on push to
  `master`. Public values come from repo **Variables** (`VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`,
  `VITE_ADMIN_API`). `public/CNAME` pins `deluisa.bio`; a `404.html` SPA fallback is added.
- **`.github/workflows/deploy-worker.yml`** — `wrangler deploy` for `worker/` on changes, pushing
  secrets from repo **Secrets**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `SESSION_SECRET`,
  `ADMIN_GITHUB_TOKEN` (→ Worker `GITHUB_TOKEN`), `POSTHOG_READ_KEY`, `ADMIN_USERS`. Non-secret
  config is in `worker/wrangler.toml` (`GITHUB_REPO`, `POSTHOG_HOST`, `POSTHOG_PROJECT_ID`,
  `ALLOWED_ORIGIN`).

### DNS (Cloudflare) — path canonical, subdomain redirects

- **Apex `deluisa.bio` → GitHub Pages** (DNS-only / grey cloud, so GitHub issues the Let's Encrypt
  cert): `A` → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`; `CAA 0 issue "letsencrypt.org"`.
  Set + verify the custom domain in the repo's Pages settings.
- **Wildcard `*.deluisa.bio` → redirect** (proxied / orange cloud, so a redirect rule fires and
  Universal SSL covers it): `*.deluisa.bio` CNAME → `deluisa.bio`, plus a Cloudflare **Single/Dynamic
  Redirect**: when `http.host matches "^([a-z0-9-]+)\.deluisa\.bio$"` → 301
  `concat("https://deluisa.bio/", ${1})`, preserving path/query. One rule covers every person.

## Adding a person

A member needs two things: an **admin login** and a **bio**. The home grid and routes include any
`content/bios/*.json` automatically — no code changes.

### 1. Create the admin login (required)

Generate a salted PBKDF2 entry (username = slug):

```sh
bun worker/hash-password.ts <slug> <slug> <password>
# e.g. bun worker/hash-password.ts marco marco a-strong-password
# -> {"user":"marco","slug":"marco","salt":"…","passHash":"…"}
```

Add that object to the `ADMIN_USERS` JSON array:

- **Local**: in `worker/.dev.vars` (insert `,{…}` before the closing `]`), then restart `bun run dev`.
- **Production**: update the GitHub **Secret `ADMIN_USERS`** with the full array (all users).

Rules: the **slug** is the URL (`deluisa.bio/<slug>`) and subdomain — lowercase letters, digits and
hyphens only. Each user can edit **only** their own bio (enforced by the Worker).

### 2. Create the bio — two ways

- **Via the admin (easiest):** the person signs in at `/admin`, fills everything (name, colours,
  content, links) and **uploads an avatar**, then **Save bio**. This creates
  `content/bios/<slug>.json` automatically (locally it writes to the working tree; in production it
  commits to GitHub).
- **Pre-seed (so they appear immediately):** copy an existing `content/bios/<slug>.json`, change
  `slug` / `name` / `theme` colours, leave `avatar: ""` (a coloured letter-glyph shows until a photo
  is uploaded). They then complete it from the admin.

Avatars are uploaded as square WebP derivatives (`<slug>-{original,2000,600,250}.webp` under
`public/media/`) and served responsively; the bio's `avatar` stores the base path `/media/<slug>`.

Push — the site rebuilds; `deluisa.bio/<slug>` and `<slug>.deluisa.bio` both work.

## Tech

Vue 3 (beta) · Vite 8 · vite-ssg · Tailwind CSS v4 · Pug + SCSS · i18next · @unhead/vue · VueUse ·
satori + resvg (OG) · PostHog + GTM · Cloudflare Workers · TypeScript · Bun.
