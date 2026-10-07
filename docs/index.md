---
layout: home

hero:
  name: Open Bio
  text: Your links. Your brand. Your host.
  tagline: White-label link-in-bio — GitHub Fork the repo, edit JSON, publish a static site with a scoped admin API.
  actions:
    - theme: brand
      text: Install
      link: /guide
    - theme: alt
      text: Deploy
      link: /deploy/
    - theme: alt
      text: Providers
      link: /providers/

features:
  - title: 100% customizable
    details: Brand, domain, SEO, and copyright live in content/site.json. Profiles are plain JSON under content/bios/.
    link: /site-config
  - title: Scoped admin
    details: Each editor can only load, save, and upload media for their own slug — enforced in the API.
    link: /admin
  - title: Bring your serverless host
    details: Shared admin core with adapters for Cloudflare, Vercel, Netlify, AWS Lambda, and Azure Functions.
    link: /providers/
---

## Install

::: code-group

```bash [bun]
bun install
cp .env.example .env.local
cp worker/.dev.vars.example worker/.dev.vars
cp secrets.local.example secrets.local
bun dev
```

```bash [npm]
npm install
cp .env.example .env.local
cp worker/.dev.vars.example worker/.dev.vars
cp secrets.local.example secrets.local
npm run dev
```

:::

Site → `http://localhost:5173` · Admin API → `http://localhost:8787` · Docs → this site.

## Create your bio

Anyone can ship a full instance without touching the core:

1. **GitHub Fork** this repository (the Fork button — not a manual copy)
2. Edit `content/site.json` (brand, domain, origin, copyright)
3. Replace `content/bios/*.json` and `public/media/`
4. Set secrets on **your fork** (see [Secrets](/secrets))
5. Deploy the static site + one serverless admin adapter

Full walkthrough: [Create your bio](/create) · [GitHub Fork → instance](/deploy/fork-instance)

## Providers (free tiers)

| Provider | Free tier (indicative) | Adapter |
| --- | --- | --- |
| Cloudflare Workers | Generous free requests | `server/adapters/cloudflare.ts` |
| Vercel Serverless / Edge | Free functions + sites | `server/adapters/vercel.ts` |
| Netlify Functions | 125k invocations / site / month | `server/adapters/netlify.ts` |
| AWS Lambda | 1M requests + 3.2M GB-s / month | `server/adapters/aws-lambda.ts` |
| Azure Functions | 1M requests / month (consumption) | `server/adapters/azure.ts` |

Guides: [Providers](/providers/)
