/**
 * Netlify Function adapter (Functions v2 / Edge-compatible Request/Response).
 * Netlify maps `/.netlify/functions/admin` — use a redirect for `/api/*`.
 */
import { handleRequest } from '../core/handler'
import { envFromProcess } from '../core/env'

export default async function handler(request: Request): Promise<Response> {
  return handleRequest(request, envFromProcess())
}

export const config = {
  path: '/api/*',
}
