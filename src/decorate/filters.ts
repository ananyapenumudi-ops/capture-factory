/**
 * Photo filters done with pixel maths rather than ctx.filter, which Safari
 * (and so every iPhone browser) does not support on canvas.
 */

export type FilterId = 'none' | 'bw' | 'sepia' | 'warm' | 'cool' | 'vintage'

/** `css` approximates the filter for the live thumbnail previews. */
export const FILTERS: { id: FilterId; name: string; css: string }[] = [
  { id: 'none', name: 'Original', css: 'none' },
  { id: 'bw', name: 'B&W', css: 'grayscale(1) contrast(1.15)' },
  { id: 'sepia', name: 'Sepia', css: 'sepia(0.9) contrast(1.05)' },
  { id: 'warm', name: 'Warm film', css: 'sepia(0.25) saturate(1.3) brightness(1.03)' },
  { id: 'cool', name: 'Cool', css: 'saturate(0.85) hue-rotate(12deg) brightness(1.05)' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(0.5) contrast(0.88) brightness(1.08) saturate(0.85)' },
]

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v)

export function applyFilter(ctx: CanvasRenderingContext2D, w: number, h: number, id: FilterId) {
  if (id === 'none') return
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]
    const g = d[i + 1]
    const b = d[i + 2]
    switch (id) {
      case 'bw': {
        const l = (0.299 * r + 0.587 * g + 0.114 * b - 128) * 1.15 + 128
        d[i] = d[i + 1] = d[i + 2] = clamp(l)
        break
      }
      case 'sepia':
        d[i] = clamp(0.393 * r + 0.769 * g + 0.189 * b)
        d[i + 1] = clamp(0.349 * r + 0.686 * g + 0.168 * b)
        d[i + 2] = clamp(0.272 * r + 0.534 * g + 0.131 * b)
        break
      case 'warm':
        d[i] = clamp(r * 1.08 + 12)
        d[i + 1] = clamp(g * 1.02 + 4)
        d[i + 2] = clamp(b * 0.86)
        break
      case 'cool':
        d[i] = clamp(r * 0.9)
        d[i + 1] = clamp(g * 1.0 + 4)
        d[i + 2] = clamp(b * 1.1 + 10)
        break
      case 'vintage': {
        // Half sepia, lifted blacks and a little film grain.
        const sr = 0.393 * r + 0.769 * g + 0.189 * b
        const sg = 0.349 * r + 0.686 * g + 0.168 * b
        const sb = 0.272 * r + 0.534 * g + 0.131 * b
        const grain = (Math.random() - 0.5) * 22
        d[i] = clamp(((r + sr) / 2) * 0.82 + 34 + grain)
        d[i + 1] = clamp(((g + sg) / 2) * 0.82 + 28 + grain)
        d[i + 2] = clamp(((b + sb) / 2) * 0.82 + 20 + grain)
        break
      }
    }
  }
  ctx.putImageData(img, 0, 0)

  if (id === 'vintage') {
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75)
    v.addColorStop(0, 'rgba(40,25,10,0)')
    v.addColorStop(1, 'rgba(40,25,10,0.45)')
    ctx.fillStyle = v
    ctx.fillRect(0, 0, w, h)
  }
}
