# Cloudflare Workers

This is the path the template is set up for.

- Adapter: `server/adapters/cloudflare.ts`
- Worker package: `worker/` (`wrangler.toml`, `src/index.ts` re-exports the core)
- Local: `bun worker/dev-server.ts`

## Deploy

```bash
cd worker
bunx wrangler deploy --config wrangler.toml
bunx wrangler secret put SESSION_SECRET
bunx wrangler secret put GITHUB_TOKEN
bunx wrangler secret put POSTHOG_READ_KEY
bunx wrangler secret put ADMIN_USERS
```

In the Worker dashboard, add a custom domain `api.<your-domain>`.

## CI

`.github/workflows/deploy-worker.yml` deploys on changes under `worker/` and `server/` for a fork. The upstream repository does not deploy a Worker.
