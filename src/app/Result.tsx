import { useMemo, type CSSProperties } from 'react'
import { getLayout } from '../booth/layouts'
import { seeded } from '../decorate/frames'
import { useSession } from '../store/session'
import styles from './Result.module.css'

const CONFETTI_COLORS = ['#C8282E', '#F4ECD8', '#D9A441', '#E9A3B0', '#3B4F8F', '#9DAE8E']

/** Little paper scraps that burst out when the strip lands. */
function Confetti() {
  const pieces = useMemo(() => {
    const rand = seeded(42)
    return Array.from({ length: 36 }, (_, i) => ({
      x: (rand() - 0.5) * 520,
      y: -(rand() * 280 + 80),
      r: rand() * 720 - 360,
      w: rand() * 8 + 6,
      h: rand() * 10 + 8,
      c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      d: rand() * 0.3,
    }))
  }, [])
  return (
    <div className={styles.confetti} aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={
            {
              '--x': `${p.x}px`,
              '--y': `${p.y}px`,
              '--rot': `${p.r}deg`,
              width: p.w,
              height: p.h,
              background: p.c,
              animationDelay: `${2.3 + p.d}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

export function Result() {
  const layout = getLayout(useSession((s) => s.layoutId))
  const print = useSession((s) => s.print)
  const serial = useSession((s) => s.serial)
  const go = useSession((s) => s.go)
  const newSession = useSession((s) => s.newSession)

  const filename = `capture-factory-${serial}.png`
  const file = useMemo(() => (print ? new File([print.blob], filename, { type: 'image/png' }) : null), [print, filename])
  const canShare = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

  async function share() {
    if (!file) return
    try {
      await navigator.share({ files: [file], title: 'My Capture Factory strip' })
    } catch {
      // The share sheet was closed; nothing to do.
    }
  }

  if (!print) {
    return (
      <div className={styles.result}>
        <p className={styles.empty}>Nothing in the tray yet.</p>
        <button className="btn btn-red" onClick={() => go('decorate')}>
          Back to decorating
        </button>
      </div>
    )
  }

  return (
    <div className={styles.result}>
      <div className={styles.printer}>
        <div className={styles.mouth} aria-hidden="true">
          <span className={styles.light} />
          <span className="label">Output tray</span>
          <span className={styles.light} />
        </div>
        <div className={styles.paper}>
          <div className={styles.stripWrap}>
            <img className={styles.strip} src={print.url} alt={`Your ${layout.name.toLowerCase()} photo strip, ticket number ${serial}`} />
            <span className={styles.developed} aria-hidden="true">
              Developed
            </span>
          </div>
        </div>
        <Confetti />
      </div>

      <div className={styles.actions}>
        <p className={`label ${styles.receipt}`}>
          Ticket № {serial} · Ready to take home
        </p>
        <div className={styles.row}>
          {canShare && (
            <button className="btn btn-dark" onClick={share}>
              Share / save
            </button>
          )}
          <a className="btn btn-red" href={print.url} download={filename}>
            Download PNG
          </a>
        </div>
        <div className={styles.row}>
          <button className="btn btn-small" onClick={() => go('decorate')}>
            ← Keep decorating
          </button>
          <button
            className="btn btn-small"
            onClick={() => {
              newSession()
              go('setup')
            }}
          >
            New strip ✦
          </button>
        </div>
      </div>
    </div>
  )
}
