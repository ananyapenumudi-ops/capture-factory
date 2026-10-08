import { useEffect, useRef, useState } from 'react'
import { cropToBlob, fileToBlob } from '../booth/capture'
import { getLayout } from '../booth/layouts'
import { beep, shutter, unlockAudio } from '../booth/sounds'
import { useCamera } from '../booth/useCamera'
import { PROPS } from '../face/props'
import { useFaceProps } from '../face/useFaceProps'
import { useSession } from '../store/session'
import styles from './Shoot.module.css'

type Phase = 'ready' | 'shooting' | 'review'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const CAMERA_MESSAGES = {
  denied: 'The machine needs your camera to take photos. Allow camera access in your browser settings, or upload photos instead.',
  unavailable: "We couldn't find a camera on this device. You can upload photos instead.",
  error: 'The camera hiccuped. Try again, or upload photos instead.',
} as const

export function Shoot() {
  const layout = getLayout(useSession((s) => s.layoutId))
  const shots = useSession((s) => s.shots)
  const muted = useSession((s) => s.muted)
  const setShot = useSession((s) => s.setShot)
  const clearShots = useSession((s) => s.clearShots)
  const go = useSession((s) => s.go)
  const props = useSession((s) => s.props)
  const toggleProp = useSession((s) => s.toggleProp)

  const { videoRef, status, retry } = useCamera()
  const { overlayRef, composite, ...face } = useFaceProps(videoRef, props, status === 'ready')
  const allTaken = shots.every(Boolean)
  const [phase, setPhase] = useState<Phase>(allTaken ? 'review' : 'ready')
  const [count, setCount] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)
  const [current, setCurrent] = useState(0)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  async function shoot(indices: number[]) {
    unlockAudio()
    setPhase('shooting')
    for (const i of indices) {
      setCurrent(i)
      for (const n of [3, 2, 1]) {
        if (!alive.current) return
        setCount(n)
        if (!muted) beep(n === 1 ? 1320 : 880)
        await sleep(800)
      }
      setCount(null)
      // The frame with any face props drawn on, so they are baked into the photo.
      const frame = composite()
      if (!alive.current || !frame) return
      const blob = await cropToBlob(frame, layout.slotW, layout.slotH, true)
      setFlash(true)
      if (!muted) shutter()
      setTimeout(() => setFlash(false), 220)
      setShot(i, blob)
      await sleep(900)
    }
    if (alive.current) setPhase('review')
  }

  async function onUpload(files: FileList | null) {
    if (!files?.length) return
    const empty = shots.map((s, i) => (s ? -1 : i)).filter((i) => i >= 0)
    const targets = empty.length ? empty : shots.map((_, i) => i)
    const picked = Array.from(files).slice(0, targets.length)
    for (const [k, file] of picked.entries()) {
      setShot(targets[k], await fileToBlob(file, layout.slotW, layout.slotH))
    }
    setPhase('review')
  }

  const cameraOk = status === 'ready'
  const aspect = layout.slotW / layout.slotH
  const shooting = phase === 'shooting'

  return (
    <div className={styles.shoot}>
      <div className={styles.stage}>
        <div className={styles.camera} style={{ width: `min(100%, calc(50svh * ${aspect} + 36px))` }}>
          <div className={styles.cameraTop} aria-hidden="true">
            <span className={styles.bulb} data-on={shooting || undefined} />
            <span className={styles.model}>CAPTURE-400</span>
            <span className={styles.dial} />
          </div>
          <div className={styles.viewfinder} style={{ aspectRatio: `${aspect}` }}>
          <video ref={videoRef} className={styles.video} playsInline muted autoPlay aria-label="Camera preview" />
          <canvas ref={overlayRef} className={styles.overlay} aria-hidden="true" />
          {cameraOk && face.status === 'loading' && <div className={styles.propsBadge}>Waking up the face tracker…</div>}
          {cameraOk && face.status === 'ready' && face.faces === 0 && !shooting && (
            <div className={styles.propsBadge}>Looking for a face…</div>
          )}

          {status === 'starting' && <div className={styles.notice}>Warming up the camera…</div>}
          {status !== 'ready' && status !== 'starting' && (
            <div className={styles.notice}>
              <p>{CAMERA_MESSAGES[status]}</p>
              <button className="btn btn-small" onClick={retry}>
                Try again
              </button>
            </div>
          )}

          {count !== null && (
            <div key={count} className={styles.count} aria-live="assertive">
              {count}
            </div>
          )}
          {flash && <div className={styles.flash} />}
          {shooting && (
            <div className={styles.badge}>
              Shot {current + 1} of {layout.shots}
            </div>
          )}
          </div>
        </div>

        {cameraOk && (
          <div className={styles.props}>
            <div className={styles.propsHead}>
              <span className="label">Props</span>
              {face.status === 'error' && (
                <button className={styles.propsError} onClick={face.retry}>
                  Face tracker failed to load. Tap to retry.
                </button>
              )}
            </div>
            <div className={styles.propList} role="group" aria-label="Face props">
              {PROPS.map((p) => (
                <button
                  key={p.id}
                  className={styles.prop}
                  aria-pressed={props.includes(p.id)}
                  disabled={shooting}
                  onClick={() => toggleProp(p.id)}
                >
                  <span className={styles.propEmoji} aria-hidden="true">
                    {p.emoji}
                  </span>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <ol className={styles.thumbs} aria-label="Your shots">
          {shots.map((s, i) => (
            <li key={i} className={styles.thumbItem}>
              <div
                className={`${styles.thumb} ${shooting && current === i ? styles.thumbActive : ''}`}
                style={{ aspectRatio: `${aspect}` }}
              >
                {s ? <img key={s.id} src={s.url} alt={`Shot ${i + 1}`} /> : <span>{i + 1}</span>}
              </div>
              {phase === 'review' && s && cameraOk && (
                <button className={styles.retake} onClick={() => shoot([i])} aria-label={`Retake shot ${i + 1}`}>
                  ↺ Retake
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.controls}>
        {phase === 'ready' && (
          <>
            <button className={styles.shutter} onClick={() => shoot(shots.map((_, i) => i))} disabled={!cameraOk}>
              <span className="visually-hidden">Start the countdown</span>
            </button>
            <p className={styles.hint}>
              {cameraOk ? `Tap to start. ${layout.shots} shots, 3 seconds each.` : 'Camera not ready yet'}
            </p>
          </>
        )}

        {shooting && <p className={styles.hint}>Hold that pose…</p>}

        {phase === 'review' && (
          <div className={styles.reviewActions}>
            <button className="btn btn-red" onClick={() => go('decorate')} disabled={!allTaken}>
              Decorate →
            </button>
            <button
              className="btn"
              onClick={() => {
                clearShots()
                setPhase('ready')
              }}
            >
              Start over
            </button>
          </div>
        )}

        {!shooting && (
          <div className={styles.secondary}>
            <button className="btn btn-small" onClick={() => go('setup')}>
              ← Layout
            </button>
            <label className="btn btn-small">
              Upload photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="visually-hidden"
                onChange={(e) => {
                  void onUpload(e.target.files)
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
