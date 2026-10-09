import { useEffect, useRef, type CSSProperties } from 'react'
import { PolaroidCard, PopScene, PropsPortrait, SpinBadge } from '../art/PopArt'
import { LAYOUTS, type LayoutId } from '../booth/layouts'
import { getSticker, svgUrl } from '../decorate/stickers'
import { useSession } from '../store/session'
import styles from './Landing.module.css'

const GALLERY: { bg: string; a: string; b: string; caption: string }[] = [
  { bg: 'var(--orange)', a: 'camera', b: 'sparkle', caption: 'Say cheese' },
  { bg: 'var(--blue)', a: 'winged-polaroid', b: 'planet', caption: 'Out of this world' },
  { bg: 'var(--yellow)', a: 'cassette', b: 'heart', caption: 'Mixtape mood' },
  { bg: 'var(--pink)', a: 'admit-one', b: 'daisy', caption: 'Admit one' },
]

const stickerSrc = (id: string) => {
  const s = getSticker(id)
  return s ? svgUrl(s.svg) : ''
}

/** Fades sections up as they scroll into view. */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-shown', '')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.15 },
    )
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return ref
}

export function Landing() {
  const go = useSession((s) => s.go)
  const newSession = useSession((s) => s.newSession)
  const chooseLayout = useSession((s) => s.chooseLayout)
  const rootRef = useReveal()

  const start = () => {
    newSession()
    go('setup')
  }

  const startWith = (id: LayoutId) => {
    chooseLayout(id)
    newSession()
    go('shoot')
  }

  return (
    <div ref={rootRef} className={styles.landing}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>
            <span style={{ '--i': 0 } as CSSProperties}>Capture</span>
            <span style={{ '--i': 1 } as CSSProperties}>Factory</span>
          </h1>
          <div className={styles.badge}>
            <SpinBadge text="STRIKE A POSE • STRIKE A POSE • ">★</SpinBadge>
          </div>
        </div>
        <div className={styles.heroSide}>
          <h2 className={styles.kicker}>A photo booth for pop lovers</h2>
          <p>
            Strike a pose, wear some ridiculous face props, cover your strip in stickers and take it home. It all happens in your
            browser, and your photos never leave your device.
          </p>
          <button className={`btn ${styles.cta}`} onClick={start}>
            Step inside
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <div className={styles.sceneBand}>
        <div className={styles.sceneFrame}>
          <PopScene />
        </div>
      </div>

      {/* ── Pick a print ── */}
      <section className={styles.lavender}>
        <div id="prints" className={styles.pick} data-reveal>
          <h2 className={styles.sectionTitle}>Pick your print</h2>
          <div className={styles.pills}>
            {LAYOUTS.map((l, i) => (
              <button
                key={l.id}
                className={styles.pill}
                style={{ '--i': i } as CSSProperties}
                onClick={() => startWith(l.id)}
                title={l.blurb}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Meet the props ── */}
        <div id="props" className={styles.feature}>
          <div className={`card ${styles.featureLabel}`} data-reveal>
            <h2>Meet the props</h2>
            <p>Heart shades, cat ears, flower crowns and more. They follow your face as you move.</p>
          </div>
          <div className={styles.portrait} data-reveal>
            <PropsPortrait />
          </div>
          <div className={styles.featureSide} data-reveal>
            <div className={styles.sideCard}>
              <PolaroidCard />
            </div>
            <p>
              Then decorate: 48 stickers, 14 frames, filters and captions. Print a high-res strip with its own numbered ticket.
            </p>
          </div>
          <span className={styles.floatPlanet} aria-hidden="true">
            <img src={stickerSrc('planet')} alt="" />
          </span>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section id="gallery" className={styles.gallerySection}>
        <p className="label">Fresh off the press</p>
        <h2 className={styles.handle}>@capturefactory</h2>
        <div className={styles.gallery}>
          {GALLERY.map((g, i) => (
            <figure key={g.caption} className={styles.tile} style={{ background: g.bg, '--i': i } as CSSProperties} data-reveal>
              <img className={styles.tileA} src={stickerSrc(g.a)} alt="" />
              <img className={styles.tileB} src={stickerSrc(g.b)} alt="" />
              <figcaption>{g.caption}</figcaption>
            </figure>
          ))}
        </div>
        <button className="btn btn-hot" onClick={start}>
          Make your strip →
        </button>
      </section>
    </div>
  )
}
