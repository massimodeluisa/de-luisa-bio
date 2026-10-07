<script setup>import UiShot from './.vitepress/theme/components/UiShot.vue'</script>

# Install and usage

Open Bio Page is a Vue 3 + Vite SSG app with a small serverless admin API.

## Requirements

- [Bun](https://bun.sh) 1.3+ (or Node 22+)
- A GitHub repo you can write to (admin saves bios via the Contents API)
- Optional: [PostHog](/analytics) project for analytics + admin stats

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

<UiShot
  name="home"
  alt="The Ferraresi family directory home, with a portrait and first name for each of the five family members."
  url="localhost:5173/"
  caption="Directory home at localhost:5173"
/>

<UiShot
  name="bio"
  alt="Giulia Ferraresi's profile page with her avatar, the eyebrow Paediatric nurse, a short tagline, and links to her recipe notebook, email, and Instagram."
  url="localhost:5173/giulia"
  caption="A profile page"
/>

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
template/             blank site.json, one profile, and a CNAME placeholder
```
