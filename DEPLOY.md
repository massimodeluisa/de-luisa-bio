# Deploy & publish — Agnostic Bio

This guide walks through publishing a white-label instance (default: De Luisa / `deluisa.bio`).
Replace domain names with the values from your `content/site.json`.

## Prerequisites

- GitHub repository with Actions enabled
- Cloudflare account (DNS + Workers)
- Bun locally for hashing admin passwords (`bun worker/hash-password.ts`)
- Optional: PostHog project (EU or US) for analytics + admin stats

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

## 2. GitHub repository settings

### Pages

1. Repo **Settings → Pages**
2. **Build and deployment → Source** = **GitHub Actions**
3. After the first successful deploy, set **Custom domain** to the value of `site.domain`
   (e.g. `deluisa.bio`) and wait for DNS / HTTPS to verify

### Variables (Settings → Secrets and variables → Actions → Variables)

| Name | Example |
| --- | --- |
| `VITE_POSTHOG_KEY` | `phc_…` (public) |
| `VITE_POSTHOG_HOST` | `https://eu.i.posthog.com` |
| `VITE_ADMIN_API` | `https://api.deluisa.bio` |

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
bun worker/hash-password.ts massimo massimo 'your-password'
# Append the printed object into the ADMIN_USERS array secret
```

## 3. DNS (Cloudflare)

Assume apex `deluisa.bio` — substitute your domain.

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
# Local sanity check
bun install
bun run build
bun lint

# Push to master — Actions builds and deploys site + worker when paths change
git push origin master
```

Or re-run workflows manually: **Actions → Deploy site / Deploy worker → Run workflow**.

Verify:

- `https://YOUR_DOMAIN/` — home directory
- `https://YOUR_DOMAIN/<slug>` — profile
- `https://YOUR_DOMAIN/admin` — login; edit only your own bio
- `https://api.YOUR_DOMAIN/me` — 401 without cookie (expected)

## 5. Local development

```sh
bun install
cp .env.example .env.local
cp worker/.dev.vars.example worker/.dev.vars
# Fill ADMIN_USERS / SESSION_SECRET / optional GitHub + PostHog in .dev.vars

bun dev
# Site: http://localhost:5173
# Admin API: http://localhost:8787
```

## 6. Admin UX notes

- Editor loads the bio from GitHub (`GET /bio`) so you never edit a stale build bundle
- Live preview uses the real public `BioProfile` layout (theme, site card, 1/2 columns, quick socials)
- Stats failures do not block the editor
- Saving commits JSON to the repo and triggers a Pages rebuild (usually 1–2 minutes)

## Security reminders

- Never put Worker secrets in `VITE_*` env vars
- Never point `VITE_ADMIN_API` at `*.workers.dev` in production
- One `ADMIN_USERS` entry per person; slug must match their `content/bios/<slug>.json`
- Rotate `SESSION_SECRET` if a cookie is leaked (invalidates all sessions)
