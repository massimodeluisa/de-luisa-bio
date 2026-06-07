
const PBKDF2_ITERATIONS = 100_000

const encoder = new TextEncoder()

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) {
    bin += String.fromCharCode(b)
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlEncodeStr(str: string): string {
  return b64urlEncode(encoder.encode(str))
}

function b64urlDecodeStr(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)
  return atob(padded)
}

export async function pbkdf2(password: string, saltHex: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex) as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  )
  return bytesToHex(new Uint8Array(bits))
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export function randomSaltHex(bytes = 16): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(bytes)))
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export interface ISessionPayload {
  user: string
  slug: string
  exp: number
}

export async function signSession(payload: ISessionPayload, secret: string): Promise<string> {
  const header = b64urlEncodeStr(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64urlEncodeStr(JSON.stringify(payload))
  const data = `${header}.${body}`
  const key = await hmacKey(secret)
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(data)))
  return `${data}.${b64urlEncode(sig)}`
}

export async function verifySession(token: string, secret: string): Promise<ISessionPayload | null> {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }
  const [header, body, sig] = parts
  const data = `${header}.${body}`
  const key = await hmacKey(secret)
  const expected = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(data)))
  if (!timingSafeEqual(b64urlEncode(expected), sig)) {
    return null
  }
  try {
    const payload = JSON.parse(b64urlDecodeStr(body)) as ISessionPayload
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) {
      return null
    }
    return payload
  } catch {
    return null
  }
}
