import { Landing } from './Landing'
import { Result } from './Result'
import { Setup } from './Setup'
import { Shoot } from './Shoot'
import { useSession } from '../store/session'
import styles from './App.module.css'

const MARQUEE = 'Free photo strips  ✦  Strike a pose  ✦  Photos never leave your device  ✦  '

export default function App() {
  const step = useSession((s) => s.step)
  const go = useSession((s) => s.go)
  const muted = useSession((s) => s.muted)
  const toggleMute = useSession((s) => s.toggleMute)

  return (
    <div className={styles.app}>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>{MARQUEE.repeat(6)}</div>
      </div>

      <header className={styles.header}>
        <button className={styles.logo} onClick={() => go('landing')} aria-label="Capture Factory home">
          Capture <span>Factory</span>
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

      <main className={styles.main}>
        {step === 'landing' && <Landing />}
        {step === 'setup' && <Setup />}
        {step === 'shoot' && <Shoot />}
        {step === 'result' && <Result />}
      </main>
    </div>
  )
}
