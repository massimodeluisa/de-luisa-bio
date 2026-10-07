# Azure Functions

- Adapter: `server/adapters/azure.ts`
- Entry stub: `api-azure/admin.ts`
- Free tier: 1M requests / month on the consumption plan

## Setup

1. Node programming model v4
2. Register an anonymous HTTP function that calls `adminHttp`
3. Set app settings from `secrets.local.example`
4. Bind a custom domain for cookie auth

```ts
import { app } from '@azure/functions'
import { adminHttp } from '../api-azure/admin'

app.http('admin', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: adminHttp,
})
```
