export const IS_DEMO_INSTANCE = import.meta.env.VITE_DEMO_INSTANCE === 'true'

export const ROBOTS_CONTENT = IS_DEMO_INSTANCE
  ? 'noindex, nofollow'
  : 'index, follow, max-image-preview:large'
