import { withBase } from '@/lib/base'

export const AVATAR_WIDTHS = [250, 600, 2000] as const

export interface IAvatarSources {
  src: string
  srcset?: string
}

const HAS_EXT = /\.(webp|png|jpe?g|avif)$/i

export function avatarSources(avatar: string | undefined): IAvatarSources | null {
  if (!avatar) {
    return null
  }
  if (HAS_EXT.test(avatar)) {
    return { src: withBase(avatar) }
  }
  const srcset = AVATAR_WIDTHS.map((w) => `${withBase(`${avatar}-${w}.webp`)} ${w}w`).join(', ')
  return { src: withBase(`${avatar}-600.webp`), srcset }
}
