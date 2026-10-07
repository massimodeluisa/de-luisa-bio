# Serverless providers

The admin API is `server/core/handler.ts`. Each file in `server/adapters/` is a thin wrapper. Scoped auth, GitHub writes, and stats behave the same on every host.

## Free tiers, roughly

Numbers below are the vendors' published free allowances. Check them before you rely on one.

| Provider | Free tier | Entry |
| --- | --- | --- |
| Cloudflare Workers | Free request allowance, and custom domains on the free plan | `server/adapters/cloudflare.ts` and `worker/` |
| Vercel | Free serverless and edge functions | `server/adapters/vercel.ts` and `api/admin.ts` |
| Netlify | 125,000 function invocations per site per month, 100 GB bandwidth | `server/adapters/netlify.ts` and `netlify/functions/admin.ts` |
| AWS Lambda | 1M requests and 3.2M GB-seconds per month | `server/adapters/aws-lambda.ts` |
| Azure Functions | 1M requests per month on the consumption plan | `server/adapters/azure.ts` |

## The cookie rule

The admin page and the API have to share a registrable domain. `*.workers.dev`, `*.vercel.app`, and `*.netlify.app` are cross-site. Safari blocks the session cookie, and every call comes back 401. Put the API on something like `api.yourdomain.com`.

## Smoke test

```bash
bun worker/dev-server.ts
curl -s http://localhost:8787/me
# → {"error":"unauthorized"}
```

That 401 is what you want before anyone is logged in. The per-host notes are the next pages.
