import type { CSSProperties, ReactNode } from 'react'
import styles from './PopArt.module.css'

/**
 * Hand-drawn pop-art illustrations for the landing page, as inline SVG so each
 * part can be animated with CSS (rays spin, clouds drift, wings flap).
 */

const INK = '#141414'
const ORANGE = '#FF6B2C'
const TANGERINE = '#FF9A3C'
const NAVY = '#2E2EB8'
const BLUE = '#4D4DF0'
const SKY = '#86B4F7'
const PINK = '#F49AD6'
const PINK_LIGHT = '#FBC7EA'
const PURPLE = '#8E5CF0'
const YELLOW = '#FFC83D'
const GREEN = '#2F9E7E'
const CREAM = '#FFF6EA'

const origin = (x: number, y: number): CSSProperties => ({ transformOrigin: `${x}px ${y}px` })

/** Four-point sparkle centred on (x, y). */
function Sparkle({ x, y, r, fill, delay = 0 }: { x: number; y: number; r: number; fill: string; delay?: number }) {
  const k = r * 0.22
  return (
    <path
      className={styles.twinkle}
      style={{ ...origin(x, y), animationDelay: `${delay}s` }}
      d={`M${x} ${y - r} C${x + k} ${y - k} ${x + k} ${y - k} ${x + r} ${y} C${x + k} ${y + k} ${x + k} ${y + k} ${x} ${y + r} C${x - k} ${y + k} ${x - k} ${y + k} ${x - r} ${y} C${x - k} ${y - k} ${x - k} ${y - k} ${x} ${y - r}Z`}
      fill={fill}
    />
  )
}

/** A fluffy cloud made of overlapping circles on a flat base. */
function Cloud({ x, y, s, fill, shade, className }: { x: number; y: number; s: number; fill: string; shade: string; className?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={className}>
        <g fill={shade}>
          <circle cx="-34" cy="6" r="30" />
          <circle cx="40" cy="8" r="28" />
          <rect x="-70" y="4" width="140" height="34" rx="17" />
        </g>
        <g fill={fill}>
          <circle cx="-38" cy="-2" r="28" />
          <circle cx="0" cy="-22" r="38" />
          <circle cx="38" cy="0" r="26" />
          <rect x="-70" y="-4" width="140" height="34" rx="17" />
        </g>
      </g>
    </g>
  )
}

/** A polaroid with little yellow wings, flapping as it flies. */
export function WingedPolaroid({ x, y, s = 1, rot = 0, photo = [PINK, BLUE], delay = 0 }: { x: number; y: number; s?: number; rot?: number; photo?: [string, string]; delay?: number }) {
  const id = `ph-${x}-${y}`
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <g className={styles.float} style={{ animationDelay: `${delay}s` }}>
        <g className={styles.flapL} style={{ ...origin(-30, -6), animationDelay: `${delay}s` }}>
          <path d="M-30 -10 C-70 -50 -100 -40 -96 -20 C-80 -22 -74 -12 -86 -2 C-66 -6 -60 4 -70 14 C-52 8 -40 6 -30 4Z" fill={YELLOW} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </g>
        <g className={styles.flapR} style={{ ...origin(30, -6), animationDelay: `${delay}s` }}>
          <path d="M30 -10 C70 -50 100 -40 96 -20 C80 -22 74 -12 86 -2 C66 -6 60 4 70 14 C52 8 40 6 30 4Z" fill={YELLOW} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </g>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={photo[0]} />
            <stop offset="1" stopColor={photo[1]} />
          </linearGradient>
        </defs>
        <rect x="-34" y="-40" width="68" height="80" rx="4" fill={CREAM} stroke={INK} strokeWidth="3" />
        <rect x="-26" y="-32" width="52" height="48" fill={`url(#${id})`} />
        <circle cx="-8" cy="-14" r="9" fill={YELLOW} />
        <path d="M-26 16 L-10 0 L4 12 L14 4 L26 16Z" fill={GREEN} />
      </g>
    </g>
  )
}

/** The hero scene: a camera-lens sun with stairs, clouds, a winding road, planets and flying polaroids. */
export function PopScene() {
  const rays = Array.from({ length: 14 }, (_, i) => i * (360 / 14))
  const stairs = Array.from({ length: 8 }, (_, i) => i)
  return (
    <svg className={styles.scene} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A pop-art landscape where a giant camera lens rises like the sun over clouds, with flying polaroids and planets">
      <defs>
        <clipPath id="lens-clip">
          <circle cx="300" cy="280" r="165" />
        </clipPath>
      </defs>

      {/* Sky and blobs */}
      <rect width="1200" height="600" fill="#FFE9B8" />
      <path d="M430 0 H860 C820 120 900 170 1000 210 C1080 240 1060 330 960 340 C820 355 760 260 640 300 C540 333 470 260 520 170 C560 100 470 70 430 0Z" fill={PINK_LIGHT} />
      <path d="M980 0 H1200 V250 C1130 230 1100 160 1040 140 C980 120 960 60 980 0Z" fill="#D9C8FF" />

      {/* Big planet on the right edge */}
      <g className={styles.bobSlow} style={origin(1160, 330)}>
        <circle cx="1160" cy="330" r="170" fill={BLUE} />
        <path d="M995 300 C1060 330 1220 320 1300 280 L1300 330 C1220 370 1060 380 990 350Z" fill={PURPLE} />
        <circle cx="1160" cy="330" r="170" fill="none" stroke={INK} strokeWidth="3" />
      </g>

      {/* Winding road */}
      <path d="M1100 -30 C1000 120 1150 250 930 320 S700 500 780 640" fill="none" stroke={TANGERINE} strokeWidth="96" strokeLinecap="round" />
      <path d="M1100 -30 C1000 120 1150 250 930 320 S700 500 780 640" fill="none" stroke={YELLOW} strokeWidth="8" strokeDasharray="22 26" className={styles.march} />

      {/* Hills */}
      <path d="M780 600 Q960 410 1200 470 V600Z" fill={GREEN} />
      <path d="M560 600 Q680 500 840 600Z" fill="#1F7A60" />

      {/* Sun rays (rotating) */}
      <g className={styles.spin} style={origin(300, 280)}>
        {rays.map((a) => (
          <path key={a} d="M300 10 L330 110 L270 110Z" transform={`rotate(${a} 300 280)`} fill={GREEN} />
        ))}
      </g>

      {/* The camera-lens sun */}
      <circle cx="300" cy="280" r="215" fill={ORANGE} stroke={INK} strokeWidth="3" />
      <circle cx="300" cy="280" r="165" fill={NAVY} />
      <g clipPath="url(#lens-clip)">
        <g className={styles.spinRev} style={origin(300, 280)}>
          <path d="M140 230 C200 160 260 260 320 190 C380 120 440 210 470 160 L470 210 C430 260 380 170 320 240 C260 310 200 210 140 280Z" fill={SKY} />
          <path d="M130 340 C200 280 250 380 320 320 C390 260 430 360 480 320 L480 360 C430 410 380 310 320 370 C250 430 200 330 130 390Z" fill={SKY} />
        </g>
      </g>
      <circle cx="300" cy="280" r="165" fill="none" stroke={INK} strokeWidth="3" />
      <circle cx="300" cy="280" r="82" fill={INK} />
      <circle cx="300" cy="280" r="64" fill={BLUE} />
      <g className={styles.spin} style={origin(300, 280)}>
        <polygon points="300,246 329,263 329,297 300,314 271,297 271,263" fill={YELLOW} stroke={INK} strokeWidth="3" />
      </g>
      <circle cx="300" cy="280" r="9" fill={INK} />
      <path d="M262 238 Q280 224 300 222" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity="0.8" />

      {/* Stairs up to the lens */}
      {stairs.map((i) => {
        const y = 440 + i * 22
        const half = 46 + i * 15
        return <rect key={i} x={300 - half} y={y} width={half * 2} height="22" fill={i % 2 ? NAVY : ORANGE} />
      })}

      {/* Clouds */}
      <Cloud x={90} y={480} s={1.4} fill={PINK} shade={PINK_LIGHT} className={styles.drift} />
      <Cloud x={560} y={440} s={1.15} fill={PINK} shade={PINK_LIGHT} className={styles.driftRev} />
      <Cloud x={110} y={110} s={0.8} fill={PINK} shade={PINK_LIGHT} className={styles.driftRev} />
      <Cloud x={980} y={560} s={1} fill={CREAM} shade={PINK_LIGHT} className={styles.drift} />

      {/* Small planets */}
      <g className={styles.bob} style={origin(940, 100)}>
        <circle cx="940" cy="100" r="30" fill={TANGERINE} stroke={INK} strokeWidth="3" />
        <ellipse cx="940" cy="100" rx="52" ry="12" fill="none" stroke={INK} strokeWidth="4" transform="rotate(-18 940 100)" />
      </g>
      <g className={styles.bob} style={{ ...origin(640, 90), animationDelay: '1.2s' }}>
        <circle cx="640" cy="90" r="18" fill={PURPLE} stroke={INK} strokeWidth="3" />
        <path d="M624 84 H656" stroke={PINK} strokeWidth="5" />
      </g>
      <g className={styles.bob} style={{ ...origin(820, 520), animationDelay: '0.6s' }}>
        <circle cx="820" cy="520" r="14" fill={BLUE} stroke={INK} strokeWidth="3" />
      </g>

      {/* Flying polaroids */}
      <WingedPolaroid x={770} y={220} s={1.1} rot={-12} />
      <WingedPolaroid x={1010} y={440} s={0.95} rot={10} photo={[YELLOW, ORANGE]} delay={0.8} />
      <WingedPolaroid x={560} y={250} s={0.7} rot={6} photo={[SKY, PURPLE]} delay={1.6} />

      {/* Sparkles, dots and squiggles */}
      <Sparkle x={560} y={150} r={30} fill={PURPLE} />
      <Sparkle x={880} y={400} r={24} fill={ORANGE} delay={0.7} />
      <Sparkle x={520} y={540} r={18} fill={PURPLE} delay={1.4} />
      <Sparkle x={1090} y={160} r={16} fill={INK} delay={0.4} />
      <Sparkle x={60} y={260} r={14} fill={INK} delay={1.1} />
      {[
        [470, 90],
        [700, 380],
        [860, 60],
        [1130, 560],
        [600, 330],
        [40, 380],
        [990, 300],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill={INK} />
      ))}
      <path d="M690 130 q10 -12 20 0 t20 0 t20 0" fill="none" stroke={GREEN} strokeWidth="6" strokeLinecap="round" className={styles.wiggle} style={origin(720, 130)} />
      <path d="M440 380 q8 -10 16 0 t16 0 t16 0" fill="none" stroke={PURPLE} strokeWidth="6" strokeLinecap="round" className={styles.wiggle} style={{ ...origin(464, 380), animationDelay: '0.6s' }} />
    </svg>
  )
}

/** Heart path centred on (cx, cy), about 2·s·46 wide. */
const heart = (cx: number, cy: number, s: number) =>
  `M${cx} ${cy + 30 * s} C${cx - 28 * s} ${cy + 10 * s} ${cx - 44 * s} ${cy - 6 * s} ${cx - 44 * s} ${cy - 20 * s} C${cx - 44 * s} ${cy - 34 * s} ${cx - 33 * s} ${cy - 42 * s} ${cx - 21 * s} ${cy - 42 * s} C${cx - 11 * s} ${cy - 42 * s} ${cx - 4 * s} ${cy - 36 * s} ${cx} ${cy - 28 * s} C${cx + 4 * s} ${cy - 36 * s} ${cx + 11 * s} ${cy - 42 * s} ${cx + 21 * s} ${cy - 42 * s} C${cx + 33 * s} ${cy - 42 * s} ${cx + 44 * s} ${cy - 34 * s} ${cx + 44 * s} ${cy - 20 * s} C${cx + 44 * s} ${cy - 6 * s} ${cx + 28 * s} ${cy + 10 * s} ${cx} ${cy + 30 * s}Z`

/** A cheerful character wearing the booth's face props: cat ears, heart shades and blush. */
export function PropsPortrait() {
  return (
    <svg className={styles.portrait} viewBox="0 0 440 560" role="img" aria-label="An illustrated person grinning in heart-shaped sunglasses, cat ears and blush">
      <rect width="440" height="560" fill={SKY} />
      <circle cx="40" cy="40" r="90" fill={TANGERINE} />
      <path d="M-50 40 H130" stroke={YELLOW} strokeWidth="16" />
      <path d="M-50 80 H120" stroke={YELLOW} strokeWidth="10" />
      <circle cx="350" cy="150" r="64" fill={YELLOW} stroke={INK} strokeWidth="3" />
      <rect x="350" y="330" width="70" height="230" rx="35" fill={PINK} />
      <rect x="380" y="380" width="70" height="200" rx="35" fill={PINK_LIGHT} />
      <Sparkle x={385} y={250} r={22} fill={ORANGE} />
      <Sparkle x={70} y={250} r={14} fill={INK} delay={0.8} />
      <Sparkle x={300} y={60} r={12} fill={INK} delay={1.5} />
      <circle cx="110" cy="160" r="5" fill={INK} />
      <circle cx="400" cy="70" r="5" fill={INK} />

      {/* Jacket and neck */}
      <path d="M30 560 C40 470 110 432 160 424 L280 424 C330 432 400 470 410 560Z" fill={GREEN} stroke={INK} strokeWidth="3" />
      <path d="M280 470 V560 M160 470 V560" stroke={INK} strokeWidth="3" opacity="0.5" />
      <rect x="190" y="350" width="60" height="85" fill="#E2874F" stroke={INK} strokeWidth="3" />
      <path d="M160 424 L210 476 L184 510Z" fill={CREAM} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M280 424 L230 476 L256 510Z" fill={CREAM} stroke={INK} strokeWidth="3" strokeLinejoin="round" />

      {/* Head, which bobs along */}
      <g className={styles.headBob} style={origin(220, 400)}>
        <ellipse cx="220" cy="262" rx="100" ry="118" fill="#F4A06B" stroke={INK} strokeWidth="3" />
        <path d="M122 250 C110 150 180 112 240 120 C322 130 344 200 320 252 C300 200 262 178 212 182 C170 186 142 212 122 250Z" fill={PURPLE} stroke={INK} strokeWidth="3" strokeLinejoin="round" />

        {/* Cat ears on a headband */}
        <g className={styles.earWiggle} style={origin(220, 150)}>
          <path d="M140 160 Q220 118 300 160" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
          <path d="M142 162 L150 64 L206 136Z" fill={INK} strokeLinejoin="round" />
          <path d="M158 140 L162 92 L190 128Z" fill={PINK} />
          <path d="M298 162 L290 64 L234 136Z" fill={INK} strokeLinejoin="round" />
          <path d="M282 140 L278 92 L250 128Z" fill={PINK} />
        </g>

        {/* Blush, nose and grin */}
        <ellipse cx="152" cy="306" rx="24" ry="13" fill={PINK} opacity="0.9" />
        <ellipse cx="288" cy="306" rx="24" ry="13" fill={PINK} opacity="0.9" />
        <path d="M218 268 Q206 300 222 304" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M166 320 Q220 392 274 320Z" fill="#7A1730" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M176 324 Q220 340 264 324 L258 336 Q220 350 182 336Z" fill="#fff" />

        {/* Heart shades */}
        <g className={styles.shades} style={origin(220, 250)}>
          <path d="M196 244 Q220 232 244 244" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
          <path d={heart(170, 252, 0.95)} fill="#F0442E" stroke={INK} strokeWidth="5" />
          <path d={heart(270, 252, 0.95)} fill="#F0442E" stroke={INK} strokeWidth="5" />
          <path d="M146 232 q10 -8 22 -5 M246 232 q10 -8 22 -5" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
        </g>
      </g>
    </svg>
  )
}

/** Small scene for the side card: a winged polaroid flying past a moon. */
export function PolaroidCard() {
  return (
    <svg className={styles.small} viewBox="0 0 260 180" role="img" aria-label="A winged polaroid flying past a moon">
      <rect width="260" height="180" fill={PURPLE} />
      <circle cx="80" cy="60" r="70" fill="#E8E2FF" />
      <rect x="196" y="0" width="22" height="180" fill={YELLOW} />
      <rect x="226" y="0" width="34" height="180" fill={BLUE} />
      <path d="M0 150 Q80 120 160 150 T260 140 V180 H0Z" fill={PINK} />
      <Sparkle x={210} y={40} r={14} fill={INK} />
      <Sparkle x={30} y={140} r={10} fill={YELLOW} delay={0.9} />
      <WingedPolaroid x={140} y={100} s={0.8} rot={-14} photo={[PINK, ORANGE]} />
    </svg>
  )
}

/** A badge with text running round a circle, slowly spinning. */
export function SpinBadge({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <span className={styles.badge} aria-hidden="true">
      <svg viewBox="0 0 120 120" className={styles.badgeRing}>
        <defs>
          <path id="badge-ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
        </defs>
        <text fontFamily="Oswald, 'Arial Narrow', sans-serif" fontWeight="600" fontSize="13.2" letterSpacing="2.2" fill={INK}>
          <textPath href="#badge-ring">{text}</textPath>
        </text>
      </svg>
      <span className={styles.badgeCore}>{children}</span>
    </span>
  )
}
