/**
 * Vercel Serverless / Edge Function adapter.
 * Place as `api/admin/[...path].ts` or import from a Vercel API route.
 *
 * Env: set the same secrets as Variables in the Vercel project dashboard.
 * Cookie auth requires the API to be served on a same-site subdomain
 * (e.g. api.yourdomain.com → this function, site on yourdomain.com).
 */
import { handleRequest } from '../core/handler'
import { envFromProcess } from '../core/env'

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request): Promise<Response> {
  return handleRequest(request, envFromProcess())
}
