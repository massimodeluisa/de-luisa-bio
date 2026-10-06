# Agnostic Bio

White-label **link-in-bio** platform — one page per person, content in the repo as JSON, edited
through a scoped admin, with per-person SEO, OpenGraph images and favicons.

This repository ships a De Luisa family instance by default. Rebrand everything by editing
`content/site.json` (domain, brand name, SEO copy, copyright, GitHub repo) plus your bio JSON
files under `content/bios/`.

Vue 3 + Vite 8 + Tailwind v4 + Pug + SCSS + i18next, prerendered with **vite-ssg**, deployed to
**GitHub Pages**, with a **Cloudflare Worker** admin API.

> Step-by-step publish instructions: **[DEPLOY.md](./DEPLOY.md)**

## How it works

- **Site config** — `content/site.json` is the white-label control plane (`src/content/site.ts`).
  Brand, domain, origin, admin title, OG home card copy and copyright all come from there.
- **Content** lives in `content/bios/<slug>.json` (one per person), typed by `src/content/bio.ts`
  (`IBio`). It is loaded at build time (`src/composables/use-bios.ts`).
- **Routing** — each bio is `<origin>/<slug>` (canonical). `BioView.vue` renders the shared
  `BioProfile` component; optional subdomains `<slug>.<domain>` can redirect or proxy to the path
  (Cloudflare — see [DEPLOY.md](./DEPLOY.md)).
- **Prerendering** — `vite-ssg` emits one static HTML per bio (`vite.config.ts` `includedRoutes`)
  so each `/<slug>` ships its own `<title>`/OG/`<meta>` (via `@unhead/vue`) for social scrapers.
- **OG images + favicons** — generated post-build into `dist/og/<slug>.png` and
  `dist/favicons/<slug>.svg` (`scripts/generate-og.ts`, `scripts/generate-favicons.ts`).
- **Theme & layout per bio** — `IBio.theme` (colours, font, radii) plus `IBio.layout.columns`
  (1 or 2 column profile), site-card position/enabled, and per-social `quick` buttons — all
  editable in the admin with a live `BioProfile` preview.

## Admin (scoped auth)

`/<origin>/admin` is a client-only SPA (`src/views/AdminView.vue`). It talks only to the
Cloudflare Worker (`worker/`), which is the trust boundary holding every secret. The Worker
**must** be a same-site subdomain of your public domain (e.g. `api.deluisa.bio`), not a
`*.workers.dev` URL — otherwise Safari blocks the httpOnly session cookie and every call 401s.

### Profile isolation

Each admin user is bound to **one slug** in the Worker `ADMIN_USERS` secret. Enforcement:

| Surface | Rule |
| --- | --- |
| Login session | Cookie payload carries `{ user, slug }` signed with `SESSION_SECRET` |
| `GET /bio` | Returns only `content/bios/<session.slug>.json` |
| `POST /bio` | Rejects if `body.slug !== session.slug` (403); path always uses session slug |
| `POST /media` | Filename must match `<session.slug>-(original\|250\|600\|2000).webp` |
| `GET /stats` | PostHog queries filtered to that slug’s path / `bio` property |
| Admin UI | Forces `form.slug = session.slug` on load, save and avatar upload |

People cannot read or overwrite each other’s profiles.

Generate an `ADMIN_USERS` entry:

```sh
bun worker/hash-password.ts <user> <slug> <password>
# -> {"user":"…","slug":"…","salt":"…","passHash":"…"}
```

## Analytics

Both run, behind one `track()` in `src/composables/use-analytics.ts`:

- **Google Tag Manager** — container id in `index.html` / analytics composable; lazy-loaded.
- **PostHog** — `VITE_POSTHOG_KEY` (public). Autocapture + custom events. Powers the admin
  per-person dashboard via the Worker (which holds the secret read key).

## Project setup

```sh
bun install
cp .env.example .env.local                 # public VITE_* values for local dev
cp worker/.dev.vars.example worker/.dev.vars # Worker secrets for local dev
```

### Develop

```sh
bun dev                  # public site + admin SPA + Worker on :8787
```

Set `VITE_ADMIN_API=http://localhost:8787` in `.env.local`, then log into `/admin` with a
user from `worker/.dev.vars`.

### Build / type-check / lint

```sh
bun run build      # type-check + vite-ssg + OG + favicons + SEO files
bun run type-check
bun lint
```

## White-label checklist

1. Edit `content/site.json` — brand, domain, origin, GitHub repo, SEO/OG copy, copyright.
2. Replace `content/bios/*.json` (and `public/media/`) with your people.
3. Update `public/CNAME` to your apex/custom domain.
4. Point Worker `wrangler.toml` vars (`GITHUB_REPO`, `ALLOWED_ORIGIN`, PostHog project).
5. Set GitHub Actions Variables/Secrets (see [DEPLOY.md](./DEPLOY.md)).
6. Align bootstrap meta in `index.html` with `content/site.json` (commented in the file).
7. Adjust legal copy under `src/content/legal/` if needed for your operator / privacy contact.

## Deploy

Two GitHub Actions workflows:

- **`.github/workflows/ci.yml`** — type-check, lint and build on PRs / pushes (does not deploy).
- **`.github/workflows/deploy-site.yml`** — builds and deploys `dist/` to GitHub Pages on push to
  `master`. Uses a non-cancelling concurrency group so an in-flight Pages deploy is never aborted
  mid-flight (that previously left Pages stuck until `deploy-pages` timed out).
- **`.github/workflows/deploy-worker.yml`** — `wrangler deploy` for `worker/` on changes.

Full DNS, Pages, Worker custom-domain and subdomain redirect steps: **[DEPLOY.md](./DEPLOY.md)**.

## Adding a person

```sh
bun worker/hash-password.ts <slug> <slug> <password>
```

Add the JSON object to the Worker `ADMIN_USERS` secret (array). Pre-seed
`content/bios/<slug>.json` (copy an existing file, change `slug` / `name` / theme). Push — the
site rebuilds; `<origin>/<slug>` is live. Avatar uploads go to `public/media/<slug>-*.webp`
via the scoped admin.
