/**
 * The sticker library: original SVG artwork in the retro scrapbook style.
 *
 * Stickers are rasterised from SVG through an <img>, which cannot load web fonts,
 * so text uses system font stacks and `textLength` to keep the layout stable
 * whatever font the device substitutes.
 */

export type PackId = 'tickets' | 'stamps' | 'mood' | 'cute'

export type StickerDef = { id: string; pack: PackId; name: string; w: number; h: number; svg: string }

export const PACKS: { id: PackId; name: string }[] = [
  { id: 'tickets', name: 'Tickets' },
  { id: 'stamps', name: 'Stamps' },
  { id: 'mood', name: 'Study mood' },
  { id: 'cute', name: 'Cute bits' },
]

const INK = '#2B2522'
const PAPER = '#F4ECD8'
const AGED = '#E6D6B8'
const RED = '#C8282E'
const PINK = '#E9A3B0'
const HOT = '#E0607E'
const MUSTARD = '#D9A441'
const SAGE = '#9DAE8E'
const BLUE = '#3B4F8F'
const CHARCOAL = '#3A3634'
const TAN = '#C9A27E'

const SERIF = "Georgia, 'Times New Roman', serif"
const MONO = "'Courier New', Courier, monospace"
const HEAVY = "Impact, 'Arial Black', 'Helvetica Neue', Arial, sans-serif"
const HAND = "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive"

const YEAR = new Date().getFullYear()

function svg(w: number, h: number, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`
}

/** Text that is squeezed or stretched to exactly `len` units wide. */
function fit(x: number, y: number, len: number, size: number, font: string, fill: string, text: string, extra = '') {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${font}" font-size="${size}" font-weight="bold" fill="${fill}" textLength="${len}" lengthAdjust="spacingAndGlyphs" ${extra}>${text}</text>`
}

function txt(x: number, y: number, size: number, font: string, fill: string, text: string, extra = '') {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${font}" font-size="${size}" fill="${fill}" ${extra}>${text}</text>`
}

/** Rounded ticket outline with a half-circle notch punched into each side. */
function ticketPath(w: number, h: number, n = 14) {
  const c = h / 2
  return `M8 2 H${w - 8} Q${w - 2} 2 ${w - 2} 8 V${c - n} A${n} ${n} 0 0 0 ${w - 2} ${c + n} V${h - 8} Q${w - 2} ${h - 2} ${w - 8} ${h - 2} H8 Q2 ${h - 2} 2 ${h - 8} V${c + n} A${n} ${n} 0 0 0 2 ${c - n} V8 Q2 2 8 2Z`
}

function barcode(x: number, y: number, w: number, h: number, fill: string) {
  const widths = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 2, 1]
  const total = widths.reduce((a, b) => a + b * 2, 0)
  const k = w / total
  let cx = x
  return widths
    .map((bw, i) => {
      const r = i % 2 === 0 ? `<rect x="${cx.toFixed(1)}" y="${y}" width="${(bw * k).toFixed(1)}" height="${h}" fill="${fill}"/>` : ''
      cx += bw * k * 2
      return r
    })
    .join('')
}

type TicketOpts = {
  w?: number
  h?: number
  bg: string
  fg: string
  title: string
  font?: string
  size?: number
  top?: string
  bottom?: string
  serial?: string
}

function ticket({ w = 300, h = 150, bg, fg, title, font = SERIF, size = 46, top, bottom, serial }: TicketOpts) {
  const body = [
    `<path d="${ticketPath(w, h)}" fill="${bg}" stroke="${INK}" stroke-width="3"/>`,
    `<rect x="26" y="12" width="${w - 52}" height="${h - 24}" fill="none" stroke="${fg}" stroke-width="1.5" stroke-dasharray="6 5" opacity="0.7"/>`,
    top ? txt(w / 2, 40, 14, MONO, fg, top, 'font-weight="bold" letter-spacing="3"') : '',
    fit(w / 2, h / 2 + size * 0.36, Math.min(w - 80, title.length * size * 0.62), size, font, fg, title),
    bottom ? txt(w / 2, h - 24, 13, MONO, fg, bottom, 'font-weight="bold" letter-spacing="2"') : '',
    serial
      ? `<text x="16" y="${h / 2}" transform="rotate(-90 16 ${h / 2})" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${fg}" opacity="0.8">${serial}</text>` +
        `<text x="${w - 16}" y="${h / 2}" transform="rotate(90 ${w - 16} ${h / 2})" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${fg}" opacity="0.8">${serial}</text>`
      : '',
  ]
  return svg(w, h, body.join(''))
}

/** A postage stamp with a perforated edge (cut with a mask, so it stays transparent). */
function postage(w: number, h: number, inner: string, bg = PAPER) {
  const holes: string[] = []
  const r = 6
  for (let x = 10; x <= w - 10; x += 16) holes.push(`<circle cx="${x}" cy="0" r="${r}"/><circle cx="${x}" cy="${h}" r="${r}"/>`)
  for (let y = 10; y <= h - 10; y += 16) holes.push(`<circle cx="0" cy="${y}" r="${r}"/><circle cx="${w}" cy="${y}" r="${r}"/>`)
  return svg(
    w,
    h,
    `<defs><mask id="perf"><rect width="${w}" height="${h}" fill="#fff"/><g fill="#000">${holes.join('')}</g></mask></defs>` +
      `<g mask="url(#perf)"><rect width="${w}" height="${h}" fill="${bg}"/>${inner}</g>`,
  )
}

/** Circular rubber-stamp seal with text running round the rim. */
function seal(size: number, color: string, ring: string, centre: string) {
  const c = size / 2
  const r = c - 34
  return svg(
    size,
    size,
    `<defs><path id="rim" d="M${c - r} ${c} A${r} ${r} 0 1 1 ${c + r} ${c} A${r} ${r} 0 1 1 ${c - r} ${c}"/></defs>` +
      `<circle cx="${c}" cy="${c}" r="${c - 4}" fill="${PAPER}" stroke="${color}" stroke-width="6"/>` +
      `<circle cx="${c}" cy="${c}" r="${c - 16}" fill="none" stroke="${color}" stroke-width="2"/>` +
      `<circle cx="${c}" cy="${c}" r="${c - 52}" fill="none" stroke="${color}" stroke-width="2"/>` +
      `<text font-family="${MONO}" font-weight="bold" font-size="17" letter-spacing="4" fill="${color}"><textPath href="#rim" startOffset="0">${ring}</textPath></text>` +
      `<ellipse cx="${c}" cy="${c}" rx="${c - 64}" ry="${(c - 64) * 0.45}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.6"/>` +
      `<line x1="${c}" y1="66" x2="${c}" y2="${size - 66}" stroke="${color}" stroke-width="1.5" opacity="0.6"/>` +
      `<rect x="16" y="${c - 22}" width="${size - 32}" height="44" fill="${color}"/>` +
      fit(c, c + 12, size - 64, 30, SERIF, PAPER, centre),
  )
}

/** A rubber stamp: a ragged rectangle of ink, tilted. */
function rubberStamp(w: number, h: number, color: string, text: string, sub?: string) {
  return svg(
    w,
    h,
    `<g transform="rotate(-6 ${w / 2} ${h / 2})" opacity="0.92">` +
      `<rect x="14" y="16" width="${w - 28}" height="${h - 32}" rx="6" fill="none" stroke="${color}" stroke-width="7"/>` +
      `<rect x="24" y="26" width="${w - 48}" height="${h - 52}" rx="3" fill="none" stroke="${color}" stroke-width="2"/>` +
      fit(w / 2, sub ? h / 2 + 4 : h / 2 + 14, w - 80, 40, HEAVY, color, text, 'letter-spacing="2"') +
      (sub ? txt(w / 2, h / 2 + 30, 13, MONO, color, sub, 'font-weight="bold" letter-spacing="2"') : '') +
      `</g>`,
  )
}

/** Plain text sticker on a white die-cut card. */
function textCard(w: number, h: number, lines: { t: string; size: number; font?: string; fill?: string }[], bg = '#FFFFFF') {
  const gap = 8
  const total = lines.reduce((a, l) => a + l.size + gap, -gap)
  let y = (h - total) / 2
  const body = lines
    .map((l) => {
      y += l.size
      const out = fit(w / 2, y - l.size * 0.12, Math.min(w - 36, l.t.length * l.size * 0.58), l.size, l.font ?? HEAVY, l.fill ?? INK, l.t)
      y += gap
      return out
    })
    .join('')
  return svg(w, h, `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="10" fill="${bg}" stroke="${INK}" stroke-width="3"/>${body}`)
}

const heartPath = 'M50 86 C20 64 4 46 4 28 C4 14 15 4 28 4 C38 4 46 10 50 18 C54 10 62 4 72 4 C85 4 96 14 96 28 C96 46 80 64 50 86Z'

export const STICKERS: StickerDef[] = [
  // ── Tickets ──────────────────────────────────────────────
  { id: 'admit-one', pack: 'tickets', name: 'Admit one', w: 300, h: 150, svg: ticket({ bg: RED, fg: PAPER, title: 'ADMIT ONE', font: HEAVY, size: 50, top: '★ ★ ★', serial: '№ 146017' }) },
  { id: 'fun-pass', pack: 'tickets', name: 'Fun pass', w: 300, h: 150, svg: ticket({ bg: PINK, fg: INK, title: 'FUN PASS', font: SERIF, size: 54, bottom: 'GOOD FOR ONE PHOTO', serial: '043572' }) },
  { id: 'good-times', pack: 'tickets', name: 'Good times', w: 300, h: 140, svg: ticket({ h: 140, bg: AGED, fg: RED, title: 'Good Times', font: SERIF, size: 50, top: 'ADMIT ONE', serial: '72411' }) },
  { id: 'anywhere', pack: 'tickets', name: 'Ticket to anywhere', w: 300, h: 150, svg: ticket({ bg: PAPER, fg: INK, title: 'Ticket to Anywhere', font: SERIF, size: 34, top: 'ONE WAY', bottom: '✈  DEPARTS NOW', serial: '146017' }) },
  { id: 'made-in', pack: 'tickets', name: `Made in ${YEAR}`, w: 300, h: 150, svg: ticket({ bg: CHARCOAL, fg: PAPER, title: `MADE IN ${YEAR}`, font: SERIF, size: 40, top: 'REWIND TO THE PAST', bottom: 'INSERT FROM HERE ↑', serial: '53271' }) },
  { id: 'cinema', pack: 'tickets', name: 'Cinema', w: 300, h: 140, svg: ticket({ h: 140, bg: PAPER, fg: RED, title: 'CINEMA', font: SERIF, size: 54, top: '★ ★ ★ 367590 ★ ★ ★', serial: '367590' }) },
  { id: 'smile', pack: 'tickets', name: 'Smile for the camera', w: 300, h: 150, svg: ticket({ bg: SAGE, fg: INK, title: 'SMILE', font: SERIF, size: 58, bottom: 'FOR THE CAMERA', serial: '171125' }) },
  { id: 'love-coupon', pack: 'tickets', name: 'Love coupon', w: 300, h: 150, svg: ticket({ bg: HOT, fg: PAPER, title: 'Love Coupon', font: SERIF, size: 46, top: '♥  VALID FOREVER  ♥', serial: '598002' }) },
  {
    id: 'boarding',
    pack: 'tickets',
    name: 'Boarding pass',
    w: 340,
    h: 150,
    svg: svg(
      340,
      150,
      `<path d="${ticketPath(340, 150)}" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>` +
        `<rect x="2" y="2" width="336" height="36" fill="${TAN}"/><path d="${ticketPath(340, 150)}" fill="none" stroke="${INK}" stroke-width="3"/>` +
        fit(130, 28, 200, 22, HEAVY, INK, 'BOARDING PASS', 'letter-spacing="2"') +
        txt(300, 28, 22, SERIF, INK, '✈') +
        `<text x="28" y="70" font-family="${MONO}" font-size="12" fill="${INK}">FROM</text><text x="28" y="96" font-family="${HEAVY}" font-size="26" fill="${INK}">HERE</text>` +
        `<text x="150" y="70" font-family="${MONO}" font-size="12" fill="${INK}">TO</text><text x="150" y="96" font-family="${HEAVY}" font-size="26" fill="${RED}">FUN</text>` +
        `<text x="28" y="124" font-family="${MONO}" font-size="12" fill="${INK}">SEAT 1A · ECONOMY CLASS</text>` +
        `<line x1="248" y1="48" x2="248" y2="140" stroke="${INK}" stroke-width="2" stroke-dasharray="5 5"/>` +
        barcode(262, 56, 60, 70, INK),
    ),
  },

  // ── Stamps & seals ───────────────────────────────────────
  { id: 'top-snap', pack: 'stamps', name: 'Top snap seal', w: 220, h: 220, svg: seal(220, RED, 'PHOTO DEPARTMENT · CAPTURE FACTORY · ', 'TOP SNAP') },
  { id: 'classified', pack: 'stamps', name: 'Classified', w: 300, h: 130, svg: rubberStamp(300, 130, RED, 'CLASSIFIED', 'FOR YOUR EYES ONLY') },
  { id: 'approved', pack: 'stamps', name: 'Approved', w: 280, h: 120, svg: rubberStamp(280, 120, BLUE, 'APPROVED') },
  { id: 'developed', pack: 'stamps', name: 'Developed', w: 300, h: 130, svg: rubberStamp(300, 130, INK, 'DEVELOPED', `FILE № ${YEAR}-042`) },
  {
    id: 'postage-camera',
    pack: 'stamps',
    name: 'Camera stamp',
    w: 180,
    h: 220,
    svg: postage(
      180,
      220,
      `<rect x="16" y="16" width="148" height="188" fill="none" stroke="${RED}" stroke-width="3"/>` +
        `<text x="28" y="50" font-family="${SERIF}" font-weight="bold" font-size="30" fill="${RED}">25</text>` +
        `<text x="152" y="194" text-anchor="end" font-family="${MONO}" font-weight="bold" font-size="14" fill="${RED}">CAPTURE POST</text>` +
        `<rect x="44" y="92" width="92" height="62" rx="8" fill="${CHARCOAL}" stroke="${INK}" stroke-width="3"/>` +
        `<rect x="62" y="80" width="32" height="16" rx="3" fill="${CHARCOAL}" stroke="${INK}" stroke-width="3"/>` +
        `<circle cx="90" cy="123" r="21" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><circle cx="90" cy="123" r="10" fill="${BLUE}"/>` +
        `<circle cx="122" cy="104" r="4" fill="${MUSTARD}"/>`,
    ),
  },
  {
    id: 'postage-heart',
    pack: 'stamps',
    name: 'Heart stamp',
    w: 180,
    h: 220,
    svg: postage(
      180,
      220,
      `<rect x="16" y="16" width="148" height="188" fill="${PINK}"/>` +
        `<text x="28" y="50" font-family="${SERIF}" font-weight="bold" font-size="30" fill="${INK}">50</text>` +
        `<text x="152" y="194" text-anchor="end" font-family="${MONO}" font-weight="bold" font-size="14" fill="${INK}">AIR MAIL</text>` +
        `<g transform="translate(46 76) scale(0.9)"><path d="${heartPath}" fill="${RED}" stroke="${INK}" stroke-width="4"/></g>`,
      PAPER,
    ),
  },
  {
    id: 'postmark',
    pack: 'stamps',
    name: 'Postmark',
    w: 300,
    h: 160,
    svg: svg(
      300,
      160,
      `<g fill="none" stroke="${BLUE}" stroke-width="4" opacity="0.85">` +
        `<circle cx="80" cy="80" r="62"/><circle cx="80" cy="80" r="48" stroke-width="2"/>` +
        [40, 62, 84, 106, 128].map((y) => `<path d="M150 ${y} q18 -12 36 0 t36 0 t36 0 t36 0"/>`).join('') +
        `</g>` +
        txt(80, 72, 14, MONO, BLUE, 'PHOTO DEPT', 'font-weight="bold"') +
        txt(80, 94, 16, MONO, BLUE, String(YEAR), 'font-weight="bold"'),
    ),
  },
  {
    id: 'plane-stamp',
    pack: 'stamps',
    name: 'Air stamp',
    w: 200,
    h: 190,
    svg: svg(
      200,
      190,
      `<g fill="none" stroke="#6A3E7A" stroke-width="6" stroke-linejoin="round" opacity="0.88"><path d="M100 14 L188 172 H12Z"/><path d="M100 36 L170 162 H30Z" stroke-width="2"/></g>` +
        txt(100, 118, 46, SERIF, '#6A3E7A', '✈', 'opacity="0.88"') +
        txt(100, 152, 15, MONO, '#6A3E7A', '№ 150990', 'font-weight="bold" opacity="0.88"'),
    ),
  },
  { id: 'barcode', pack: 'stamps', name: 'Barcode', w: 240, h: 120, svg: svg(240, 120, `<rect x="2" y="2" width="236" height="116" rx="6" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>${barcode(22, 16, 196, 66, INK)}<text x="120" y="104" text-anchor="middle" font-family="${MONO}" font-size="16" letter-spacing="4" fill="${INK}">0 734664 235788</text>`) },
  {
    id: 'paperclip',
    pack: 'stamps',
    name: 'Paper clip',
    w: 80,
    h: 200,
    svg: svg(80, 200, `<path d="M52 60 V150 a14 14 0 0 1 -28 0 V40 a22 22 0 0 1 44 0 V160 a30 30 0 0 1 -60 0 V70" fill="none" stroke="${RED}" stroke-width="7" stroke-linecap="round"/>`),
  },

  // ── Study mood ───────────────────────────────────────────
  { id: 'studying', pack: 'mood', name: 'Stu(dying)', w: 300, h: 110, svg: textCard(300, 110, [{ t: 'STU(DYING)', size: 52 }]) },
  { id: 'no-idea', pack: 'mood', name: 'No idea', w: 280, h: 170, svg: textCard(280, 170, [{ t: 'I HAVE NO IDEA', size: 34 }, { t: "WHAT I'M DOING!!!", size: 30, fill: RED }]) },
  { id: 'limited', pack: 'mood', name: 'Limited edition', w: 300, h: 160, svg: textCard(300, 160, [{ t: "I'M NOT WEIRD", size: 44, fill: PAPER }, { t: "I'm limited edition", size: 26, font: SERIF, fill: PAPER }], CHARCOAL) },
  { id: 'proud', pack: 'mood', name: 'Proud of myself', w: 120, h: 300, svg: svg(120, 300, `<rect x="2" y="2" width="116" height="296" rx="4" fill="${CHARCOAL}" stroke="${INK}" stroke-width="3"/><text x="60" y="150" transform="rotate(90 60 150)" text-anchor="middle" font-family="${SERIF}" font-size="26" fill="${PAPER}" textLength="250" lengthAdjust="spacingAndGlyphs">I am proud of myself.</text>`) },
  {
    id: 'shut-up-study',
    pack: 'mood',
    name: 'Shut up and study',
    w: 230,
    h: 220,
    svg: svg(
      230,
      220,
      `<g transform="rotate(-4 115 110)"><rect x="18" y="22" width="194" height="180" fill="#F6D864" stroke="${INK}" stroke-width="3"/><rect x="80" y="10" width="70" height="26" fill="#E8E2D0" opacity="0.85" stroke="${INK}" stroke-width="2"/>` +
        txt(115, 92, 34, HAND, INK, 'SHUT UP', 'font-weight="bold"') +
        txt(115, 132, 30, HAND, INK, 'AND', 'font-weight="bold"') +
        txt(115, 172, 34, HAND, INK, 'STUDY!', 'font-weight="bold"') +
        `</g>`,
    ),
  },
  {
    id: 'hyperfocus',
    pack: 'mood',
    name: 'Hyperfocus',
    w: 200,
    h: 260,
    svg: svg(
      200,
      260,
      `<rect x="16" y="2" width="168" height="46" rx="10" fill="${MUSTARD}" stroke="${INK}" stroke-width="3"/>` +
        fit(100, 35, 140, 26, HEAVY, INK, 'HYPERFOCUS') +
        `<rect x="30" y="58" width="140" height="196" rx="16" fill="${PINK}" stroke="${INK}" stroke-width="3"/>` +
        txt(100, 92, 20, HEAVY, INK, 'ON') +
        txt(100, 240, 20, HEAVY, INK, 'OFF') +
        `<rect x="72" y="104" width="56" height="110" rx="8" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>` +
        `<rect x="78" y="110" width="44" height="52" rx="6" fill="${HOT}" stroke="${INK}" stroke-width="3"/>`,
    ),
  },
  {
    id: 'student-tears',
    pack: 'mood',
    name: 'Student tears',
    w: 190,
    h: 270,
    svg: svg(
      190,
      270,
      `<rect x="108" y="4" width="12" height="80" fill="${RED}" stroke="${INK}" stroke-width="2" transform="rotate(12 114 44)"/>` +
        `<path d="M24 66 H166 L150 262 H40Z" fill="#BFD7EA" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` +
        `<rect x="18" y="54" width="154" height="20" rx="4" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>` +
        `<path d="M34 110 H156 L146 250 H44Z" fill="#7FA9D1" opacity="0.7"/>` +
        txt(95, 170, 30, HAND, PAPER, 'student', 'font-weight="bold"') +
        txt(95, 206, 30, HAND, PAPER, 'tears', 'font-weight="bold"'),
    ),
  },
  {
    id: 'pure-coffee',
    pack: 'mood',
    name: 'Pure coffee',
    w: 190,
    h: 270,
    svg: svg(
      190,
      270,
      `<rect x="80" y="4" width="30" height="20" rx="4" fill="#BDBDBD" stroke="${INK}" stroke-width="3"/>` +
        `<path d="M24 34 Q24 22 40 22 H150 Q166 22 166 34 V190 Q166 206 150 206 H40 Q24 206 24 190Z" fill="#F1E7D6" stroke="${INK}" stroke-width="4"/>` +
        `<path d="M28 110 H162 V190 Q162 202 150 202 H40 Q28 202 28 190Z" fill="#7A4A2A"/>` +
        txt(95, 66, 26, SERIF, INK, 'PURE', 'font-weight="bold"') +
        txt(95, 96, 26, SERIF, INK, 'COFFEE', 'font-weight="bold"') +
        txt(95, 150, 14, MONO, PAPER, '100 ml') +
        `<path d="M95 206 V266" stroke="${INK}" stroke-width="5"/><circle cx="95" cy="236" r="8" fill="#7A4A2A" stroke="${INK}" stroke-width="3"/>`,
    ),
  },
  {
    id: 'at-least',
    pack: 'mood',
    name: 'At least you tried',
    w: 300,
    h: 180,
    svg: svg(
      300,
      180,
      `<path d="M30 70 L60 30 H280 L250 70Z" fill="#F7D3DA" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M30 70 H250 V160 H30Z" fill="#F7D3DA" stroke="${INK}" stroke-width="3"/><path d="M250 70 L280 30 V120 L250 160Z" fill="#EBB9C4" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M30 70 q14 14 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0" fill="none" stroke="${HOT}" stroke-width="5"/>` +
        fit(140, 108, 190, 26, HAND, RED, 'AT LEAST') +
        fit(140, 144, 190, 26, HAND, RED, 'YOU TRIED'),
    ),
  },
  {
    id: 'lemon',
    pack: 'mood',
    name: 'Easy peasy',
    w: 220,
    h: 240,
    svg: svg(
      220,
      240,
      `<path d="M120 24 q28 -20 46 -6 q-14 20 -46 6Z" fill="#7DAA4E" stroke="${INK}" stroke-width="3"/>` +
        `<ellipse cx="110" cy="132" rx="94" ry="100" fill="#F7D84A" stroke="${INK}" stroke-width="4"/>` +
        `<g transform="rotate(-10 110 132)">` +
        fit(110, 98, 140, 34, HEAVY, PAPER, 'EASY', `stroke="${INK}" stroke-width="1"`) +
        fit(110, 136, 150, 34, HEAVY, PAPER, 'PEASY', `stroke="${INK}" stroke-width="1"`) +
        fit(110, 172, 150, 30, HEAVY, PAPER, 'LEMON', `stroke="${INK}" stroke-width="1"`) +
        fit(110, 204, 120, 22, HEAVY, PAPER, 'SQUEEZY', `stroke="${INK}" stroke-width="1"`) +
        `</g>`,
    ),
  },
  {
    id: 'robot',
    pack: 'mood',
    name: "I'm not a robot",
    w: 300,
    h: 100,
    svg: svg(
      300,
      100,
      `<rect x="2" y="2" width="296" height="96" rx="6" fill="#F9F9F9" stroke="${INK}" stroke-width="3"/>` +
        `<rect x="22" y="30" width="40" height="40" rx="4" fill="#FFFFFF" stroke="#9A9A9A" stroke-width="3"/><path d="M28 50 L40 62 L60 34" fill="none" stroke="#1E9E50" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<text x="80" y="60" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="${INK}">I'm not a robot</text>` +
        `<circle cx="262" cy="50" r="18" fill="none" stroke="${BLUE}" stroke-width="5" stroke-dasharray="70 20"/>`,
    ),
  },

  // ── Cute bits ────────────────────────────────────────────
  { id: 'heart', pack: 'cute', name: 'Heart', w: 100, h: 92, svg: svg(100, 92, `<path d="${heartPath}" fill="${RED}" stroke="${INK}" stroke-width="4"/><path d="M22 24 q6 -10 16 -8" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`) },
  { id: 'sparkle', pack: 'cute', name: 'Sparkle', w: 110, h: 110, svg: svg(110, 110, `<path d="M55 4 C59 40 70 51 106 55 C70 59 59 70 55 106 C51 70 40 59 4 55 C40 51 51 40 55 4Z" fill="${MUSTARD}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`) },
  { id: 'star', pack: 'cute', name: 'Star', w: 110, h: 106, svg: svg(110, 106, `<path d="M55 4 L68 40 L106 41 L76 64 L87 101 L55 79 L23 101 L34 64 L4 41 L42 40Z" fill="${PINK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`) },
  {
    id: 'bow',
    pack: 'cute',
    name: 'Bow',
    w: 180,
    h: 130,
    svg: svg(
      180,
      130,
      `<g stroke="${INK}" stroke-width="4" stroke-linejoin="round" fill="${HOT}"><path d="M90 50 C60 10 14 8 10 40 C6 72 56 76 90 58Z"/><path d="M90 50 C120 10 166 8 170 40 C174 72 124 76 90 58Z"/><path d="M84 58 L54 124 L72 116 L80 126 L92 62Z"/><path d="M96 58 L126 124 L108 116 L100 126 L88 62Z"/><rect x="76" y="38" width="28" height="30" rx="10"/></g>`,
    ),
  },
  {
    id: 'cherries',
    pack: 'cute',
    name: 'Cherries',
    w: 150,
    h: 160,
    svg: svg(
      150,
      160,
      `<path d="M50 112 C56 70 76 40 104 14 M104 14 C108 50 104 80 104 112" fill="none" stroke="#4E7A3A" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M104 14 q28 -10 40 6 q-20 14 -40 -6Z" fill="#7DAA4E" stroke="${INK}" stroke-width="3"/>` +
        `<circle cx="48" cy="124" r="30" fill="${RED}" stroke="${INK}" stroke-width="4"/><circle cx="106" cy="124" r="30" fill="${RED}" stroke="${INK}" stroke-width="4"/>` +
        `<path d="M34 112 q6 -8 14 -6 M92 112 q6 -8 14 -6" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`,
    ),
  },
  {
    id: 'daisy',
    pack: 'cute',
    name: 'Smiley daisy',
    w: 160,
    h: 160,
    svg: svg(
      160,
      160,
      `<g fill="#FFFFFF" stroke="${INK}" stroke-width="3.5">` +
        Array.from({ length: 10 }, (_, i) => `<ellipse cx="80" cy="30" rx="17" ry="30" transform="rotate(${i * 36} 80 80)"/>`).join('') +
        `</g><circle cx="80" cy="80" r="32" fill="${MUSTARD}" stroke="${INK}" stroke-width="4"/>` +
        `<circle cx="70" cy="74" r="4" fill="${INK}"/><circle cx="90" cy="74" r="4" fill="${INK}"/><path d="M66 88 q14 14 28 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` +
        `<circle cx="62" cy="86" r="5" fill="${HOT}" opacity="0.6"/><circle cx="98" cy="86" r="5" fill="${HOT}" opacity="0.6"/>`,
    ),
  },
  {
    id: 'butterfly',
    pack: 'cute',
    name: 'Butterfly',
    w: 170,
    h: 140,
    svg: svg(
      170,
      140,
      `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"><path d="M85 64 C60 10 10 6 12 40 C14 70 56 74 85 70Z" fill="${MUSTARD}"/><path d="M85 64 C110 10 160 6 158 40 C156 70 114 74 85 70Z" fill="${MUSTARD}"/>` +
        `<path d="M85 72 C56 80 34 112 50 128 C66 140 82 110 85 78Z" fill="${TAN}"/><path d="M85 72 C114 80 136 112 120 128 C104 140 88 110 85 78Z" fill="${TAN}"/>` +
        `<rect x="80" y="44" width="10" height="70" rx="5" fill="${CHARCOAL}"/></g>` +
        `<path d="M83 46 q-10 -24 -22 -30 M87 46 q10 -24 22 -30" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'cassette',
    pack: 'cute',
    name: 'Cassette',
    w: 240,
    h: 160,
    svg: svg(
      240,
      160,
      `<rect x="4" y="4" width="232" height="152" rx="14" fill="${TAN}" stroke="${INK}" stroke-width="4"/>` +
        `<rect x="24" y="20" width="192" height="76" rx="8" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>` +
        `<rect x="24" y="20" width="192" height="20" fill="${RED}"/><rect x="24" y="20" width="192" height="76" rx="8" fill="none" stroke="${INK}" stroke-width="3"/>` +
        `<text x="40" y="35" font-family="${MONO}" font-weight="bold" font-size="13" fill="${PAPER}">SIDE A · MIXTAPE</text>` +
        `<rect x="62" y="52" width="116" height="34" rx="17" fill="${CHARCOAL}" stroke="${INK}" stroke-width="3"/>` +
        `<circle cx="86" cy="69" r="11" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><circle cx="154" cy="69" r="11" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>` +
        `<path d="M50 156 L66 112 H174 L190 156" fill="${CHARCOAL}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` +
        `<circle cx="90" cy="134" r="6" fill="${TAN}"/><circle cx="150" cy="134" r="6" fill="${TAN}"/>`,
    ),
  },
  {
    id: 'camera',
    pack: 'cute',
    name: 'Retro camera',
    w: 220,
    h: 170,
    svg: svg(
      220,
      170,
      `<rect x="20" y="20" width="56" height="26" rx="6" fill="${CHARCOAL}" stroke="${INK}" stroke-width="4"/>` +
        `<rect x="4" y="38" width="212" height="128" rx="18" fill="#BFC3C7" stroke="${INK}" stroke-width="4"/>` +
        `<rect x="4" y="74" width="212" height="56" fill="${TAN}"/><rect x="4" y="38" width="212" height="128" rx="18" fill="none" stroke="${INK}" stroke-width="4"/>` +
        `<circle cx="110" cy="102" r="44" fill="${CHARCOAL}" stroke="${INK}" stroke-width="4"/><circle cx="110" cy="102" r="28" fill="#5C7EA8" stroke="${INK}" stroke-width="4"/>` +
        `<circle cx="100" cy="92" r="8" fill="#FFFFFF" opacity="0.8"/>` +
        `<rect x="160" y="50" width="40" height="18" rx="4" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><circle cx="34" cy="60" r="7" fill="${RED}" stroke="${INK}" stroke-width="3"/>`,
    ),
  },
  {
    id: 'lips',
    pack: 'cute',
    name: 'Kiss',
    w: 170,
    h: 100,
    svg: svg(
      170,
      100,
      `<path d="M6 50 C30 14 60 6 85 26 C110 6 140 14 164 50 C140 92 110 96 85 94 C60 96 30 92 6 50Z" fill="${RED}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M14 50 C50 58 120 58 156 50" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M40 70 q20 10 40 6" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.6"/>`,
    ),
  },
]

export function getSticker(id: string): StickerDef | undefined {
  return STICKERS.find((s) => s.id === id)
}

export function svgUrl(svgText: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`
}
