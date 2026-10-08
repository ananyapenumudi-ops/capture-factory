import { lazy, Suspense } from 'react'
import { Landing } from './Landing'
import { Result } from './Result'
import { Setup } from './Setup'
import { Shoot } from './Shoot'
import { useSession, type Step } from '../store/session'
import styles from './App.module.css'

// The decorate screen pulls in Konva, so it loads on demand.
const Decorate = lazy(() => import('./Decorate').then((m) => ({ default: m.Decorate })))

const YEAR = new Date().getFullYear()

const MARQUEE = 'NOW DEVELOPING  ✦  FREE PHOTO STRIPS  ✦  STRIKE A POSE  ✦  PHOTOS NEVER LEAVE YOUR DEVICE  ✦  '

const STEPS: { id: Step; label: string }[] = [
  { id: 'setup', label: 'Layout' },
  { id: 'shoot', label: 'Pose' },
  { id: 'decorate', label: 'Decorate' },
  { id: 'result', label: 'Print' },
]

export default function App() {
  const step = useSession((s) => s.step)
  const go = useSession((s) => s.go)
  const muted = useSession((s) => s.muted)
  const toggleMute = useSession((s) => s.toggleMute)
  const stepIndex = STEPS.findIndex((s) => s.id === step)

  return (
    <div className={styles.app}>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>{MARQUEE.repeat(6)}</div>
      </div>

      <header className={styles.header}>
        <button className={styles.logo} onClick={() => go('landing')} aria-label="Capture Factory home">
          <span className={styles.logoMain}>Capture Factory</span>
          <span className={styles.logoSub}>Photo Dept. · Est. {YEAR}</span>
        </button>
        <button
          className={styles.iconBtn}
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Turn sound on' : 'Mute sound'}
          title={muted ? 'Sound off' : 'Sound on'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </header>

      {stepIndex >= 0 && (
        <nav className={styles.tabs} aria-label="Progress">
          <ol>
            {STEPS.map((s, i) => (
              <li
                key={s.id}
                className={i === stepIndex ? styles.tabActive : i < stepIndex ? styles.tabDone : undefined}
                aria-current={i === stepIndex ? 'step' : undefined}
              >
                <span className={styles.tabNum}>0{i + 1}</span> {s.label}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <main className={styles.main}>
        <div key={step} className={`screen-enter ${styles.screen}`}>
          {step === 'landing' && <Landing />}
          {step === 'setup' && <Setup />}
          {step === 'shoot' && <Shoot />}
          {step === 'decorate' && (
            <Suspense fallback={<p className={styles.loading}>Unpacking the sticker box…</p>}>
              <Decorate />
            </Suspense>
          )}
          {step === 'result' && <Result />}
        </div>
      </main>
    </div>
  )
}
