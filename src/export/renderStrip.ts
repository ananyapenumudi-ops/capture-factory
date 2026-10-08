import type { Layout, Rect } from '../booth/layouts'
import { applyFilter, type FilterId } from '../decorate/filters'
import { getFrame, seeded, type FrameId, type TicketTheme } from '../decorate/frames'
import type { Shot } from '../store/session'

const INK = '#2B2522'
const DISPLAY = 'Playfair Display'
const MONO = 'Courier Prime'

async function loadFonts() {
  try {
    await Promise.all([
      document.fonts.load(`900 80px "${DISPLAY}"`),
      document.fonts.load(`italic 700 40px "${DISPLAY}"`),
      document.fonts.load(`700 40px "${MONO}"`),
    ])
  } catch {
    // Fall back to system fonts if Google Fonts is blocked.
  }
}

function roundRect(ctx: CanvasRenderingContext2D, r: Rect, radius: number) {
  ctx.beginPath()
  ctx.roundRect(r.x, r.y, r.w, r.h, radius)
}

/** An "Admit One" ticket stub with side notches, a perforated stub and a serial number. */
function drawTicket(ctx: CanvasRenderingContext2D, r: Rect, serial: string, date: Date, theme: TicketTheme) {
  const { x, y, w, h } = r
  const notch = h * 0.13
  const cy = y + h / 2
  const R = 18
  const stubW = Math.min(w * 0.3, 300)
  const stubX = x + w - stubW

  ctx.save()
  ctx.lineWidth = 6
  ctx.strokeStyle = INK
  ctx.fillStyle = theme.bg
  ctx.beginPath()
  ctx.moveTo(x + R, y)
  ctx.arcTo(x + w, y, x + w, y + h, R)
  ctx.lineTo(x + w, cy - notch)
  ctx.arc(x + w, cy, notch, -Math.PI / 2, Math.PI / 2, true)
  ctx.arcTo(x + w, y + h, x, y + h, R)
  ctx.arcTo(x, y + h, x, y, R)
  ctx.lineTo(x, cy + notch)
  ctx.arc(x, cy, notch, Math.PI / 2, -Math.PI / 2, true)
  ctx.arcTo(x, y, x + w, y, R)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Inner dashed border, like a printed ticket.
  ctx.setLineDash([12, 10])
  ctx.lineWidth = 3
  ctx.strokeStyle = theme.fg
  ctx.globalAlpha = 0.55
  ctx.strokeRect(x + notch + 18, y + 20, stubX - x - notch - 36, h - 40)
  ctx.globalAlpha = 1

  // Perforation between body and stub.
  ctx.setLineDash([14, 12])
  ctx.lineWidth = 5
  ctx.strokeStyle = INK
  ctx.beginPath()
  ctx.moveTo(stubX, y + 20)
  ctx.lineTo(stubX, y + h - 20)
  ctx.stroke()
  ctx.setLineDash([])

  const bodyCx = x + notch + (stubX - x - notch) / 2
  ctx.textAlign = 'center'
  ctx.fillStyle = theme.fg
  ctx.font = `700 ${Math.round(h * 0.1)}px "${MONO}", monospace`
  ctx.fillText('★ CAPTURE FACTORY ★', bodyCx, y + h * 0.28)

  ctx.font = `900 ${Math.round(h * 0.3)}px "${DISPLAY}", Georgia, serif`
  ctx.fillText('ADMIT ONE', bodyCx, y + h * 0.65, stubX - x - notch * 2 - 40)

  ctx.font = `700 ${Math.round(h * 0.085)}px "${MONO}", monospace`
  const when = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  ctx.fillText(`ISSUED ${when.toUpperCase()}`, bodyCx, y + h * 0.84)

  // Stub: the serial number, rotated like a real ticket.
  ctx.translate(stubX + stubW / 2, cy)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = theme.accent
  ctx.font = `700 ${Math.round(h * 0.09)}px "${MONO}", monospace`
  ctx.fillText('№', 0, -stubW * 0.14)
  ctx.font = `700 ${Math.round(h * 0.1)}px "${MONO}", monospace`
  ctx.fillText(serial, 0, stubW * 0.16)
  ctx.restore()
}

/** Photo with its filter applied, at slot size. */
async function filteredPhoto(shot: Shot, w: number, h: number, filter: FilterId): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(shot.blob)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(bmp, 0, 0, w, h)
  bmp.close()
  applyFilter(ctx, w, h, filter)
  return c
}

export type StripOptions = {
  layout: Layout
  shots: Shot[]
  serial: string
  frameId: FrameId
  filterId: FilterId
  date?: Date
}

/** The strip without stickers: frame background, filtered photos and the ticket stub. */
export async function renderBase({ layout, shots, serial, frameId, filterId, date = new Date() }: StripOptions) {
  await loadFonts()
  const frame = getFrame(frameId)
  const canvas = document.createElement('canvas')
  canvas.width = layout.width
  canvas.height = layout.height
  const ctx = canvas.getContext('2d')!

  frame.paint(ctx, layout.width, layout.height, seeded(7))

  const photos = await Promise.all(shots.map((s) => filteredPhoto(s, layout.slotW, layout.slotH, filterId)))
  layout.slots.forEach((slot, i) => {
    const photo = photos[i]
    if (!photo) return
    ctx.save()
    roundRect(ctx, slot, 8)
    ctx.clip()
    ctx.drawImage(photo, slot.x, slot.y, slot.w, slot.h)
    ctx.restore()
    if (frame.photoBorder) {
      ctx.lineWidth = 8
      ctx.strokeStyle = frame.photoBorder
      roundRect(ctx, slot, 8)
      ctx.stroke()
    }
  })

  drawTicket(ctx, layout.footer, serial, date, frame.ticket)
  return canvas
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not render strip'))), 'image/png'),
  )
}
