import type { Layout, Rect } from '../booth/layouts'
import type { Shot } from '../store/session'

const CREAM = '#F4EBDD'
const INK = '#1E1E1E'
const BUBBLEGUM = '#EE6FA8'
const BUTTER = '#F7C948'

const DISPLAY = 'Shrikhand'
const SANS = 'Poppins'

async function loadFonts() {
  try {
    await Promise.all([
      document.fonts.load(`80px ${DISPLAY}`),
      document.fonts.load(`600 40px ${SANS}`),
      document.fonts.load(`700 40px ${SANS}`),
    ])
  } catch {
    // Fall back to system fonts if Google Fonts is blocked.
  }
}

function roundRect(ctx: CanvasRenderingContext2D, r: Rect, radius: number) {
  ctx.beginPath()
  ctx.roundRect(r.x, r.y, r.w, r.h, radius)
}

/** An "Admit One" ticket stub with perforation, side notches and a serial number. */
function drawTicket(ctx: CanvasRenderingContext2D, r: Rect, serial: string, date: Date) {
  const notch = r.h * 0.13
  const stubW = Math.min(r.w * 0.3, 320)
  const stubX = r.x + r.w - stubW

  const { x, y, w, h } = r
  const cy = y + h / 2
  const R = 24

  ctx.save()
  ctx.lineWidth = 6
  ctx.strokeStyle = INK
  ctx.fillStyle = BUBBLEGUM
  // Rounded rectangle with a half-circle notch punched into each side.
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

  // Perforation between the ticket body and the stub.
  ctx.setLineDash([14, 14])
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(stubX, r.y + 24)
  ctx.lineTo(stubX, r.y + r.h - 24)
  ctx.stroke()
  ctx.setLineDash([])

  // Body: brand + "Admit One".
  const bodyCx = r.x + notch + (stubX - r.x - notch) / 2
  ctx.textAlign = 'center'
  ctx.fillStyle = INK
  ctx.font = `600 ${Math.round(r.h * 0.11)}px ${SANS}`
  ctx.fillText('★  CAPTURE FACTORY  ★', bodyCx, r.y + r.h * 0.27)

  ctx.font = `${Math.round(r.h * 0.3)}px ${DISPLAY}`
  ctx.lineWidth = 10
  ctx.lineJoin = 'round'
  ctx.strokeStyle = INK
  ctx.strokeText('Admit One', bodyCx, r.y + r.h * 0.66)
  ctx.fillStyle = BUTTER
  ctx.fillText('Admit One', bodyCx, r.y + r.h * 0.66)

  ctx.fillStyle = INK
  ctx.font = `600 ${Math.round(r.h * 0.085)}px ${SANS}`
  const when = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  ctx.fillText(when.toUpperCase(), bodyCx, r.y + r.h * 0.86)

  // Stub: the serial number, rotated like a real ticket.
  ctx.translate(stubX + stubW / 2, r.y + r.h / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.font = `700 ${Math.round(r.h * 0.09)}px ${SANS}`
  ctx.fillText('No.', 0, -stubW * 0.12)
  ctx.font = `700 ${Math.round(r.h * 0.1)}px ${SANS}`
  ctx.fillText(serial, 0, stubW * 0.16)
  ctx.restore()
}

export async function renderStrip(layout: Layout, shots: Shot[], serial: string, date = new Date()) {
  await loadFonts()
  const canvas = document.createElement('canvas')
  canvas.width = layout.width
  canvas.height = layout.height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = CREAM
  ctx.fillRect(0, 0, layout.width, layout.height)

  const bitmaps = await Promise.all(shots.map((s) => createImageBitmap(s.blob)))
  layout.slots.forEach((slot, i) => {
    const bmp = bitmaps[i]
    if (!bmp) return
    ctx.save()
    roundRect(ctx, slot, 12)
    ctx.clip()
    ctx.drawImage(bmp, slot.x, slot.y, slot.w, slot.h)
    ctx.restore()
    ctx.lineWidth = 6
    ctx.strokeStyle = INK
    roundRect(ctx, slot, 12)
    ctx.stroke()
  })
  bitmaps.forEach((b) => b.close())

  drawTicket(ctx, layout.footer, serial, date)

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not render strip'))), 'image/png'),
  )
}
