---
layout: home

hero:
  name: Open Bio Page
  text: Your links. Your brand. Your host. Your stats. Free.
  tagline: White-label link-in-bio. Fork the repo, edit JSON, publish a static site, and keep a scoped admin if you want one.
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
  - title: Brand in one file
    details: Name, domain, SEO, and copyright live in content/site.json. Each person is a JSON file under content/bios/.
    link: /site-config
  - title: Scoped admin
    details: An editor can load, save, and upload media only for their own slug. The API enforces that.
    link: /admin
  - title: Pick a host
    details: One admin core, with adapters for Cloudflare, Vercel, Netlify, AWS Lambda, and Azure Functions.
    link: /providers/
  - title: 100% free
    details: The code is MIT-licensed and there is no paid tier. The site runs on GitHub Pages, and the admin fits in a serverless provider's free plan.
    link: /providers/
---

## Live

Four example instances, each built from this repository: a 20-person engineering firm, a family of five, a two-person roastery and a six-person architecture studio. The people and companies are made up, and the portraits are AI-generated. The card grows to full screen as you scroll.

<HomeLive />

## Create your bio

The setup section above copies the prompt, or opens it in Claude Code, Codex, Cursor, Claude or ChatGPT. Choose family or company first.

Or do it yourself:

1. Fork this repository with GitHub's Fork button. A manual copy does not stay linked.
2. Edit `content/site.json` (brand, domain, origin, copyright).
3. Replace `content/bios/*.json` and `public/media/`.
4. Set secrets on your fork ([Secrets](/secrets)).
5. Deploy the static site, and one serverless admin adapter if you want `/admin`.

Walkthrough: [Create your bio](/create). The fork page: [Your instance](/deploy/fork-instance).
