# AWS Lambda

- Adapter: `server/adapters/aws-lambda.ts`
- Free tier: 1M requests + 3.2M GB-seconds / month

## Setup

1. Bundle the adapter with your preferred tool (esbuild / OpenTofu / SST / SAM)
2. Use a **Function URL** or HTTP API (payload 2.0)
3. Node 18+ runtime (Web Crypto + Fetch)
4. Set environment variables from `secrets.local.example`
5. Put CloudFront or API Gateway on `api.yourdomain.com`

```ts
import { handler } from './server/adapters/aws-lambda'
export { handler }
```

The adapter converts API Gateway / Function URL events to `Request` and back.
