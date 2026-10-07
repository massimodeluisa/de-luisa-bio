<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/mark-dark-rounded.svg">
    <img src="assets/mark-light-rounded.svg" alt="Open Bio Page" width="160">
  </picture>
</p>

<h1 align="center">Open Bio Page</h1>

<p align="center">
  <strong>Your links. Your brand. Your host.</strong><br />
  Free, open-source, white-label link-in-bio you host yourself
</p>

<p align="center">
  <a href="https://openbio.page/"><img src="https://img.shields.io/badge/Docs-openbio.page-3A5BFF?style=flat-square" alt="Documentation" /></a>
  <a href="https://openbio.page/#live"><img src="https://img.shields.io/badge/Examples-live-3A5BFF?style=flat-square" alt="Live examples" /></a>
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/Code%20license-MIT-green?style=flat-square" alt="Code license: MIT" /></a>
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3-42B883?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue 3" /></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" /></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white" alt="Bun" /></a>
  <a href="https://pages.github.com/"><img src="https://img.shields.io/badge/GitHub%20Pages-222222?style=flat-square&logo=github&logoColor=white" alt="GitHub Pages" /></a>
  <a href="https://workers.cloudflare.com/"><img src="https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare Workers" /></a>
</p>

<p align="center">
  <a href="#what-it-does">What it does</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#create-your-bio">Create your bio</a> ·
  <a href="#admin">Admin</a> ·
  <a href="#analytics">Analytics</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#deploy">Deploy</a> ·
  <a href="#docs">Docs</a> ·
  <a href="#repository-structure">Structure</a>
</p>

<p align="center">
  <img src="assets/og.png" alt="Open Bio Page. Your links. Your brand. Your host." width="800" />
</p>

---

## What it does

Open Bio Page gives everyone in a family or a company their own link-in-bio page. Each profile is a JSON file in the repository, and the build prerenders a static site with one HTML page per person, each with its own SEO tags, Open Graph image and favicon. A scoped admin lets each person edit their own profile and nobody else's. The brand, domain and copy come from `content/site.json`.

The code is free and MIT-licensed, and there is no paid tier. GitHub Pages hosts the static site, and the admin API fits in the free plan of a serverless provider: Cloudflare Workers by default, with adapters for Vercel, Netlify, AWS Lambda and Azure Functions. The app uses Vue 3, Vite 8, Tailwind CSS 4, Pug, SCSS and i18next, and `vite-ssg` prerenders it.

Four live examples run on this code: [Northvale](https://openbio.page/examples/northvale/), a structural engineering firm in London with 20 people; [Ferraresi](https://openbio.page/examples/ferraresi/), a family of five from Bologna; [Ottobre](https://openbio.page/examples/ottobre/), a two-person coffee roastery in Turin; and [Pietra](https://openbio.page/examples/pietra/), a six-person architecture studio in Lisbon. Their people are made up, and the portraits are AI-generated.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/public/screens/home-desktop-dark.webp">
    <img src="docs/public/screens/home-desktop-light.webp" alt="The Ferraresi example home, with a full-height portrait and the first name of each of the five family members." width="49%">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/public/screens/bio-desktop-dark.webp">
    <img src="docs/public/screens/bio-desktop-light.webp" alt="Giulia Ferraresi's profile page, with her portrait, the eyebrow Paediatric nurse, a one-line bio, and links to her recipe notebook, email and Instagram." width="49%">
  </picture>
</p>

## Quick start

```sh
bun install
cp .env.example .env.local
cp worker/.dev.vars.example worker/.dev.vars
cp secrets.local.example secrets.local   # local dump only; never commit
bun dev                  # site :5173 + admin API :8787
bun run docs:dev         # VitePress docs at http://127.0.0.1:5174/
```

`bun run docs:dev` and `bun run docs:build` run `bun run examples:build` first, so the example sites exist under `docs/public/examples/` before VitePress runs.

To build, type-check and lint:

```sh
bun run build
bun run docs:build
bun run type-check
bun lint
```

## Create your bio

This repository is the template behind [openbio.page](https://openbio.page/). To publish your own instance, follow this checklist:

1. Fork this repo with GitHub's Fork button, so your copy stays linked to this repository.
2. Edit `content/site.json` (brand, domain, origin, GitHub repo, SEO and OG copy, copyright).
3. Replace `content/bios/*.json` and `public/media/` with your people.
4. Set `public/CNAME`, and the Worker vars `GITHUB_REPO` and `ALLOWED_ORIGIN`.
5. Set Actions variables and secrets on your fork. See [DEPLOY.md](DEPLOY.md).
6. Match the bootstrap meta in `index.html` to `content/site.json`.

`template/` holds a blank `site.json`, one profile and a `CNAME` line. When you do not want the demo profile, copy it over `content/` and `public/CNAME` on your fork. The app does not read `template/` itself.

```sh
cp template/content/site.json content/site.json
rm -rf content/bios
cp -R template/content/bios content/bios
cp template/public/CNAME public/CNAME
```

The full walkthrough is in [docs/create.md](docs/create.md), and the fork steps are in [docs/deploy/fork-instance.md](docs/deploy/fork-instance.md). You can also hand the setup to a coding agent: the [Set it up with a coding agent](https://openbio.page/#copy-prompt) section on the docs home copies a prompt, or opens it in Claude Code, Codex, Cursor, Claude or ChatGPT.

## Admin

The admin page at `<origin>/admin` talks to the serverless admin API, which holds the secrets. The API host has to be a subdomain of your public site, for example `api.example.com`. A `*.workers.dev` or `*.vercel.app` URL is cross-site, and Safari drops the session cookie.

Each admin user is locked to one slug and cannot read or overwrite anyone else's profile. To create a user, hash the password and add the JSON object it prints to the `ADMIN_USERS` array:

```sh
bun worker/hash-password.ts <user> <slug> <password>
# -> {"user":"…","slug":"…","salt":"…","passHash":"…"}
```

The endpoints and their scope are in [docs/admin.md](docs/admin.md).

## Analytics

The public site sends visitor events to PostHog only after the visitor accepts analytics in the cookie banner. The admin Stats tab reads those events back through the PostHog Query API and shows visits, unique visitors, views per day, clicks by link, sources and countries for the signed-in user's slug. Setup and the meaning of each number are in [docs/analytics.md](docs/analytics.md).

## How it works

- `content/site.json` is the brand file, typed by `ISiteConfig` in `src/content/site.ts`. The brand, domain, origin, admin title, home copy and copyright all come from it.
- Profiles live in `content/bios/<slug>.json`, one per person, typed by `IBio` in `src/content/bio.ts`. The app loads them at build time through `src/composables/use-bios.ts`.
- Each bio is served at `<origin>/<slug>`, and that path is the canonical URL. A subdomain such as `<slug>.<domain>` can redirect to it, as described in [DEPLOY.md](DEPLOY.md).
- `vite-ssg` writes one HTML file per bio, so each `/<slug>` has its own title and meta tags for scrapers that do not run JavaScript.
- After the build, scripts write the OG images to `dist/og/<slug>.png`, the favicons to `dist/favicons/<slug>.svg`, and `sitemap.xml`, `robots.txt`, `llms.txt` and `llms-full.txt` to `dist/`.
- The admin API core is `server/core/`. The adapters for Cloudflare, Vercel, Netlify, AWS Lambda and Azure live in `server/adapters/`, and the Cloudflare package is `worker/`.
- `bun run examples:build` builds each `examples/<id>/` with the same app. It sets `OBP_CONTENT_DIR`, `OBP_PUBLIC_DIR`, `OBP_BASE=/examples/<id>/` and `OBP_OUT_DIR`, and builds in demo mode (`VITE_DEMO_INSTANCE=true`). Demo mode drops the cookie banner and analytics, marks the pages `noindex, nofollow`, and shows a notice in place of opening a made-up link.

## Deploy

- `.github/workflows/ci.yml` runs type-check, lint, the site build and the docs build.
- `.github/workflows/pages.yml` publishes these docs to GitHub Pages at `openbio.page`. It runs only on the upstream repository.
- `.github/workflows/deploy-site.yml` publishes a fork's `dist/` to GitHub Pages.
- `.github/workflows/deploy-worker.yml` deploys the Cloudflare Worker on a fork.

DNS, Pages and custom domains are covered in [DEPLOY.md](DEPLOY.md).

## Docs

The documentation lives at [openbio.page](https://openbio.page/). To run it locally:

```sh
bun run docs:dev         # http://127.0.0.1:5174/
bun run examples:build   # example sites into docs/public/examples/<id>/
bun run docs:screens     # docs screenshots into docs/public/screens/
```

`bun run docs:screens` serves the built Ferraresi example, mocks the admin API, and captures the home, profile, admin sign-in, editor and stats screens on desktop and phone, in light and dark, as WebP files. It needs the example sites from `bun run examples:build` and a Chromium: set `PLAYWRIGHT_CHROMIUM_PATH` to a Chromium or Chrome binary, or install one with `bunx playwright-core install chromium`.

## Repository structure

```text
open-bio-page/
├── api/                  Vercel entry point for the admin API
├── api-azure/            Azure Functions entry point for the admin API
├── assets/               brand marks, favicons and social preview
├── content/              site.json and one JSON file per bio
├── docs/                 VitePress site (openbio.page) and its screenshots
├── examples/             four example instances built under /examples/<id>/
├── netlify/              Netlify Functions entry point for the admin API
├── public/               static files and bio media
├── scripts/              icons, brand assets, OG images, favicons, SEO files, examples, screenshots
├── server/core/          admin API (auth, GitHub writes, stats)
├── server/adapters/      Cloudflare, Vercel, Netlify, AWS Lambda, Azure
├── src/                  Vue app (views, components, content types, analytics)
├── template/             blank site.json, one profile and a CNAME placeholder
├── worker/               Cloudflare Worker package and local Bun API
├── .github/workflows/    CI, docs, site and Worker deploys
└── DEPLOY.md · LICENSE.md · README.md
```

## Author

Created by [Massimo De Luisa](https://deluisa.me).
<p>
  <a href="https://x.com/massimodeluisa"><img src="https://img.shields.io/badge/@massimodeluisa-000000?style=flat-square&logo=x" alt="X" /></a>
  <a href="https://github.com/massimodeluisa"><img src="https://img.shields.io/badge/GitHub-massimodeluisa-181717?style=flat-square&logo=github" alt="GitHub" /></a>
</p>

## License

The source code is MIT. The content (copy, images and personal material) is All Rights Reserved. See [LICENSE.md](LICENSE.md).
