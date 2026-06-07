export function letterGlyphSvg(letter: string | undefined, color: string, radius = 0): string {
  const ch = (letter || '?').slice(0, 1).toUpperCase()
  return (
    `<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>` +
    `<rect width='100' height='100' rx='${radius}' fill='${color}'/>` +
    `<text x='50' y='50' dy='.35em' text-anchor='middle' ` +
    `font-family='Geist, ui-sans-serif, system-ui, sans-serif' ` +
    `font-size='58' font-weight='700' fill='#ffffff'>${ch}</text></svg>`
  )
}

export function letterGlyphDataUri(letter: string | undefined, color: string, radius = 0): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(letterGlyphSvg(letter, color, radius))}`
}

export const FAVICON_RADIUS = 22
