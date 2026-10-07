# Open Bio Page

White-label **link-in-bio** platform — one page per person, content in the repo as JSON, edited
through a scoped admin, with per-person SEO, OpenGraph images and favicons.

This repository is the **Open Bio Page** template (`openbio.page`). Ship your own brand by
**GitHub Fork** (the Fork button — not a manual copy), then edit `content/site.json` plus
`content/bios/`.

Vue 3 + Vite 8 + Tailwind v4 + Pug + SCSS + i18next, prerendered with **vite-ssg**, deployed to
**GitHub Pages**, with a serverless admin API (Cloudflare Workers by default; also Vercel,
Netlify, AWS Lambda, Azure).

> Docs: `bun run docs:dev` · Publish: **[DEPLOY.md](./DEPLOY.md)** · Self-serve: **[docs/create.md](./docs/create.md)**

## How it works

- **Site config** — `content/site.json` is the white-label control plane (`src/content/site.ts`).
  Brand, domain, origin, admin title, OG home card copy and copyright all come from there.
- **Content** lives in `content/bios/<slug>.json` (one per person), typed by `src/content/bio.ts`
  (`IBio`). It is loaded at build time (`src/composables/use-bios.ts`).
- **Routing** — each bio is `<origin>/<slug>` (canonical). Optional subdomains
  `<slug>.<domain>` can redirect or proxy to the path (see [DEPLOY.md](./DEPLOY.md)).
- **Prerendering** — `vite-ssg` emits one static HTML per bio so each `/<slug>` ships its own
  `<title>`/OG/`<meta>` for social scrapers.
- **OG images + favicons** — generated post-build into `dist/og/<slug>.png` and
  `dist/favicons/<slug>.svg`.
- **Admin API** — shared core in `server/core/` with adapters under `server/adapters/`
  (Cloudflare, Vercel, Netlify, AWS, Azure). Cloudflare entry remains `worker/`.

## Admin (scoped auth)

`/<origin>/admin` talks to the serverless admin API, which is the trust boundary holding every
secret. The API **must** be a same-site subdomain of your public domain (e.g. `api.openbio.page`),
not a `*.workers.dev` / `*.vercel.app` URL — otherwise Safari blocks the httpOnly session cookie.

Each admin user is bound to **one slug**. People cannot read or overwrite each other’s profiles.

```sh
bun worker/hash-password.ts <user> <slug> <password>
# -> {"user":"…","slug":"…","salt":"…","passHash":"…"}
```

## Project setup

```sh
bun install
cp .env.example .env.local
cp worker/.dev.vars.example worker/.dev.vars
cp secrets.local.example secrets.local   # local dump only; never commit
bun dev                  # site :5173 + admin API :8787
bun run docs:dev         # VitePress docs at http://127.0.0.1:5174/
```

### Build / type-check / lint

```sh
bun run build
bun run docs:build
bun run type-check
bun lint
```

## White-label checklist

1. **GitHub Fork** this repo (Fork button)
2. Edit `content/site.json` — brand, domain, origin, GitHub repo, SEO/OG copy, copyright
3. Replace `content/bios/*.json` (and `public/media/`) with your people
4. Update `public/CNAME` and Worker/serverless vars (`GITHUB_REPO`, `ALLOWED_ORIGIN`, …)
5. Set GitHub Actions Variables/Secrets on **your fork** (see [DEPLOY.md](./DEPLOY.md))
6. Align bootstrap meta in `index.html` with `content/site.json`

## De Luisa instance

Family content lives under `instances/deluisa-bio/` as a restore snapshot. Create
`de-luisa-bio` with **GitHub → Fork** from this upstream, then restore that snapshot — see
[docs/deploy/fork-instance.md](./docs/deploy/fork-instance.md).

## Deploy

- **`.github/workflows/ci.yml`** — type-check, lint, site build, docs build
- **`.github/workflows/pages.yml`** — docs → GitHub Pages at `openbio.page` (upstream only)
- **`.github/workflows/deploy-site.yml`** — a fork's `dist/` → GitHub Pages
- **`.github/workflows/deploy-worker.yml`** — Cloudflare Worker on a fork

Full DNS / Pages / custom-domain steps: **[DEPLOY.md](./DEPLOY.md)**.
