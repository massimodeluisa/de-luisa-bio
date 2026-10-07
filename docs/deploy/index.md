# Deploy overview

A published Open Bio Page is two hosts:

1. The static site from `bun run build`, written to `dist/`. GitHub Pages is the default. Netlify, Vercel, or S3 plus a CDN also work.
2. The admin API, one adapter from `server/adapters/`.

The site calls `VITE_ADMIN_API`. That URL has to be a subdomain of the public site, so the session cookie is first-party.

```
yourdomain.com          → static site
api.yourdomain.com      → serverless admin
```

## GitHub Pages and a Worker

[GitHub Pages and secrets](/deploy/github-pages).

## Your instance

Fork the upstream repo with GitHub's Fork button, then put your brand in `content/site.json` and your people in `content/bios/`. `template/` is a blank copy of those files.

[Your instance](/deploy/fork-instance).
