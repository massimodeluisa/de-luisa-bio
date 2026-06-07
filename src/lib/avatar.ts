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
    return { src: avatar }
  }
  const srcset = AVATAR_WIDTHS.map((w) => `${avatar}-${w}.webp ${w}w`).join(', ')
  return { src: `${avatar}-600.webp`, srcset }
}
