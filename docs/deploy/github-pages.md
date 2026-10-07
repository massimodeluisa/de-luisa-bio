# GitHub Pages + secrets

## Pages

The upstream repository publishes this documentation at `https://openbio.page` from `.github/workflows/pages.yml`. That workflow does not run on forks.

On a fork:

1. In the repo settings, open Pages and set Source to GitHub Actions
2. Custom domain = value of `content/site.json` → `domain`
3. Workflow: `.github/workflows/deploy-site.yml` (the directory in `dist/`, not these docs)
4. Add `public/CNAME` with that domain. The template does not ship one, because `openbio.page` belongs to the docs site.

## Variables (Actions)

| Name | Purpose |
| --- | --- |
| `VITE_POSTHOG_KEY` | Public PostHog key |
| `VITE_POSTHOG_HOST` | e.g. `https://eu.i.posthog.com` |
| `VITE_ADMIN_API` | `https://api.<your-domain>` |
| `VITE_GTM_ID` | Optional Google Tag Manager container ID |

`VITE_POSTHOG_*` are build-time values; see [Analytics and admin stats](/analytics).

## Secrets (Actions → Worker)

| Name | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Worker deploy |
| `CLOUDFLARE_ACCOUNT_ID` | Worker deploy |
| `SESSION_SECRET` | Signs session cookies |
| `ADMIN_GITHUB_TOKEN` | Contents:write on the repo |
| `POSTHOG_READ_KEY` | Admin stats |
| `ADMIN_USERS` | JSON array of hashed users |

`POSTHOG_HOST` and `POSTHOG_PROJECT_ID` are Worker `[vars]` in `worker/wrangler.toml`, and [Analytics and admin stats](/analytics) lists the value each one takes.

Keep a local copy in `secrets.local` (gitignored) while you move hosts. Never commit it.

## Worker

```bash
cd worker
bunx wrangler secret put SESSION_SECRET
bunx wrangler secret put GITHUB_TOKEN
bunx wrangler secret put POSTHOG_READ_KEY
bunx wrangler secret put ADMIN_USERS
bunx wrangler deploy --config wrangler.toml
```

Attach the custom domain `api.<your-domain>` on the Worker.
