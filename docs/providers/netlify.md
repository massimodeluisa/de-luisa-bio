# Netlify

- Adapter: `server/adapters/netlify.ts`
- Function: `netlify/functions/admin.ts`
- Free tier: ~125k function invocations / site / month + 100GB bandwidth

## Setup

1. Build command `bun run build`, publish directory `dist`
2. Configure function env vars (same names as `secrets.local.example`)
3. Redirect `/api/*` → `/.netlify/functions/admin`
4. Custom domain for the site + API host for cookies

```toml
# netlify.toml (example)
[build]
  command = "bun run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/admin"
  status = 200
  force = true
```
