import { LAYOUTS, type Layout } from '../booth/layouts'
import { useSession } from '../store/session'
import styles from './Setup.module.css'

/** A tiny to-scale drawing of the layout's photo slots and ticket stub. */
function LayoutPreview({ layout }: { layout: Layout }) {
  const pct = (v: number, of: number) => `${(v / of) * 100}%`
  return (
    <div className={styles.preview} style={{ aspectRatio: `${layout.width} / ${layout.height}` }}>
      {layout.slots.map((s, i) => (
        <span
          key={i}
          className={styles.slot}
          style={{ left: pct(s.x, layout.width), top: pct(s.y, layout.height), width: pct(s.w, layout.width), height: pct(s.h, layout.height) }}
        />
      ))}
      <span
        className={styles.ticket}
        style={{
          left: pct(layout.footer.x, layout.width),
          top: pct(layout.footer.y, layout.height),
          width: pct(layout.footer.w, layout.width),
          height: pct(layout.footer.h, layout.height),
        }}
      />
    </div>
  )
}

export function Setup() {
  const layoutId = useSession((s) => s.layoutId)
  const chooseLayout = useSession((s) => s.chooseLayout)
  const go = useSession((s) => s.go)

  return (
    <div className={styles.setup}>
      <h1 className={styles.title}>Pick your print</h1>
      <p className={styles.sub}>You can change your mind later, the machine doesn't judge.</p>

      <div className={styles.grid} role="radiogroup" aria-label="Photo layout">
        {LAYOUTS.map((l) => (
          <button
            key={l.id}
            role="radio"
            aria-checked={l.id === layoutId}
            className={styles.card}
            onClick={() => chooseLayout(l.id)}
          >
            <div className={styles.previewBox}>
              <LayoutPreview layout={l} />
            </div>
            <strong>{l.name}</strong>
            <span>{l.blurb}</span>
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button className="btn btn-quiet" onClick={() => go('landing')}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={() => go('shoot')}>
          Next: camera 📸
        </button>
      </div>
    </div>
  )
}
