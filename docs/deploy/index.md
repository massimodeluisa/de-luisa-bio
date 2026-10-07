# Deploy overview

Open Bio publishes as:

1. **Static site** — `bun run build` → `dist/` (GitHub Pages, Netlify, Vercel static, S3+CDN, …)
2. **Admin API** — one serverless adapter from `server/adapters/`

The SPA talks to `VITE_ADMIN_API`. That URL **must** be a subdomain of your public site so the session cookie is first-party.

```
yourdomain.com          → static site
api.yourdomain.com      → serverless admin
```

## Default path (GitHub Pages + Cloudflare Worker)

See [GitHub Pages + secrets](/deploy/github-pages).

## Instance recipe (De Luisa)

Use **GitHub → Fork** on the Open Bio upstream, then restore brand content from `instances/deluisa-bio/`.

See [GitHub Fork → instance](/deploy/fork-instance).
