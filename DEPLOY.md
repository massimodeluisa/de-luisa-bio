# Deploy and publish

Publish your own instance after a GitHub fork of this template. Use the names from your `content/site.json`. The template's own domain is `openbio.page`.

Your fork: [Your instance](./docs/deploy/fork-instance.md).

This repository publishes the docs at `https://openbio.page` from `.github/workflows/pages.yml`, and only on the upstream repo. A fork publishes the directory with `.github/workflows/deploy-site.yml`. The docs stay on `openbio.page`. They are not copied into the instance site.

## Prerequisites

- A GitHub repository created with the Fork button, so it keeps `Forked from …`
- A Cloudflare account (DNS and Workers), or another [provider](./docs/providers/)
- Bun locally for hashing admin passwords (`bun worker/hash-password.ts`)
- Optional: PostHog project for analytics + admin stats

## 1. Configure the brand

Edit `content/site.json`:

| Field | Purpose |
| --- | --- |
| `brand` | Display name (SEO site name, titles) |
| `domain` / `origin` | Public hostname and `https://…` origin |
| `githubRepo` | `owner/name` used for license links and Worker commits |
| `adminTitle` | Login screen heading |
| `copyrightOwner` | Footer copyright |
| `home.*` / `og.*` / `seo.*` | Home SEO, OG home card, llms.txt copy |

Also set:

- `public/CNAME` → your custom domain
- `worker/wrangler.toml` → `GITHUB_REPO`, `ALLOWED_ORIGIN`, PostHog host/project id
- Bootstrap meta in `index.html` (keep in sync with `site.json`)

## 2. GitHub repository settings (on your fork)

### Pages

1. Open the repo's Settings, then Pages
2. Set Build and deployment, Source, to GitHub Actions
3. After the first deploy succeeds, set the custom domain to `site.domain` and wait for DNS and HTTPS

### Variables (Settings → Secrets and variables → Actions → Variables)

| Name | Example |
| --- | --- |
| `VITE_POSTHOG_KEY` | `phc_…` (public) |
| `VITE_POSTHOG_HOST` | `https://eu.i.posthog.com` |
| `VITE_ADMIN_API` | `https://api.openbio.page` |

### Secrets

| Name | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Worker deploy |
| `CLOUDFLARE_ACCOUNT_ID` | Worker deploy |
| `SESSION_SECRET` | Signs admin session cookies |
| `ADMIN_GITHUB_TOKEN` | Worker commits bio/media to this repo (contents:write) |
| `POSTHOG_READ_KEY` | Personal/project API key for admin stats |
| `ADMIN_USERS` | JSON array of `{ user, slug, salt, passHash }` |

Generate users:

```sh
bun worker/hash-password.ts demo demo 'your-password'
# Append the printed object into the ADMIN_USERS array secret
```

Use `secrets.local.example` → `secrets.local` as a local dump checklist. Never commit `secrets.local`.

## 3. DNS (Cloudflare example)

The example apex is `openbio.page`. Use yours.

### Apex to GitHub Pages

Leave the records DNS-only (grey cloud). GitHub needs that to issue a Let's Encrypt certificate. An orange-cloud proxy makes the Pages check fail.

- `A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- Optional `CAA 0 issue "letsencrypt.org"`

### Admin API → Worker

1. Deploy the Worker (the `Deploy admin worker` workflow, or `cd worker && bunx wrangler deploy`)
2. In the Worker dashboard, add the custom domain `api.<your-domain>`
3. That host has to be a subdomain of the public site, or the session cookie is not first-party

### Optional: send `*.domain` to the path

Proxied (orange cloud) CNAME `*` to the apex, plus a Cloudflare redirect rule:

- When: `(http.request.full_uri wildcard "https://*.YOUR_DOMAIN/*" and http.host ne "api.YOUR_DOMAIN")`
- Then: dynamic `https://YOUR_DOMAIN/${1}`, status 301, keep the query string

Guarding `api.` stops the admin API from being redirected.

## 4. First publish

```sh
bun install
bun run build
bun run docs:build
bun lint

git push origin master
```

Or run a workflow by hand from Actions: Deploy docs, Deploy site, or Deploy admin worker. Upstream runs Deploy docs. A fork runs Deploy site and Deploy admin worker.

If Deploy site sits on `deploy-pages` and times out after about 10 minutes, do not cancel it and push again in a loop. Cancelling a Pages deploy that is already running can leave the environment stuck. Wait for the run to finish, or cancel once, then use Re-run failed jobs. The workflow sets `concurrency.cancel-in-progress: false`, so a new push will not abort a deploy that is already going.

Check:

- `https://openbio.page/` is the documentation
- `https://YOUR_DOMAIN/` is the home directory
- `https://YOUR_DOMAIN/<slug>` is a profile
- `https://YOUR_DOMAIN/admin` is the login, and you can edit only your own bio
- `https://api.YOUR_DOMAIN/me` returns 401 without a cookie, which is what you want

## 5. Local development

```sh
bun install
cp .env.example .env.local
cp worker/.dev.vars.example worker/.dev.vars
bun dev
# Site: http://localhost:5173
# Admin API: http://localhost:8787
bun run docs:dev
```

## Security reminders

- Never put Worker secrets in `VITE_*` env vars
- Never point `VITE_ADMIN_API` at `*.workers.dev` in production
- One `ADMIN_USERS` entry per person; slug must match their `content/bios/<slug>.json`
- Rotate `SESSION_SECRET` if a cookie is leaked (invalidates all sessions)
- Instance secrets belong on the GitHub fork, not on a repo you copied by hand
