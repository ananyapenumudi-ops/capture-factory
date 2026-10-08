type Source = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap

function sourceSize(src: Source): { w: number; h: number } {
  if (src instanceof HTMLVideoElement) return { w: src.videoWidth, h: src.videoHeight }
  if (src instanceof HTMLImageElement) return { w: src.naturalWidth, h: src.naturalHeight }
  return { w: src.width, h: src.height }
}

/**
 * Crops the centre of `src` to the target aspect ratio (like CSS object-fit: cover)
 * and renders it at exactly w×h. Camera shots are mirrored so they match the preview.
 */
export function cropToBlob(src: Source, w: number, h: number, mirror: boolean): Promise<Blob> {
  const { w: sw0, h: sh0 } = sourceSize(src)
  const scale = Math.max(w / sw0, h / sh0)
  const sw = w / scale
  const sh = h / scale
  const sx = (sw0 - sw) / 2
  const sy = (sh0 - sh) / 2

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  if (mirror) {
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
  }
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, w, h)

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode photo'))), 'image/jpeg', 0.92),
  )
}

export async function fileToBlob(file: File, w: number, h: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    return await cropToBlob(bitmap, w, h, false)
  } finally {
    bitmap.close()
  }
}
