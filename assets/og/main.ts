/// <reference types="vite/client" />
import EMarkUrl from '../mark-dark-rounded.svg?url'

/** Four full rows of eight columns. */
const ECellCount = 32

const EPortraits = Object.entries(
  import.meta.glob<string>('../../examples/*/public/media/*.webp', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)
  .sort(([a], [b]) => (a < b ? -1 : 1))
  .map(([, url]) => url)

const EMark = document.querySelector<HTMLImageElement>('.mark')
if (EMark) {
  EMark.src = EMarkUrl
}

const EMosaic = document.querySelector<HTMLElement>('.mosaic')
if (EMosaic && EPortraits.length) {
  EMosaic.append(
    ...Array.from({ length: ECellCount }, (_, index) => {
      const tile = document.createElement('img')
      tile.src = EPortraits[index % EPortraits.length] ?? ''
      tile.alt = ''
      return tile
    }),
  )
}

function framesReady(): boolean {
  const images = [...document.querySelectorAll('img')]
  return images.length > 0 && images.every((image) => image.complete)
}

function markReady(): void {
  if (framesReady()) {
    document.body.dataset.ready = '1'
    return
  }
  requestAnimationFrame(markReady)
}

requestAnimationFrame(markReady)
