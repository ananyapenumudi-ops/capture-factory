import { getSticker, svgUrl } from './stickers'

/** White die-cut border width, in strip pixels. */
export const DIE_CUT = 10
/** Stickers are rasterised at this multiple of their nominal size so they stay crisp when scaled up. */
const RES = 2

const cache = new Map<string, Promise<HTMLCanvasElement>>()

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Sticker failed to load'))
    img.src = src
  })
}

/**
 * Draws a sticker with a white die-cut border: the artwork's silhouette is stamped
 * in a ring of offsets, filled white, and the artwork is drawn on top.
 * Returns a canvas at RES× the nominal size (nominal size + border on each side).
 */
async function build(id: string): Promise<HTMLCanvasElement> {
  const def = getSticker(id)
  if (!def) throw new Error(`Unknown sticker ${id}`)
  const img = await loadImage(svgUrl(def.svg))
  const pad = DIE_CUT * RES
  const w = def.w * RES
  const h = def.h * RES

  const out = document.createElement('canvas')
  out.width = w + pad * 2
  out.height = h + pad * 2
  const ctx = out.getContext('2d')!

  const steps = 24
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2
    ctx.drawImage(img, pad + Math.cos(a) * pad, pad + Math.sin(a) * pad, w, h)
  }
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = '#FFFDF6'
  ctx.fillRect(0, 0, out.width, out.height)
  ctx.globalCompositeOperation = 'source-over'
  ctx.drawImage(img, pad, pad, w, h)
  return out
}

export function stickerCanvas(id: string): Promise<HTMLCanvasElement> {
  let p = cache.get(id)
  if (!p) {
    p = build(id)
    cache.set(id, p)
    p.catch(() => cache.delete(id))
  }
  return p
}

/** Nominal on-strip size of a sticker including its border (before user scaling). */
export function stickerSize(id: string): { w: number; h: number } {
  const def = getSticker(id)
  return def ? { w: def.w + DIE_CUT * 2, h: def.h + DIE_CUT * 2 } : { w: 100, h: 100 }
}

export const STICKER_RES = RES
