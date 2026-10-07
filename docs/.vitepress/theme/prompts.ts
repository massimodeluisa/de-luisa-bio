const EShared = `You are publishing an Open Bio Page instance. Open Bio Page is a white-label link-in-bio. One JSON file per person, a static site, GitHub Pages on the person's own domain.

Do the work in the user's environment. Do not edit, commit, or push github.com/open-bio-page/open-bio-page. Do not open a pull request against that repository. template/ is a blank site.json, one profile, and a CNAME placeholder. Copy it over content/ and public/CNAME when the demo profile should not ship. Then fill in the real names.

The site is built with Vite base "/". It must be served at the root of a domain the user already controls. username.github.io/<repo>/ will not work. If they have no domain, stop and say so. Do not change vite.config.ts base to paper over that.

## Facts you must ask for

Ask once, in one message. Do not invent names, jobs, taglines, links, or feelings.

- GitHub owner and repository name for the fork
- Hostname they control (apex such as example.com, or a subdomain such as links.example.com), and whether they can edit DNS
- Brand name, copyright owner, and the email for the privacy page
- Each profile: url slug, display name, a one-line tagline in their words, links (label and URL), and a photo file if they have one
- The language of those taglines

content/bios/*.json requires both "en" and "it". If they write one language, put that same text in both fields and tell them you did.

## Read before you write

After the fork is on disk, read these and follow them if they disagree with this prompt:

- content/site.json
- content/bios/demo.json
- src/content/site.ts
- src/content/bio.ts
- index.html
- worker/wrangler.toml
- docs/create.md
- docs/deploy/github-pages.md
- .github/workflows/deploy-site.yml

## Fork

1. Run gh auth status. If it fails, stop and tell them to run gh auth login with the repo scope. Do not invent a token.
2. If the fork already exists, clone it and use it. Otherwise:
   gh repo fork open-bio-page/open-bio-page --clone --default-branch-only --fork-name <name>
3. Work on that fork's master branch only.

## Files

Rewrite content/site.json. Set brand, domain (hostname only), origin (https://hostname), githubRepo (owner/name), copyrightOwner, adminTitle, privacyContactEmail, and the home, og, and seo copy from their words. Keep licensePath "LICENSE.md".

Delete content/bios/demo.json. Add content/bios/<slug>.json for each profile. Slug matches the filename. Shape:

{
  "slug": "ada",
  "name": "Ada Lovelace",
  "avatar": "",
  "site": "https://example.com",
  "siteCard": { "url": "https://example.com", "image": "", "enabled": true, "position": "before" },
  "layout": { "columns": 2 },
  "theme": {
    "primary": "#14151B",
    "secondary": "#2F4BE0",
    "glyphColor": "#3A5BFF",
    "font": "geist-sans",
    "cardRadius": 14,
    "avatarRadius": 9999,
    "avatarBorderWidth": 1,
    "avatarBorderColor": "#3A5BFF"
  },
  "content": {
    "en": { "eyebrow": "", "tagline": "" },
    "it": { "eyebrow": "", "tagline": "" }
  },
  "links": [
    { "id": "site", "label": { "en": "Site", "it": "Site" }, "href": "https://example.com", "primary": true, "external": true }
  ],
  "socials": []
}

Leave avatar "" when there is no photo. The page draws a letter. If they give an image, convert it to public/media/<slug>.webp and set avatar to "/media/<slug>.webp". One file is enough. Do not invent the 250, 600, and 2000 sizes.

Icons are Iconify ids, for example mdi:github. Omit the icon when you are not sure.

Write public/CNAME as one line, the hostname, no scheme and no path.

In index.html, set title, description, og:title, og:description, and og:url to the new brand and origin. Point og:image and twitter:image at https://<hostname>/og/home.jpg.

In worker/wrangler.toml set GITHUB_REPO and ALLOWED_ORIGIN. Leave the worker name "open-bio-page-admin" unless they ask to deploy admin and that name is already taken on their Cloudflare account.

Do not put secrets in any file you commit. Do not create a filled-in .env.

## Build, commit, push

From the fork:

bun install
bun run build

The build must pass before you commit. If it changes src/generated/icons.ts, include that file. Do not hand-edit it.

Commit only on the fork. One subject line, no body, no Co-Authored-By trailer. Example subject: feat: publish <brand> on <hostname>

Push to the fork's master.

## GitHub Pages

On the fork, not on open-bio-page/open-bio-page:

- Enable Actions if they are off:
  gh api --method PUT repos/<owner>/<repo>/actions/permissions -f enabled=true -f allowed_actions=all
- Create Pages from the workflow. .github/workflows/deploy-site.yml publishes dist/ on forks.
  gh api --method POST -H "Accept: application/vnd.github+json" repos/<owner>/<repo>/pages -f build_type=workflow
  If that answers 409, Pages already exists. PUT build_type=workflow and do not switch the source to a branch.
- Watch the "Deploy site" run. If it is waiting on the github-pages environment, tell them the Settings click. Do not cancel an in-flight deploy and push again in a loop.

DNS, only for records that serve this site. Grey cloud. proxied must be false. An orange-cloud record makes GitHub report NotServedByPagesError.

Apex (example.com):
- A records, all four: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- AAAA records, all four: 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153
- www CNAME to <owner>.github.io

Subdomain (links.example.com):
- One CNAME to <owner>.github.io
- Do not add A records on that name

If you can edit their DNS, create those records. If you cannot, print them for the user. The site has to live on their domain. username.github.io/<repo>/ is the wrong host for this build. Point Pages at the hostname either way:

gh api --method PUT -H "Accept: application/vnd.github+json" repos/<owner>/<repo>/pages -f cname='<hostname>'

Do not set https_enforced until the certificate state is approved. That can take about 15 minutes after DNS is right.

Check:

curl -sI --resolve <hostname>:443:185.199.108.153 https://<hostname>/

Done means the fork is pushed, Deploy site succeeded, and either HTTPS returns 200 with their brand in the title, or you have listed the DNS records that are still missing. Say what you did not do.

## Admin, only if they ask in this conversation

The public site does not need /admin. If they ask for it:

- bun worker/hash-password.ts <user> <slug> <password>
- ADMIN_USERS is a JSON array of those objects, one slug per user
- SESSION_SECRET is a long random string
- ADMIN_GITHUB_TOKEN is a fine-grained token with contents write on this fork only
- CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID for the worker deploy
- Put them in GitHub Actions secrets on the fork and in the Worker. Set the variable VITE_ADMIN_API to https://api.<hostname>
- The api host must be a subdomain of the public site, or the login cookie is blocked
- Do not print secret values back

Leave PostHog empty unless they hand you a key.`

export const EFamilyPrompt = `This site is for a family, or for one person.

The home page is a directory of the profiles they named. Set nameSuffix to the shared surname when the grid should show given names. Omit nameSuffix for a single person whose full name should stay.

Write one profile per person. Use their words for taglines. Short and personal. Do not add a company story they did not tell you.

${EShared}`

export const ECompanyPrompt = `This site is for a company or a business.

The home page is a directory of the profiles they named: staff, a single company profile, or both. Omit nameSuffix unless they ask to strip a shared suffix on the grid.

Copyright owner is the company. Use their words for taglines. Do not invent a product, a price, customers, or a slogan. If a tagline is missing, ask. Do not draft one and ship it as theirs.

${EShared}`
