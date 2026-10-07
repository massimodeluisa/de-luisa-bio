# Vercel

- Adapter: `server/adapters/vercel.ts` (Edge runtime)
- Route entry: `api/admin.ts`

## Setup

1. Import the GitHub repo into Vercel (static output = `dist` after `bun run build`)
2. Set env vars from `secrets.local.example` on the Vercel project
3. Map `api.yourdomain.com` to the deployment (or rewrite `/api/*` to `api/admin`)
4. Set site `VITE_ADMIN_API` to that API origin

```ts
// api/admin.ts
export { default, config } from '../server/adapters/vercel'
```

## Notes

- Use Edge when possible for Web `Request`/`Response` parity with the shared handler
- Confirm `Set-Cookie` reaches the browser on your custom API domain
