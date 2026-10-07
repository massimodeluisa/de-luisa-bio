# Install and usage

Open Bio Page is a Vue 3 + Vite SSG app with a small serverless admin API.

## Requirements

- [Bun](https://bun.sh) 1.3+ (or Node 22+)
- A GitHub repo you can write to (admin saves bios via the Contents API)
- Optional: PostHog project for analytics + admin stats

## Local setup

```bash
bun install
cp .env.example .env.local
cp worker/.dev.vars.example worker/.dev.vars
cp secrets.local.example secrets.local   # fill later; never commit
bun worker/hash-password.ts demo demo 'change-me'
# paste the JSON object into ADMIN_USERS in worker/.dev.vars
bun dev
```

- Public site: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`
- API: `http://localhost:8787` (`VITE_ADMIN_API`)

## Build

```bash
bun run build      # type-check + SSG + OG + favicons + SEO
bun run docs:build # VitePress → docs/.vitepress/dist
bun lint
```

## Project map

```text
content/site.json     white-label brand / domain / SEO
content/bios/*.json   one profile per person
server/core/          shared admin API (auth, GitHub writes, stats)
server/adapters/      Cloudflare · Vercel · Netlify · AWS · Azure
worker/               Cloudflare deploy + local Bun API
docs/                 VitePress documentation (this site)
instances/deluisa-bio content snapshot applied after a real GitHub Fork
```
