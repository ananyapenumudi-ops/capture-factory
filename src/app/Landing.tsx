import { useSession } from '../store/session'
import styles from './Landing.module.css'

const RIBBON = ['var(--butter)', 'var(--tangerine)', 'var(--bubblegum)', 'var(--periwinkle)']
const RIBBON_PATH = 'M-40 250 C 80 120, 200 120, 300 210 S 520 330, 640 170'

function Sparkle({ x, y, size, color }: { x: string; y: string; size: number; color: string }) {
  return (
    <svg className={styles.sparkle} style={{ left: x, top: y, width: size, height: size }} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0Z" fill={color} />
    </svg>
  )
}

const STEPS = [
  { n: '1', title: 'Pose', text: 'A 3-2-1 countdown snaps your shots. Retake any you hate.' },
  { n: '2', title: 'Decorate', text: 'Stickers, frames and filters. Make it gloriously extra.' },
  { n: '3', title: 'Print', text: 'Download your strip, ticket stub and all.' },
]

export function Landing() {
  const go = useSession((s) => s.go)
  const newSession = useSession((s) => s.newSession)

  return (
    <div className={styles.landing}>
      <section className={styles.sky}>
        <svg className={styles.ribbon} viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {RIBBON.map((color, i) => (
            <path
              key={color}
              d={RIBBON_PATH}
              transform={`translate(0 ${i * 22})`}
              fill="none"
              stroke={color}
              strokeWidth="24"
              strokeLinecap="round"
            />
          ))}
        </svg>
        <Sparkle x="8%" y="14%" size={18} color="var(--cream)" />
        <Sparkle x="84%" y="10%" size={24} color="var(--butter)" />
        <Sparkle x="90%" y="62%" size={14} color="var(--cream)" />
        <Sparkle x="14%" y="70%" size={20} color="var(--bubblegum)" />

        <div className={styles.hero}>
          <p className={styles.kicker}>Your browser is now a photo booth</p>
          <h1 className={styles.title}>
            <span>Capture</span>
            <span>Factory</span>
          </h1>
          <p className={styles.sub}>Strike a pose. The machine does the rest.</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              newSession()
              go('setup')
            }}
          >
            Step into the booth →
          </button>
        </div>
      </section>

      <svg className={styles.wave} viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40 V18 C 60 0, 120 36, 200 18 S 340 0, 400 20 V40 Z" fill="var(--cream)" />
      </svg>

      <section className={styles.ground}>
        <h2 className={styles.how}>How the machine works</h2>
        <ol className={styles.steps}>
          {STEPS.map((s) => (
            <li key={s.n} className={styles.step}>
              <span className={styles.num}>{s.n}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className={styles.privacy}>🔒 Everything happens on your device. No uploads, no accounts.</p>
      </section>
    </div>
  )
}
