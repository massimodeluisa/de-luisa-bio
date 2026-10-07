/**
 * AWS Lambda Function URL / API Gateway HTTP API adapter (Payload 2.0).
 * Uses the Web Fetch handler shape available on Node 18+ Lambda runtimes.
 */
import { handleRequest } from '../core/handler'
import { envFromProcess } from '../core/env'

interface ILambdaEvent {
  rawPath?: string
  rawQueryString?: string
  headers?: Record<string, string | undefined>
  requestContext?: { http?: { method?: string; path?: string } }
  body?: string | null
  isBase64Encoded?: boolean
  cookies?: string[]
}

interface ILambdaResult {
  statusCode: number
  headers?: Record<string, string>
  body: string
  isBase64Encoded?: boolean
  cookies?: string[]
}

function eventToRequest(event: ILambdaEvent): Request {
  const method = event.requestContext?.http?.method ?? 'GET'
  const path = event.rawPath ?? event.requestContext?.http?.path ?? '/'
  const qs = event.rawQueryString ? `?${event.rawQueryString}` : ''
  const headers = new Headers()
  for (const [k, v] of Object.entries(event.headers ?? {})) {
    if (v) {
      headers.set(k, v)
    }
  }
  if (event.cookies?.length) {
    headers.set('cookie', event.cookies.join('; '))
  }
  const host = headers.get('host') ?? 'localhost'
  const url = `https://${host}${path}${qs}`
  const body =
    method === 'GET' || method === 'HEAD'
      ? undefined
      : event.isBase64Encoded && event.body
        ? Buffer.from(event.body, 'base64')
        : (event.body ?? undefined)
  return new Request(url, { method, headers, body })
}

async function responseToResult(res: Response): Promise<ILambdaResult> {
  const headers: Record<string, string> = {}
  const cookies: string[] = []
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      cookies.push(value)
      return
    }
    headers[key] = value
  })
  const body = await res.text()
  return {
    statusCode: res.status,
    headers,
    body,
    cookies: cookies.length ? cookies : undefined,
  }
}

export async function handler(event: ILambdaEvent): Promise<ILambdaResult> {
  const request = eventToRequest(event)
  const response = await handleRequest(request, envFromProcess())
  return responseToResult(response)
}
