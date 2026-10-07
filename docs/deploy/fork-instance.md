# GitHub Fork → De Luisa instance

`openbio.page` is the **upstream template**. `deluisa.bio` is a **branded child repo created with GitHub’s Fork button** — not a manual copy.

## What “fork” means here

Use **GitHub → Fork** only:

1. Open the upstream repo on GitHub (e.g. `massimodeluisa/openbio`)
2. Click the **Fork** button (top-right)
3. Choose owner / repo name (e.g. `massimodeluisa/de-luisa-bio`)
4. Create the fork

That keeps the fork linked to upstream (`Forked from …`), so you can pull template updates later.

### Do **not** do these (not a GitHub Fork)

- Create an empty repo and `git push` a copy of the history
- Download ZIP / copy files into a new repo
- `git clone` + change `origin` to a new empty remote and call it a “fork”
- Duplicate the project only via `instances/` restore without clicking **Fork**

`instances/deluisa-bio/` is a **content snapshot** you apply **after** the GitHub Fork exists. It is not a substitute for Fork.

## After the GitHub Fork

On the **forked** repo clone:

```bash
# restore De Luisa brand + people (from upstream snapshot that ships in the template)
cp instances/deluisa-bio/content/site.json content/site.json
rm -rf content/bios
cp -R instances/deluisa-bio/content/bios content/bios
cp instances/deluisa-bio/public/CNAME public/CNAME
rm -rf public/media
cp -R instances/deluisa-bio/public/media public/media
```

Update Worker / serverless vars on the fork:

```toml
GITHUB_REPO = "massimodeluisa/de-luisa-bio"
ALLOWED_ORIGIN = "https://deluisa.bio"
```

Point `public/CNAME` and `content/site.json` (`domain`, `origin`, `githubRepo`, brand copy) at `deluisa.bio`.

## Re-install secrets (on the fork)

Upstream Open Bio should stay clean of instance secrets.

1. Keep values in local `secrets.local` (gitignored) from the dump you made before cleaning upstream
2. Re-create **GitHub Actions Secrets / Variables** on the **forked** repo
3. `wrangler secret put …` (or equivalent) on the De Luisa Worker / serverless env
4. Set `VITE_ADMIN_API=https://api.deluisa.bio`

## Publish checklist

- [ ] Repo shows **Forked from** the Open Bio upstream on GitHub
- [ ] `bun run build` locally
- [ ] Pages custom domain `deluisa.bio`
- [ ] Admin API custom domain `api.deluisa.bio` (same-site cookie)
- [ ] Login `/admin` as a scoped user — only that slug is writable
- [ ] WhatsApp/Discord quick icons render (iconSize + generated icons)

## Pulling template updates later

Because this is a real GitHub Fork:

```bash
git remote add upstream https://github.com/massimodeluisa/openbio.git   # if missing
git fetch upstream
git merge upstream/master   # or rebase — resolve content conflicts carefully
```

Do not replace the fork with a fresh manual copy; that breaks the fork relationship.
