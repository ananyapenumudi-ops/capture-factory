import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { getSticker, svgUrl } from '../decorate/stickers'
import { useSession } from '../store/session'
import styles from './Landing.module.css'

type Prop = { id: string; x: string; y: string; r: number; w: string; depth: number; delay: number; wideOnly?: boolean }

/** Things lying on the desk around the dossier. `depth` sets how far each one drifts with the pointer. */
const PROPS: Prop[] = [
  { id: 'admit-one', x: '-3%', y: '3%', r: -14, w: 'clamp(120px, 22vw, 230px)', depth: 14, delay: 0.1 },
  { id: 'postage-camera', x: '82%', y: '1%', r: 9, w: 'clamp(72px, 11vw, 120px)', depth: 22, delay: 0.25 },
  { id: 'made-in', x: '-6%', y: '76%', r: 10, w: 'clamp(130px, 22vw, 230px)', depth: 10, delay: 0.4 },
  { id: 'cassette', x: '74%', y: '72%', r: -9, w: 'clamp(120px, 18vw, 210px)', depth: 18, delay: 0.55 },
  { id: 'heart', x: '88%', y: '44%', r: 14, w: 'clamp(40px, 6vw, 64px)', depth: 30, delay: 0.7 },
  { id: 'daisy', x: '3%', y: '46%', r: -6, w: 'clamp(54px, 8vw, 90px)', depth: 26, delay: 0.8 },
  { id: 'postmark', x: '56%', y: '88%', r: -4, w: '190px', depth: 8, delay: 0.9, wideOnly: true },
  { id: 'boarding', x: '68%', y: '30%', r: 6, w: '230px', depth: 12, delay: 0.5, wideOnly: true },
  { id: 'sparkle', x: '22%', y: '18%', r: 0, w: '44px', depth: 34, delay: 1, wideOnly: true },
]

const LINES = ['SUBJECT ...... YOU', 'MISSION ...... STRIKE A POSE', 'OUTCOME ...... ONE PHOTO STRIP']

const RECORD = [
  { n: '01', title: 'Pick a print', text: 'Classic strip, trio, grid or a single polaroid.', stamp: 'top-snap' },
  { n: '02', title: 'Strike a pose', text: 'A 3-2-1 countdown snaps every shot. Retake the duds.', stamp: 'postage-camera' },
  { n: '03', title: 'Decorate it', text: 'Tickets, stamps, gingham, leopard, cherries, captions.', stamp: 'postage-heart' },
  { n: '04', title: 'Take it home', text: 'Download a high-res strip with its own numbered ticket.', stamp: 'approved' },
]

function stickerSrc(id: string) {
  const s = getSticker(id)
  return s ? svgUrl(s.svg) : ''
}

/** Adds a class once the element scrolls into view, to trigger its entrance animation. */
function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, seen] as const
}

export function Landing() {
  const go = useSession((s) => s.go)
  const newSession = useSession((s) => s.newSession)
  const serial = useSession((s) => s.serial)
  const deskRef = useRef<HTMLElement>(null)
  const [recordRef, recordSeen] = useInView<HTMLElement>()

  // Props drift gently with the pointer, for a bit of depth on desktop.
  function onPointerMove(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse') return
    const el = deskRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
    el.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
  }

  const start = () => {
    newSession()
    go('setup')
  }

  return (
    <div className={styles.landing}>
      <section ref={deskRef} className={styles.desk} onPointerMove={onPointerMove}>
        {PROPS.map((p) => (
          <div
            key={p.id}
            className={`${styles.prop} ${p.wideOnly ? styles.wideOnly : ''}`}
            style={{ left: p.x, top: p.y, width: p.w, '--depth': p.depth, '--r': `${p.r}deg`, '--d': `${p.delay}s` } as CSSProperties}
            aria-hidden="true"
          >
            <img src={stickerSrc(p.id)} alt="" draggable={false} />
          </div>
        ))}

        <figure className={`${styles.polaroid} ${styles.wideOnly}`} aria-hidden="true">
          <div className={styles.photo}>
            <span className={styles.sun} />
            <span className={styles.hill} />
          </div>
          <figcaption>say cheese!</figcaption>
        </figure>

        <article className={`paper ${styles.dossier}`}>
          <span className={styles.clip} aria-hidden="true" />
          <div className={styles.fileRow}>
            <span className="label">File № CF-{serial}</span>
            <span className={`label ${styles.classified}`}>Classified</span>
          </div>

          <h1 className={styles.title}>
            <span className={styles.redBar}>Capture</span>
            <span className={styles.titleLine}>Factory</span>
          </h1>
          <p className={styles.tagline}>A photo booth machine, hidden inside your browser.</p>

          <div className={styles.typed} aria-label={LINES.join('. ')}>
            {LINES.map((l, i) => (
              <span key={l} className={styles.line} style={{ '--n': l.length, '--i': i } as CSSProperties} aria-hidden="true">
                {l}
              </span>
            ))}
          </div>

          <button className={styles.ticketBtn} onClick={start}>
            <span className={styles.ticketSmall}>Admit one</span>
            <span className={styles.ticketBig}>Step into the booth →</span>
          </button>

          <img className={styles.seal} src={stickerSrc('top-snap')} alt="" aria-hidden="true" />
        </article>
      </section>

      <section ref={recordRef} className={`paper ${styles.record} ${recordSeen ? styles.seen : ''}`}>
        <h2 className={styles.recordTitle}>Travel record</h2>
        <p className={`label ${styles.recordSub}`}>How the machine works</p>
        <ol className={styles.entries}>
          {RECORD.map((r, i) => (
            <li key={r.n} className={styles.entry} style={{ '--i': i } as CSSProperties}>
              <img className={styles.stamp} src={stickerSrc(r.stamp)} alt="" aria-hidden="true" />
              <div>
                <span className={styles.entryNum}>{r.n}</span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className={styles.privacy}>🔒 Everything happens on your device. No uploads, no accounts, no funny business.</p>
        <button className="btn btn-red" onClick={start}>
          Start shooting
        </button>
      </section>
    </div>
  )
}
