import type { CSSProperties } from 'react'
import { LAYOUTS, type Layout } from '../booth/layouts'
import { useSession } from '../store/session'
import styles from './Setup.module.css'

/** A tiny to-scale drawing of the layout's photo slots and ticket stub. */
function LayoutPreview({ layout }: { layout: Layout }) {
  const pct = (v: number, of: number) => `${(v / of) * 100}%`
  const box = (r: { x: number; y: number; w: number; h: number }) => ({
    left: pct(r.x, layout.width),
    top: pct(r.y, layout.height),
    width: pct(r.w, layout.width),
    height: pct(r.h, layout.height),
  })
  return (
    <div className={styles.preview} style={{ aspectRatio: `${layout.width} / ${layout.height}` }}>
      {layout.slots.map((s, i) => (
        <span key={i} className={styles.slot} style={box(s)} />
      ))}
      <span className={styles.ticket} style={box(layout.footer)} />
    </div>
  )
}

export function Setup() {
  const layoutId = useSession((s) => s.layoutId)
  const chooseLayout = useSession((s) => s.chooseLayout)
  const go = useSession((s) => s.go)

  return (
    <div className={styles.setup}>
      <div className={styles.head}>
        <p className="label">Form 01 · Print order</p>
        <h1 className={styles.title}>Pick your print</h1>
        <p className={styles.sub}>Tick one box. The machine doesn't judge.</p>
      </div>

      <div className={styles.grid} role="radiogroup" aria-label="Photo layout">
        {LAYOUTS.map((l, i) => (
          <button
            key={l.id}
            role="radio"
            aria-checked={l.id === layoutId}
            className={`paper ${styles.card}`}
            style={{ '--i': i, '--r': `${[-2, 1.5, -1, 2][i]}deg` } as CSSProperties}
            onClick={() => chooseLayout(l.id)}
          >
            <span className={styles.cardNo}>№ 0{i + 1}</span>
            <div className={styles.previewBox}>
              <LayoutPreview layout={l} />
            </div>
            <strong className={styles.cardName}>{l.name}</strong>
            <span className={styles.cardBlurb}>{l.blurb}</span>
            {l.id === layoutId && (
              <span className={styles.selected} aria-hidden="true">
                Selected
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button className="btn btn-ghost" onClick={() => go('landing')}>
          ← Back
        </button>
        <button className="btn btn-red" onClick={() => go('shoot')}>
          Next: camera →
        </button>
      </div>
    </div>
  )
}
