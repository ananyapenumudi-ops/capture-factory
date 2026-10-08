export type LayoutId = 'strip4' | 'strip3' | 'grid2x2' | 'polaroid'

export type Rect = { x: number; y: number; w: number; h: number }

export type Layout = {
  id: LayoutId
  name: string
  blurb: string
  cols: number
  rows: number
  shots: number
  /** Every photo is captured at exactly this size, so rendering never rescales. */
  slotW: number
  slotH: number
  width: number
  height: number
  slots: Rect[]
  footer: Rect
}

type Spec = Pick<Layout, 'id' | 'name' | 'blurb' | 'cols' | 'rows' | 'slotW' | 'slotH'>

const MARGIN = 80
const GAP = 40
const FOOTER_H = 300

function build(spec: Spec): Layout {
  const { cols, rows, slotW, slotH } = spec
  const width = MARGIN * 2 + cols * slotW + (cols - 1) * GAP
  const photosH = rows * slotH + (rows - 1) * GAP
  const footerY = MARGIN + photosH + GAP
  const height = footerY + FOOTER_H + MARGIN

  const slots: Rect[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({ x: MARGIN + c * (slotW + GAP), y: MARGIN + r * (slotH + GAP), w: slotW, h: slotH })
    }
  }

  return {
    ...spec,
    shots: cols * rows,
    width,
    height,
    slots,
    footer: { x: MARGIN, y: footerY, w: width - MARGIN * 2, h: FOOTER_H },
  }
}

export const LAYOUTS: Layout[] = [
  build({ id: 'strip4', name: 'Classic strip', blurb: '4 shots, tall and skinny', cols: 1, rows: 4, slotW: 1040, slotH: 740 }),
  build({ id: 'strip3', name: 'Trio', blurb: '3 shots, a little bigger', cols: 1, rows: 3, slotW: 1040, slotH: 900 }),
  build({ id: 'grid2x2', name: 'Grid', blurb: '4 square shots', cols: 2, rows: 2, slotW: 880, slotH: 880 }),
  build({ id: 'polaroid', name: 'Polaroid', blurb: 'One perfect shot', cols: 1, rows: 1, slotW: 1000, slotH: 1000 }),
]

export function getLayout(id: LayoutId): Layout {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0]
}
