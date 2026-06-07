import imageCompression from 'browser-image-compression'

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve(img)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

async function centerCropSquare(file: File): Promise<File> {
  const img = await loadImage(file)
  const side = Math.min(img.naturalWidth, img.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return file
  }
  ctx.drawImage(
    img,
    (img.naturalWidth - side) / 2,
    (img.naturalHeight - side) / 2,
    side,
    side,
    0,
    0,
    side,
    side,
  )
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.95),
  )
  return blob ? new File([blob], 'avatar.webp', { type: 'image/webp' }) : file
}

async function toWebp(square: File, maxSize: number | undefined, quality: number): Promise<string> {
  const compressed = await imageCompression(square, {
    ...(maxSize ? { maxWidthOrHeight: maxSize } : {}),
    fileType: 'image/webp',
    initialQuality: quality,
    useWebWorker: true,
  })
  const dataUrl = await imageCompression.getDataUrlFromFile(compressed)
  return dataUrl.split(',')[1] ?? ''
}

export interface IAvatarDerivative {
  suffix: string
  base64: string
}

const SIZES = [2000, 600, 250] as const

export async function generateAvatarSet(
  file: File,
): Promise<{ derivatives: IAvatarDerivative[]; previewDataUrl: string }> {
  const square = await centerCropSquare(file)
  const original: IAvatarDerivative = {
    suffix: 'original',
    base64: await toWebp(square, undefined, 0.95),
  }
  const derivatives: IAvatarDerivative[] = [original]
  for (const size of SIZES) {
    derivatives.push({ suffix: String(size), base64: await toWebp(square, size, 0.9) })
  }
  const preview = derivatives.find((d) => d.suffix === '600') ?? original
  return { derivatives, previewDataUrl: `data:image/webp;base64,${preview.base64}` }
}
