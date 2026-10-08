import { useEffect, useState } from 'react'
import { getLayout } from '../booth/layouts'
import { renderStrip } from '../export/renderStrip'
import { useSession, type Shot } from '../store/session'
import styles from './Result.module.css'

type Print = { blob: Blob; url: string }

export function Result() {
  const layout = getLayout(useSession((s) => s.layoutId))
  const shots = useSession((s) => s.shots)
  const serial = useSession((s) => s.serial)
  const go = useSession((s) => s.go)
  const newSession = useSession((s) => s.newSession)
  const [print, setPrint] = useState<Print | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    let made: string | null = null
    renderStrip(layout, shots as Shot[], serial)
      .then((blob) => {
        if (!alive) return
        made = URL.createObjectURL(blob)
        setPrint({ blob, url: made })
      })
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
      if (made) URL.revokeObjectURL(made)
    }
  }, [layout, shots, serial])

  const filename = `capture-factory-${serial}.png`
  const file = print ? new File([print.blob], filename, { type: 'image/png' }) : null
  const canShare = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

  async function share() {
    if (!file) return
    try {
      await navigator.share({ files: [file], title: 'My Capture Factory strip' })
    } catch {
      // The user closed the share sheet; nothing to do.
    }
  }

  return (
    <div className={styles.result}>
      <div className={styles.printer}>
        <div className={styles.slot} aria-hidden="true" />
        <div className={styles.paper}>
          {print ? (
            <img
              className={styles.strip}
              src={print.url}
              alt={`Your ${layout.name.toLowerCase()} photo strip, ticket number ${serial}`}
            />
          ) : (
            <p className={styles.developing}>{failed ? 'The printer jammed. Try again?' : 'Developing…'}</p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {print && canShare && (
          <button className="btn btn-pink" onClick={share}>
            Share or save 📲
          </button>
        )}
        {print && (
          <a className={`btn ${canShare ? '' : 'btn-primary'}`} href={print.url} download={filename}>
            Download PNG ⬇
          </a>
        )}
        <div className={styles.row}>
          <button className="btn btn-quiet" onClick={() => go('shoot')}>
            ← Retake shots
          </button>
          <button
            className="btn btn-quiet"
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
