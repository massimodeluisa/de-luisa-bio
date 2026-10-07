# Your Instance

`openbio.page` is the template, and it is where these docs live. Your site is a fork of that repo, on a domain you control.

## Fork it on GitHub

Use the Fork button. GitHub then shows "Forked from" on the repo, and you can pull template updates later.

1. Open `open-bio-page/open-bio-page` on GitHub
2. Click Fork (top right)
3. Pick the owner and the repository name
4. Create the fork

These are not forks:

- A new empty repo that you push a copy into
- A ZIP download dropped into a new repo
- `git clone`, then pointing `origin` at a new empty remote
- Copying `template/` into a new empty repo and skipping the Fork button

## On your clone

Edit `content/site.json`: brand, `domain`, `origin`, `githubRepo`, copyright, and the home and SEO lines.

Replace `content/bios/demo.json` with one JSON file per person. Put photos in `public/media/`, or leave `avatar` empty and the page draws a letter.

Write `public/CNAME` as the hostname only, with no scheme and no path. Root `public/` does not include that file, because `openbio.page` belongs to these docs. `template/public/CNAME` is the placeholder `example.com`.

In `worker/wrangler.toml`, set `GITHUB_REPO` to `owner/name` and `ALLOWED_ORIGIN` to `https://your-domain`.

If a Cloudflare Worker for this site is already named `openbio-admin`, keep that `name`. The template default is `open-bio-page-admin`. Renaming a live script creates a second Worker.

Match the title and Open Graph tags in `index.html` to `content/site.json`.

## Secrets

Leave the upstream repo `open-bio-page/open-bio-page` free of your secrets.

1. Keep values in a local `secrets.local`. It is gitignored. Do not commit it.
2. Create the same Actions secrets and variables on the fork.
3. Put the Worker secrets on the serverless host (`wrangler secret put`, or that host's equivalent).
4. Set `VITE_ADMIN_API` to `https://api.your-domain`.

The API host has to be a subdomain of the public site. Otherwise the browser blocks the login cookie.

## Checklist

- GitHub shows Forked from the Open Bio Page repo
- `bun run build` passes
- The Pages custom domain is your hostname, and the DNS records are grey-cloud (not proxied)
- `api.your-domain` points at the admin Worker
- `/admin` logs in, and that user can write only their own slug
- Quick icons under the profile actually show

## Pulling template updates

```bash
git remote add upstream https://github.com/open-bio-page/open-bio-page.git   # if missing
git fetch upstream
git merge upstream/master   # or rebase, and keep your content when it conflicts
```

Do not replace the fork with a fresh copy of the template. That drops the link to upstream.

## Blank start

`content/` in this repo is the Open Bio Page demo. `template/` is the same shape with placeholders: `site.json`, one profile, and `public/CNAME`.

```bash
cp template/content/site.json content/site.json
rm -rf content/bios
cp -R template/content/bios content/bios
cp template/public/CNAME public/CNAME
```

Replace the placeholders. The app never reads `template/`. It reads `content/` and `public/` at the repo root.
