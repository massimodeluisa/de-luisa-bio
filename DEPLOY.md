# Deploy & publish — Open Bio

Publish a white-label instance after a **GitHub Fork** of this template. Replace domain names
with the values from your `content/site.json`. Default template domain: `openbio.page`.

For the De Luisa branded child: [GitHub Fork → instance](./docs/deploy/fork-instance.md).

## Prerequisites

- GitHub repository created with the **Fork** button (keeps `Forked from …`)
- Cloudflare account (DNS + Workers) — or another [provider](./docs/providers/)
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

1. Repo **Settings → Pages**
2. **Build and deployment → Source** = **GitHub Actions**
3. After the first successful deploy, set **Custom domain** to `site.domain`
   and wait for DNS / HTTPS to verify

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

Assume apex `openbio.page` — substitute your domain.

### Apex → GitHub Pages

DNS-only (grey cloud) so GitHub can issue Let’s Encrypt:

- `A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- Optional `CAA 0 issue "letsencrypt.org"`

### Admin API → Worker

1. Deploy the Worker (workflow `Deploy worker`, or `cd worker && bunx wrangler deploy`)
2. In the Worker dashboard, add **Custom Domain** `api.<your-domain>`
3. This **must** be a subdomain of the public site so the session cookie is first-party

### Optional: `*.domain` → path redirects

Proxied (orange cloud) CNAME `*` → apex, plus a Cloudflare **Redirect Rule**:

- **When**: `(http.request.full_uri wildcard "https://*.YOUR_DOMAIN/*" and http.host ne "api.YOUR_DOMAIN")`
- **Then**: Dynamic `https://YOUR_DOMAIN/${1}`, status **301**, preserve query string

Guarding `api.` stops the admin API from being redirected.

## 4. First publish

```sh
bun install
bun run build
bun run docs:build
bun lint

git push origin master
```

Or re-run workflows manually: **Actions → Deploy site / Deploy worker → Run workflow**.

If `Deploy site` hangs on `deploy-pages` / times out after ~10 minutes, do **not** cancel and
re-push repeatedly — cancelling an in-flight Pages deploy can leave the environment stuck. Wait
for the run to finish (or cancel once), then **Re-run failed jobs**. The workflow uses
`concurrency.cancel-in-progress: false` so a new push will not abort a deploy already running.

Verify:

- `https://YOUR_DOMAIN/` — home directory
- `https://YOUR_DOMAIN/<slug>` — profile
- `https://YOUR_DOMAIN/docs/` — documentation
- `https://YOUR_DOMAIN/admin` — login; edit only your own bio
- `https://api.YOUR_DOMAIN/me` — 401 without cookie (expected)

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
- Instance secrets belong on the **GitHub Fork**, not on a manually copied remote
