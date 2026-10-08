/**
 * Strip frames, painted procedurally onto the strip canvas so they scale to any
 * layout. Each frame also styles the photo borders and the ticket stub.
 */

export type FrameId =
  | 'dossier'
  | 'kraft'
  | 'gingham-blue'
  | 'gingham-lilac'
  | 'gingham-peach'
  | 'cherries'
  | 'bows'
  | 'leopard'
  | 'lips'
  | 'plaid'
  | 'film'
  | 'noir'

export type TicketTheme = { bg: string; fg: string; accent: string }

export type Frame = {
  id: FrameId
  name: string
  /** CSS background used for the swatch in the picker. */
  swatch: string
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number, rand: () => number) => void
  photoBorder: string | null
  ticket: TicketTheme
}

const INK = '#2B2522'
const PAPER = '#F4ECD8'
const RED = '#C8282E'

/** Small deterministic PRNG so a frame's pattern looks the same on every render. */
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, rand: () => number, color: string, count: number) {
  ctx.fillStyle = color
  for (let i = 0; i < count; i++) {
    const r = rand() * 1.8 + 0.4
    ctx.globalAlpha = rand() * 0.35 + 0.05
    ctx.beginPath()
    ctx.arc(rand() * w, rand() * h, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function gingham(color: string, base = '#FFFFFF', size = 46) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = color
    ctx.globalAlpha = 0.5
    for (let x = 0; x < w; x += size * 2) ctx.fillRect(x, 0, size, h)
    for (let y = 0; y < h; y += size * 2) ctx.fillRect(0, y, w, size)
    ctx.globalAlpha = 1
  }
}

/** Draws an SVG path string centred on (x, y), scaled from a 100-unit box. */
function motif(ctx: CanvasRenderingContext2D, d: string, x: number, y: number, size: number, rot: number, fill: string, stroke = INK) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.scale(size / 100, size / 100)
  ctx.translate(-50, -50)
  const p = new Path2D(d)
  ctx.fillStyle = fill
  ctx.fill(p)
  if (stroke) {
    ctx.lineWidth = 5
    ctx.lineJoin = 'round'
    ctx.strokeStyle = stroke
    ctx.stroke(p)
  }
  ctx.restore()
}

/** Scatter a motif on a staggered grid with a little jitter. */
function scatter(w: number, h: number, step: number, rand: () => number, draw: (x: number, y: number, rot: number) => void) {
  let row = 0
  for (let y = step / 2; y < h + step; y += step * 0.86, row++) {
    for (let x = (row % 2 ? step : step / 2) - step / 2; x < w + step; x += step) {
      draw(x + (rand() - 0.5) * step * 0.25, y + (rand() - 0.5) * step * 0.25, (rand() - 0.5) * 0.7)
    }
  }
}

const CHERRY_STEM = 'M30 64 C36 40 50 22 66 10 M66 10 C70 34 70 52 70 68'
const BOW = 'M50 44 C34 18 8 16 8 38 C8 60 36 60 50 52 C64 60 92 60 92 38 C92 16 66 18 50 44Z M46 52 L30 92 L42 86 L48 94 L52 56Z M54 52 L70 92 L58 86 L52 94 L48 56Z'
const LIPS = 'M6 50 C22 26 40 20 50 32 C60 20 78 26 94 50 C78 78 62 82 50 80 C38 82 22 78 6 50Z'

export const FRAMES: Frame[] = [
  {
    id: 'dossier',
    name: 'Dossier',
    swatch: 'repeating-linear-gradient(#E6D6B8 0 9px, #d8c6a4 9px 10px)',
    paint: (ctx, w, h, rand) => {
      ctx.fillStyle = '#E6D6B8'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(43,37,34,0.12)'
      ctx.lineWidth = 2
      for (let y = 40; y < h; y += 44) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(200,40,46,0.35)'
      ctx.beginPath()
      ctx.moveTo(48, 0)
      ctx.lineTo(48, h)
      ctx.stroke()
      speckle(ctx, w, h, rand, '#6B4F3A', 1600)
    },
    photoBorder: INK,
    ticket: { bg: RED, fg: PAPER, accent: PAPER },
  },
  {
    id: 'kraft',
    name: 'Kraft',
    swatch: '#8A6A50',
    paint: (ctx, w, h, rand) => {
      ctx.fillStyle = '#8A6A50'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(40,25,15,0.18)'
      ctx.lineWidth = 1.5
      for (let i = 0; i < 900; i++) {
        const x = rand() * w
        const y = rand() * h
        const len = rand() * 30 + 6
        const a = rand() * Math.PI
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
        ctx.stroke()
      }
      speckle(ctx, w, h, rand, '#F4ECD8', 900)
    },
    photoBorder: INK,
    ticket: { bg: PAPER, fg: INK, accent: RED },
  },
  { id: 'gingham-blue', name: 'Blue gingham', swatch: 'repeating-conic-gradient(#9DB7E0 0 25%, #fff 0 50%) 0 0/14px 14px', paint: gingham('#7FA0D6'), photoBorder: '#FFFFFF', ticket: { bg: '#9DB7E0', fg: INK, accent: '#FFFFFF' } },
  { id: 'gingham-lilac', name: 'Lilac gingham', swatch: 'repeating-conic-gradient(#C3AEDD 0 25%, #fff 0 50%) 0 0/14px 14px', paint: gingham('#AE93D3'), photoBorder: '#FFFFFF', ticket: { bg: '#C3AEDD', fg: INK, accent: '#FFFFFF' } },
  { id: 'gingham-peach', name: 'Peach gingham', swatch: 'repeating-conic-gradient(#F4B98A 0 25%, #fff 0 50%) 0 0/14px 14px', paint: gingham('#F2A66B'), photoBorder: '#FFFFFF', ticket: { bg: '#F4B98A', fg: INK, accent: '#FFFFFF' } },
  {
    id: 'cherries',
    name: 'Cherries',
    swatch: 'radial-gradient(circle at 35% 60%, #C8282E 0 3px, transparent 4px) 0 0/12px 12px, #FBF1E6',
    paint: (ctx, w, h, rand) => {
      ctx.fillStyle = '#FBF1E6'
      ctx.fillRect(0, 0, w, h)
      scatter(w, h, 130, rand, (x, y, r) => {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(r)
        ctx.scale(0.55, 0.55)
        ctx.translate(-50, -50)
        ctx.lineWidth = 5
        ctx.strokeStyle = '#4E7A3A'
        ctx.stroke(new Path2D(CHERRY_STEM))
        ctx.fillStyle = RED
        for (const [cx, cy] of [
          [30, 82],
          [70, 86],
        ]) {
          ctx.beginPath()
          ctx.arc(cx, cy, 18, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      })
    },
    photoBorder: RED,
    ticket: { bg: RED, fg: '#FBF1E6', accent: '#FBF1E6' },
  },
  {
    id: 'bows',
    name: 'Bows',
    swatch: '#F3C9CF',
    paint: (ctx, w, h, rand) => {
      ctx.fillStyle = '#F3C9CF'
      ctx.fillRect(0, 0, w, h)
      scatter(w, h, 150, rand, (x, y, r) => motif(ctx, BOW, x, y, 70, r * 0.6, 'rgba(0,0,0,0)', '#B5323F'))
    },
    photoBorder: '#B5323F',
    ticket: { bg: '#FFF4F2', fg: '#B5323F', accent: '#B5323F' },
  },
  {
    id: 'leopard',
    name: 'Leopard',
    swatch: 'radial-gradient(circle, #4A3020 0 3px, transparent 4px) 0 0/11px 11px, #C9A27E',
    paint: (ctx, w, h, rand) => {
      ctx.fillStyle = '#C9A27E'
      ctx.fillRect(0, 0, w, h)
      const n = Math.round((w * h) / 5200)
      for (let i = 0; i < n; i++) {
        const x = rand() * w
        const y = rand() * h
        const rx = rand() * 16 + 12
        const ry = rx * (rand() * 0.4 + 0.7)
        const rot = rand() * Math.PI
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rot)
        ctx.fillStyle = '#9C6B42'
        ctx.beginPath()
        ctx.ellipse(0, 0, rx * 0.7, ry * 0.7, 0, 0, Math.PI * 2)
        ctx.fill()
        // A broken ring of dark spots around each rosette.
        ctx.strokeStyle = '#3D2616'
        ctx.lineWidth = rx * 0.38
        ctx.lineCap = 'round'
        const start = rand() * Math.PI * 2
        for (let k = 0; k < 3; k++) {
          ctx.beginPath()
          ctx.ellipse(0, 0, rx, ry, 0, start + k * 2.1, start + k * 2.1 + 1.3)
          ctx.stroke()
        }
        ctx.restore()
      }
    },
    photoBorder: INK,
    ticket: { bg: INK, fg: '#E8C79E', accent: '#E8C79E' },
  },
  {
    id: 'lips',
    name: 'Kisses',
    swatch: 'radial-gradient(ellipse 5px 3px, #D4243A 90%, transparent) 0 0/13px 13px, #FFF8F6',
    paint: (ctx, w, h, rand) => {
      ctx.fillStyle = '#FFF8F6'
      ctx.fillRect(0, 0, w, h)
      scatter(w, h, 140, rand, (x, y, r) => {
        ctx.globalAlpha = 0.75 + rand() * 0.25
        motif(ctx, LIPS, x, y, 78, r, '#D4243A', '')
        ctx.globalAlpha = 1
      })
    },
    photoBorder: '#FFFFFF',
    ticket: { bg: '#D4243A', fg: '#FFF8F6', accent: '#FFF8F6' },
  },
  {
    id: 'plaid',
    name: 'Plaid',
    swatch: 'repeating-linear-gradient(90deg, rgba(43,37,34,.35) 0 4px, transparent 4px 14px), repeating-linear-gradient(rgba(43,37,34,.35) 0 4px, transparent 4px 14px), #B23A36',
    paint: (ctx, w, h) => {
      ctx.fillStyle = '#B23A36'
      ctx.fillRect(0, 0, w, h)
      const bands: [number, number, string][] = [
        [0, 40, 'rgba(43,37,34,0.38)'],
        [70, 10, 'rgba(244,236,216,0.45)'],
        [100, 18, 'rgba(43,37,34,0.3)'],
      ]
      const period = 160
      for (const [off, size, color] of bands) {
        ctx.fillStyle = color
        for (let x = off; x < w; x += period) ctx.fillRect(x, 0, size, h)
        for (let y = off; y < h; y += period) ctx.fillRect(0, y, w, size)
      }
    },
    photoBorder: PAPER,
    ticket: { bg: PAPER, fg: '#B23A36', accent: INK },
  },
  {
    id: 'film',
    name: 'Film strip',
    swatch: 'repeating-linear-gradient(#e9dfcf 0 4px, #1c1a19 4px 10px) left/5px 100% no-repeat, repeating-linear-gradient(#e9dfcf 0 4px, #1c1a19 4px 10px) right/5px 100% no-repeat, #1c1a19',
    paint: (ctx, w, h) => {
      ctx.fillStyle = '#1C1A19'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#E9DFCF'
      for (let y = 20; y < h - 20; y += 58) {
        for (const x of [18, w - 50]) {
          ctx.beginPath()
          ctx.roundRect(x, y, 32, 26, 5)
          ctx.fill()
        }
      }
      ctx.fillStyle = '#E58A2E'
      ctx.font = `700 22px 'Courier Prime', 'Courier New', monospace`
      for (let y = 140; y < h - 60; y += 420) {
        ctx.save()
        ctx.translate(56, y)
        ctx.rotate(Math.PI / 2)
        ctx.fillText(`CAPTURE 400  ▸ ${Math.round(y / 420) + 1}A`, 0, 0)
        ctx.restore()
      }
    },
    photoBorder: null,
    ticket: { bg: '#E58A2E', fg: '#1C1A19', accent: '#1C1A19' },
  },
  {
    id: 'noir',
    name: 'Noir',
    swatch: '#3A3634',
    paint: (ctx, w, h, rand) => {
      ctx.fillStyle = '#3A3634'
      ctx.fillRect(0, 0, w, h)
      speckle(ctx, w, h, rand, '#F4ECD8', 1400)
    },
    photoBorder: PAPER,
    ticket: { bg: PAPER, fg: INK, accent: RED },
  },
]

export function getFrame(id: FrameId): Frame {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0]
}
