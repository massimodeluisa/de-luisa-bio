/**
 * Azure Functions (Node programming model v4) HTTP trigger adapter.
 * Register with `app.http('admin', { methods: [...], authLevel: 'anonymous', handler })`.
 */
import { handleRequest } from '../core/handler'
import { envFromProcess } from '../core/env'

interface IAzureRequest {
  method: string
  url: string
  headers: Record<string, string>
  text: () => Promise<string>
}

interface IAzureResponseInit {
  status: number
  headers?: Record<string, string>
  body?: string
}

export async function adminHttp(request: IAzureRequest): Promise<IAzureResponseInit> {
  const headers = new Headers(request.headers)
  const body =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text()
  const webRequest = new Request(request.url, {
    method: request.method,
    headers,
    body,
  })
  const response = await handleRequest(webRequest, envFromProcess())
  const outHeaders: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    outHeaders[key] = value
  })
  return {
    status: response.status,
    headers: outHeaders,
    body: await response.text(),
  }
}
