import type { IBioTheme } from '@/content/bio'
import { FONT_STACK } from '@/lib/load-font'

export function bioThemeStyle(theme: IBioTheme): Record<string, string> {
  return {
    '--site-primary': theme.primary,
    '--site-secondary': theme.secondary,
    '--bio-card-radius': `${theme.cardRadius}px`,
    '--bio-avatar-radius': `${theme.avatarRadius}px`,
    '--bio-avatar-border': `${theme.avatarBorderWidth}px solid ${theme.avatarBorderColor}`,
    fontFamily: FONT_STACK[theme.font],
  }
}
