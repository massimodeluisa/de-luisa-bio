# Serverless providers

The admin API lives in `server/core/handler.ts`. Each provider file in `server/adapters/` is a thin wrapper. Behaviour (scoped auth, GitHub writes, stats) is identical.

## Free-tier snapshot (indicative)

| Provider | Free tier notes | Entry |
| --- | --- | --- |
| **Cloudflare Workers** | Large free request allowance; first-party custom domains | `server/adapters/cloudflare.ts` + `worker/` |
| **Vercel** | Free serverless/edge functions; excellent DX | `server/adapters/vercel.ts` + `api/admin.ts` |
| **Netlify** | 125,000 function invocations / site / month; 100GB bandwidth | `server/adapters/netlify.ts` + `netlify/functions/admin.ts` |
| **AWS Lambda** | 1M requests + 3.2M GB-seconds / month | `server/adapters/aws-lambda.ts` |
| **Azure Functions** | 1M requests / month on consumption plan | `server/adapters/azure.ts` |

## Cookie rule (all providers)

The browser admin SPA and the API must share a registrable domain. A `*.workers.dev`, `*.vercel.app`, or `*.netlify.app` API host is cross-site — Safari will block the session cookie and every call 401s. Always bind a custom domain like `api.yourdomain.com`.

## Shared smoke test

```bash
bun worker/dev-server.ts
curl -s http://localhost:8787/me
# → {"error":"unauthorized"}
```

Provider-specific guides follow in this section.
