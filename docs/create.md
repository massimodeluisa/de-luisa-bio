# Create your bio

You do not need to be a maintainer of Open Bio Page to publish your own link-in-bio.

## 1. GitHub Fork (required)

Create your instance with **GitHub’s Fork button** — not a manual copy of the repo.

1. Open the Open Bio Page repository on GitHub
2. Click **Fork** (top-right)
3. Pick your account/org and repo name
4. Clone **your fork** and work there

That keeps `Forked from …` so you can pull upstream template updates later.

Do **not**: create an empty repo and push a copy, download a ZIP into a new repo, or clone and repoint `origin` to a new empty remote. Those are not GitHub Forks.

## 2. Brand

Edit `content/site.json`:

| Field | Example |
| --- | --- |
| `brand` | `Acme` |
| `domain` / `origin` | `links.acme.com` / `https://links.acme.com` |
| `githubRepo` | `acme/links` |
| `copyrightOwner` | `Acme Inc.` |
| `home.*` / `og.*` / `seo.*` | Titles and descriptions |

Update `public/CNAME` to your domain.

## 3. People

- Delete `content/bios/demo.json`
- Add `content/bios/<slug>.json` (copy the demo file)
- Put avatars in `public/media/<slug>-{original,2000,600,250}.webp` or upload via `/admin`

## 4. Admin users

```bash
bun worker/hash-password.ts <user> <slug> <password>
```

Put the JSON objects in the `ADMIN_USERS` secret (array). Each user is locked to one `slug`.

## 5. Secrets

Copy `secrets.local.example` → `secrets.local`, fill values, then upload to your **fork** (GitHub Actions Secrets/Variables + Worker/serverless env). See [Secrets](/secrets).

## 6. Publish

Pick a [provider](/providers/) for the admin API and deploy the static `dist/` (GitHub Pages by default). Same-site admin API host is required for cookies (e.g. `api.yourdomain.com`).

Branded family instance (De Luisa): [GitHub Fork → instance](/deploy/fork-instance).
