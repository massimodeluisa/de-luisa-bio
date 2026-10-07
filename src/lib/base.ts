const PASSTHROUGH = /^(https?:|\/\/|data:|blob:|mailto:|tel:|#)/i

export function withBase(path: string): string {
  if (PASSTHROUGH.test(path) || !path.startsWith('/')) {
    return path
  }
  return `${import.meta.env.BASE_URL.replace(/\/+$/, '')}${path}`
}
