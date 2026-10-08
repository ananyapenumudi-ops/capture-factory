/**
 * Face-tracked props: SVG artwork plus where each one attaches to the face.
 *
 * Sizes and offsets are measured in "eye spans" (the distance between the outer
 * eye corners), so props scale naturally as a face moves closer or further away.
 */

export type PropId = 'heart-glasses' | 'star-glasses' | 'cat-ears' | 'flower-crown' | 'party-hat' | 'big-bow' | 'blush' | 'moustache'

export type Anchor = 'eyes' | 'forehead' | 'cheeks' | 'lip'

export type PropDef = {
  id: PropId
  name: string
  emoji: string
  anchor: Anchor
  svg: string
  /** Artwork's own width/height, used for its aspect ratio. */
  w: number
  h: number
  /** Drawn width, in eye spans. */
  width: number
  /** Which point of the artwork sits on the anchor: 0 = top edge, 1 = bottom edge. */
  pivotY: number
  /** Extra shift along the face's up/down axis, in eye spans (negative = up). */
  offsetY: number
}

const INK = '#2B2522'

function svg(w: number, h: number, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`
}

const heart = (cx: number, cy: number, s: number) =>
  `M${cx} ${cy + 34 * s} C${cx - 30 * s} ${cy + 12 * s} ${cx - 46 * s} ${cy - 6 * s} ${cx - 46 * s} ${cy - 22 * s} C${cx - 46 * s} ${cy - 36 * s} ${cx - 35 * s} ${cy - 46 * s} ${cx - 22 * s} ${cy - 46 * s} C${cx - 12 * s} ${cy - 46 * s} ${cx - 4 * s} ${cy - 40 * s} ${cx} ${cy - 32 * s} C${cx + 4 * s} ${cy - 40 * s} ${cx + 12 * s} ${cy - 46 * s} ${cx + 22 * s} ${cy - 46 * s} C${cx + 35 * s} ${cy - 46 * s} ${cx + 46 * s} ${cy - 36 * s} ${cx + 46 * s} ${cy - 22 * s} C${cx + 46 * s} ${cy - 6 * s} ${cx + 30 * s} ${cy + 12 * s} ${cx} ${cy + 34 * s}Z`

const star = (cx: number, cy: number, r: number) => {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.48 : r
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`)
  }
  return pts.join(' ')
}

const daisy = (cx: number, cy: number, r: number, petal: string, centre: string) =>
  Array.from({ length: 8 }, (_, i) => `<ellipse cx="${cx}" cy="${cy - r * 0.62}" rx="${r * 0.34}" ry="${r * 0.55}" transform="rotate(${i * 45} ${cx} ${cy})" fill="${petal}" stroke="${INK}" stroke-width="3"/>`).join('') +
  `<circle cx="${cx}" cy="${cy}" r="${r * 0.36}" fill="${centre}" stroke="${INK}" stroke-width="3"/>`

export const PROPS: PropDef[] = [
  {
    id: 'heart-glasses',
    name: 'Heart shades',
    emoji: '😍',
    anchor: 'eyes',
    w: 320,
    h: 120,
    width: 1.85,
    pivotY: 0.5,
    offsetY: 0.02,
    svg: svg(
      320,
      120,
      `<path d="M128 46 Q160 30 192 46" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>` +
        `<path d="M8 36 L30 44 M312 36 L290 44" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>` +
        `<path d="${heart(78, 64, 1.18)}" fill="#C8282E" fill-opacity="0.9" stroke="${INK}" stroke-width="7"/>` +
        `<path d="${heart(242, 64, 1.18)}" fill="#C8282E" fill-opacity="0.9" stroke="${INK}" stroke-width="7"/>` +
        `<path d="M50 30 q12 -10 26 -6 M214 30 q12 -10 26 -6" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.8"/>`,
    ),
  },
  {
    id: 'star-glasses',
    name: 'Star shades',
    emoji: '🤩',
    anchor: 'eyes',
    w: 320,
    h: 130,
    width: 1.8,
    pivotY: 0.5,
    offsetY: 0,
    svg: svg(
      320,
      130,
      `<path d="M126 60 Q160 44 194 60" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>` +
        `<polygon points="${star(76, 66, 62)}" fill="#D9A441" fill-opacity="0.92" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>` +
        `<polygon points="${star(244, 66, 62)}" fill="#D9A441" fill-opacity="0.92" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>` +
        `<circle cx="60" cy="52" r="8" fill="#FFFFFF" opacity="0.8"/><circle cx="228" cy="52" r="8" fill="#FFFFFF" opacity="0.8"/>`,
    ),
  },
  {
    id: 'cat-ears',
    name: 'Cat ears',
    emoji: '🐱',
    anchor: 'forehead',
    w: 320,
    h: 150,
    width: 2.4,
    pivotY: 1,
    offsetY: 0.15,
    svg: svg(
      320,
      150,
      `<path d="M20 146 Q160 96 300 146" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>` +
        `<path d="M40 136 L60 8 L136 112Z" fill="#3A3634" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>` +
        `<path d="M62 118 L68 42 L114 108Z" fill="#E9A3B0"/>` +
        `<path d="M280 136 L260 8 L184 112Z" fill="#3A3634" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>` +
        `<path d="M258 118 L252 42 L206 108Z" fill="#E9A3B0"/>`,
    ),
  },
  {
    id: 'flower-crown',
    name: 'Flower crown',
    emoji: '🌼',
    anchor: 'forehead',
    w: 340,
    h: 120,
    width: 2.6,
    pivotY: 0.85,
    offsetY: 0.15,
    svg: svg(
      340,
      120,
      `<path d="M10 96 Q170 30 330 96" fill="none" stroke="#4E7A3A" stroke-width="8" stroke-linecap="round"/>` +
        `<ellipse cx="60" cy="70" rx="16" ry="8" fill="#7DAA4E" stroke="${INK}" stroke-width="3" transform="rotate(-30 60 70)"/>` +
        `<ellipse cx="280" cy="70" rx="16" ry="8" fill="#7DAA4E" stroke="${INK}" stroke-width="3" transform="rotate(30 280 70)"/>` +
        daisy(34, 86, 30, '#FFFFFF', '#D9A441') +
        daisy(104, 58, 34, '#E9A3B0', '#C8282E') +
        daisy(170, 46, 40, '#FFFFFF', '#D9A441') +
        daisy(236, 58, 34, '#E9A3B0', '#C8282E') +
        daisy(306, 86, 30, '#FFFFFF', '#D9A441'),
    ),
  },
  {
    id: 'party-hat',
    name: 'Party hat',
    emoji: '🥳',
    anchor: 'forehead',
    w: 180,
    h: 240,
    width: 1.15,
    pivotY: 0.96,
    offsetY: 0.25,
    svg: svg(
      180,
      240,
      `<defs><clipPath id="cone"><path d="M90 30 L170 226 Q90 246 10 226Z"/></clipPath></defs>` +
        `<path d="M90 30 L170 226 Q90 246 10 226Z" fill="#F4ECD8"/>` +
        `<g clip-path="url(#cone)" fill="#C8282E">` +
        [60, 120, 180].map((y) => `<path d="M0 ${y} L180 ${y - 40} V${y - 10} L0 ${y + 30}Z"/>`).join('') +
        `</g>` +
        `<path d="M90 30 L170 226 Q90 246 10 226Z" fill="none" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>` +
        `<circle cx="90" cy="26" r="20" fill="#D9A441" stroke="${INK}" stroke-width="6"/>`,
    ),
  },
  {
    id: 'big-bow',
    name: 'Big bow',
    emoji: '🎀',
    anchor: 'forehead',
    w: 220,
    h: 150,
    width: 1.5,
    pivotY: 0.8,
    offsetY: 0.15,
    svg: svg(
      220,
      150,
      `<g stroke="${INK}" stroke-width="6" stroke-linejoin="round" fill="#E0607E">` +
        `<path d="M110 60 C74 8 12 6 8 48 C4 90 66 92 110 70Z"/><path d="M110 60 C146 8 208 6 212 48 C216 90 154 92 110 70Z"/>` +
        `<path d="M102 72 L66 146 L88 136 L98 148 L112 76Z"/><path d="M118 72 L154 146 L132 136 L122 148 L108 76Z"/>` +
        `<rect x="92" y="44" width="36" height="38" rx="12"/></g>` +
        `<path d="M40 40 q14 -14 34 -8" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.7"/>`,
    ),
  },
  {
    id: 'blush',
    name: 'Blush',
    emoji: '☺️',
    anchor: 'cheeks',
    w: 120,
    h: 70,
    width: 0.55,
    pivotY: 0.5,
    offsetY: 0,
    svg: svg(
      120,
      70,
      `<defs><radialGradient id="b"><stop offset="0" stop-color="#E0607E" stop-opacity="0.9"/><stop offset="1" stop-color="#E0607E" stop-opacity="0"/></radialGradient></defs>` +
        `<ellipse cx="60" cy="35" rx="58" ry="33" fill="url(#b)"/>` +
        `<path d="M34 40 l10 -12 M54 42 l10 -12 M74 40 l10 -12" stroke="#C8282E" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`,
    ),
  },
  {
    id: 'moustache',
    name: 'Moustache',
    emoji: '🥸',
    anchor: 'lip',
    w: 240,
    h: 90,
    width: 1.15,
    pivotY: 0.35,
    offsetY: 0,
    svg: svg(
      240,
      90,
      `<path d="M120 30 C100 6 70 8 52 30 C40 46 20 56 6 44 C8 70 40 86 72 72 C94 62 110 52 120 50 C130 52 146 62 168 72 C200 86 232 70 234 44 C220 56 200 46 188 30 C170 8 140 6 120 30Z" fill="${INK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
    ),
  },
]

export function getProp(id: PropId): PropDef | undefined {
  return PROPS.find((p) => p.id === id)
}
