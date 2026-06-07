import type { TFont } from '@/content/bio'

export const FONT_STACK: Record<TFont, string> = {
  'geist-sans': "'Geist Sans', ui-sans-serif, system-ui, sans-serif",
  inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
  'geist-mono': "'Geist Mono', ui-monospace, SFMono-Regular, monospace",
  fraunces: "'Fraunces', ui-serif, Georgia, serif",
  'space-grotesk': "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
}

const loaded = new Set<TFont>()

export async function loadFont(font: TFont): Promise<void> {
  if (typeof document === 'undefined' || loaded.has(font)) {
    return
  }
  loaded.add(font)
  switch (font) {
    case 'inter':
      await import('@fontsource/inter')
      break
    case 'geist-sans':
      await import('@fontsource/geist-sans')
      break
    case 'geist-mono':
      await import('@fontsource/geist-mono')
      break
    case 'fraunces':
      await import('@fontsource/fraunces')
      break
    case 'space-grotesk':
      await import('@fontsource/space-grotesk')
      break
  }
}
