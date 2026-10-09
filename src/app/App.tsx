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

const STEPS: { id: Step; label: string }[] = [
  { id: 'setup', label: 'Layout' },
  { id: 'shoot', label: 'Pose' },
  { id: 'decorate', label: 'Decorate' },
  { id: 'result', label: 'Print' },
]

export default function App() {
  const step = useSession((s) => s.step)
  const go = useSession((s) => s.go)
  const newSession = useSession((s) => s.newSession)
  const muted = useSession((s) => s.muted)
  const toggleMute = useSession((s) => s.toggleMute)
  const stepIndex = STEPS.findIndex((s) => s.id === step)

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <button className={styles.logo} onClick={() => go('landing')} aria-label="Capture Factory home">
          Capture Factory
        </button>

        {stepIndex >= 0 ? (
          <nav className={styles.steps} aria-label="Progress">
            <ol>
              {STEPS.map((s, i) => (
                <li
                  key={s.id}
                  className={i === stepIndex ? styles.stepActive : i < stepIndex ? styles.stepDone : undefined}
                  aria-current={i === stepIndex ? 'step' : undefined}
                >
                  <span className={styles.stepNum}>{i < stepIndex ? '✓' : i + 1}</span>
                  <span className={styles.stepLabel}>{s.label}</span>
                </li>
              ))}
            </ol>
          </nav>
        ) : (
          <nav className={styles.links} aria-label="Sections">
            <a href="#prints">Prints</a>
            <a href="#props">Props</a>
            <a href="#gallery">Gallery</a>
          </nav>
        )}

        <div className={styles.headerEnd}>
          <button
            className={styles.iconBtn}
            onClick={toggleMute}
            aria-pressed={muted}
            aria-label={muted ? 'Turn sound on' : 'Mute sound'}
            title={muted ? 'Sound off' : 'Sound on'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {step === 'landing' && (
            <button
              className={`btn btn-small ${styles.start}`}
              onClick={() => {
                newSession()
                go('setup')
              }}
            >
              Start
            </button>
          )}
        </div>
      </header>

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

      {step === 'landing' && (
        <footer className={styles.footer}>
          <span>© {YEAR} Capture Factory</span>
          <span>Photos never leave your device</span>
        </footer>
      )}
    </div>
  )
}
