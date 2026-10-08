import type Konva from 'konva'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getLayout } from '../booth/layouts'
import { FILTERS } from '../decorate/filters'
import { FRAMES } from '../decorate/frames'
import { StripCanvas } from '../decorate/StripCanvas'
import { stickerCanvas } from '../decorate/stickerImage'
import { PACKS, STICKERS, svgUrl, type PackId } from '../decorate/stickers'
import { canvasToBlob, renderBase } from '../export/renderStrip'
import { useSession, type Item, type Shot } from '../store/session'
import styles from './Decorate.module.css'

type Tab = 'stickers' | 'frames' | 'filters' | 'text'

const TABS: { id: Tab; label: string }[] = [
  { id: 'stickers', label: 'Stickers' },
  { id: 'frames', label: 'Frames' },
  { id: 'filters', label: 'Filters' },
  { id: 'text', label: 'Caption' },
]

const FONTS = [
  { id: '"Playfair Display"', label: 'Serif', style: { fontFamily: 'var(--font-display)', fontStyle: 'italic' } },
  { id: '"Courier Prime"', label: 'Typewriter', style: { fontFamily: 'var(--font-mono)' } },
  { id: '"Homemade Apple"', label: 'Handwritten', style: { fontFamily: 'var(--font-hand)', fontSize: '0.8rem' } },
]

const COLORS = ['#2B2522', '#C8282E', '#F4ECD8', '#D9A441', '#E0607E', '#3B4F8F']

const uid = () => crypto.randomUUID().slice(0, 8)
/** Random number in [-range/2, range/2], for a hand-placed look. */
const jitter = (range: number) => (Math.random() - 0.5) * range

/** Undo/redo over the list of placed items. */
function useHistory() {
  const items = useSession((s) => s.items)
  const setItems = useSession((s) => s.setItems)
  const [past, setPast] = useState<Item[][]>([])
  const [future, setFuture] = useState<Item[][]>([])

  const commit = useCallback(
    (next: Item[]) => {
      setPast((p) => [...p.slice(-49), items])
      setFuture([])
      setItems(next)
    },
    [items, setItems],
  )
  const undo = useCallback(() => {
    if (!past.length) return
    setFuture((f) => [items, ...f])
    setItems(past[past.length - 1])
    setPast((p) => p.slice(0, -1))
  }, [past, items, setItems])
  const redo = useCallback(() => {
    if (!future.length) return
    setPast((p) => [...p, items])
    setItems(future[0])
    setFuture((f) => f.slice(1))
  }, [future, items, setItems])

  return { items, commit, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 }
}

export function Decorate() {
  const layout = getLayout(useSession((s) => s.layoutId))
  const shots = useSession((s) => s.shots)
  const serial = useSession((s) => s.serial)
  const frameId = useSession((s) => s.frameId)
  const filterId = useSession((s) => s.filterId)
  const setFrame = useSession((s) => s.setFrame)
  const setFilter = useSession((s) => s.setFilter)
  const setPrint = useSession((s) => s.setPrint)
  const go = useSession((s) => s.go)
  const { items, commit, undo, redo, canUndo, canRedo } = useHistory()

  const [tab, setTab] = useState<Tab>('stickers')
  const [pack, setPack] = useState<PackId>('tickets')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [popId, setPopId] = useState<string | null>(null)
  const [base, setBase] = useState<HTMLCanvasElement | null>(null)
  const [images, setImages] = useState<Record<string, HTMLCanvasElement>>({})
  const [boardW, setBoardW] = useState(320)
  const [printing, setPrinting] = useState(false)
  const [draft, setDraft] = useState('Best day ever')
  const [font, setFont] = useState(FONTS[0].id)
  const [color, setColor] = useState(COLORS[1])

  const boardRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage | null>(null)

  // Re-render the strip base whenever the frame or filter changes.
  useEffect(() => {
    let alive = true
    renderBase({ layout, shots: shots as Shot[], serial, frameId, filterId }).then((c) => alive && setBase(c))
    return () => {
      alive = false
    }
  }, [layout, shots, serial, frameId, filterId])

  // Load sticker artwork for anything on the strip.
  useEffect(() => {
    for (const it of items) {
      const id = it.stickerId
      if (!id || images[id]) continue
      void stickerCanvas(id).then((c) => setImages((m) => ({ ...m, [id]: c })))
    }
  }, [items, images])

  useEffect(() => {
    const el = boardRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBoardW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Fit the strip to the board's width, but never narrower than ~340px so stickers
  // stay easy to grab on a phone; tall strips scroll inside the board instead.
  const scale = useMemo(() => {
    const fitW = boardW / layout.width
    const fitH = (window.innerHeight * 0.62) / layout.height
    return Math.min(fitW, Math.max(fitH, Math.min(fitW, 340 / layout.width)))
  }, [boardW, layout])

  const selected = items.find((i) => i.id === selectedId) ?? null

  // Keyboard: delete, undo, redo.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        commit(items.filter((i) => i.id !== selectedId))
        setSelectedId(null)
      } else if (e.key === 'Escape') {
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, commit, items, selectedId])

  /** Where a new item lands: the middle of whatever part of the strip is in view. */
  function dropPoint() {
    const el = boardRef.current
    const visibleMid = el ? (el.scrollTop + Math.min(el.clientHeight, layout.height * scale) / 2) / scale : layout.height / 2
    return {
      x: layout.width / 2 + jitter(layout.width * 0.55),
      y: Math.min(layout.height - 120, Math.max(120, visibleMid + jitter(Math.min(700, layout.height * 0.35)))),
    }
  }

  function add(item: Omit<Item, 'id' | 'x' | 'y'>) {
    const id = uid()
    commit([...items, { ...item, id, ...dropPoint() }])
    setSelectedId(id)
    setPopId(id)
  }

  function addSticker(stickerId: string) {
    const def = STICKERS.find((s) => s.id === stickerId)!
    const target = layout.width * (def.w > def.h ? 0.36 : 0.24)
    add({ kind: 'sticker', stickerId, rotation: jitter(24), scale: target / def.w, flipX: false })
  }

  function addText() {
    if (!draft.trim()) return
    add({ kind: 'text', text: draft.trim(), font, color, rotation: jitter(10), scale: 1, flipX: false })
  }

  function patchSelected(patch: Partial<Item>) {
    if (!selected) return
    commit(items.map((i) => (i.id === selected.id ? { ...i, ...patch } : i)))
  }

  async function print() {
    const stage = stageRef.current
    if (!stage) return
    setPrinting(true)
    setSelectedId(null)
    // Wait a frame so the selection handles are gone before exporting.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const full = stage.toCanvas({ pixelRatio: 1 / scale })
    setPrint(await canvasToBlob(full))
    go('result')
  }

  return (
    <div className={styles.decorate}>
      <div className={styles.top}>
        <button className="btn btn-ghost btn-small" onClick={() => go('shoot')}>
          ← Shots
        </button>
        <div className={styles.history}>
          <button className={styles.iconBtn} onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl+Z)">
            ↶
          </button>
          <button className={styles.iconBtn} onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">
            ↷
          </button>
        </div>
        <button className="btn btn-red btn-small" onClick={print} disabled={!base || printing}>
          {printing ? 'Printing…' : 'Print →'}
        </button>
      </div>

      <div className={styles.workspace}>
        <div className={styles.boardWrap}>
          <div ref={boardRef} className={styles.board}>
            {base ? (
              <StripCanvas
                width={layout.width}
                height={layout.height}
                scale={scale}
                base={base}
                items={items}
                images={images}
                selectedId={selectedId}
                popId={popId}
                onSelect={setSelectedId}
                onCommit={commit}
                stageRef={stageRef}
              />
            ) : (
              <p className={styles.loading}>Developing your photos…</p>
            )}
          </div>

          {selected && (
            <div className={styles.selbar} role="toolbar" aria-label="Selected item">
              <button onClick={() => patchSelected({ flipX: !selected.flipX })}>⇋ Flip</button>
              <button onClick={() => patchSelected({ scale: selected.scale * 1.15 })} aria-label="Bigger">
                ＋
              </button>
              <button onClick={() => patchSelected({ scale: selected.scale / 1.15 })} aria-label="Smaller">
                －
              </button>
              <button
                onClick={() => {
                  commit([...items.filter((i) => i.id !== selected.id), selected])
                }}
              >
                ⬆ Front
              </button>
              <button
                onClick={() => {
                  const id = uid()
                  commit([...items, { ...selected, id, x: selected.x + 40, y: selected.y + 40 }])
                  setSelectedId(id)
                  setPopId(id)
                }}
              >
                ⧉ Copy
              </button>
              <button
                className={styles.danger}
                onClick={() => {
                  commit(items.filter((i) => i.id !== selected.id))
                  setSelectedId(null)
                }}
              >
                ✕ Delete
              </button>
            </div>
          )}
        </div>

        <section className={`paper ${styles.drawer}`} aria-label="Decorating tools">
          <div className={styles.tabs} role="tablist">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={styles.tab} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <div key={tab} className={styles.panel} role="tabpanel">
            {tab === 'stickers' && (
              <>
                <div className={styles.chips}>
                  {PACKS.map((p) => (
                    <button key={p.id} className={styles.chip} aria-pressed={pack === p.id} onClick={() => setPack(p.id)}>
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className={styles.stickerGrid}>
                  {STICKERS.filter((s) => s.pack === pack).map((s, i) => (
                    <button
                      key={s.id}
                      className={styles.sticker}
                      style={{ animationDelay: `${i * 30}ms` }}
                      onClick={() => addSticker(s.id)}
                      aria-label={`Add ${s.name} sticker`}
                      title={s.name}
                    >
                      <img src={svgUrl(s.svg)} alt="" draggable={false} />
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === 'frames' && (
              <div className={styles.swatches}>
                {FRAMES.map((f) => (
                  <button key={f.id} className={styles.swatch} aria-pressed={frameId === f.id} onClick={() => setFrame(f.id)}>
                    <span className={styles.swatchChip} style={{ background: f.swatch }} />
                    {f.name}
                  </button>
                ))}
              </div>
            )}

            {tab === 'filters' && (
              <div className={styles.filters}>
                {FILTERS.map((f) => (
                  <button key={f.id} className={styles.filter} aria-pressed={filterId === f.id} onClick={() => setFilter(f.id)}>
                    {shots[0] && <img src={shots[0].url} alt="" style={{ filter: f.css }} />}
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            )}

            {tab === 'text' && (
              <div className={styles.textTool}>
                <label className="label" htmlFor="caption">
                  {selected?.kind === 'text' ? 'Edit caption' : 'New caption'}
                </label>
                <input
                  id="caption"
                  className={styles.input}
                  value={selected?.kind === 'text' ? selected.text : draft}
                  maxLength={40}
                  onChange={(e) => (selected?.kind === 'text' ? patchSelected({ text: e.target.value }) : setDraft(e.target.value))}
                  placeholder="Type something…"
                />
                <div className={styles.chips}>
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      className={styles.chip}
                      style={f.style}
                      aria-pressed={(selected?.kind === 'text' ? selected.font : font) === f.id}
                      onClick={() => (selected?.kind === 'text' ? patchSelected({ font: f.id }) : setFont(f.id))}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className={styles.colors}>
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      className={styles.color}
                      style={{ background: c }}
                      aria-label={`Colour ${c}`}
                      aria-pressed={(selected?.kind === 'text' ? selected.color : color) === c}
                      onClick={() => (selected?.kind === 'text' ? patchSelected({ color: c }) : setColor(c))}
                    />
                  ))}
                </div>
                {selected?.kind !== 'text' && (
                  <button className="btn btn-dark" onClick={addText}>
                    Add caption
                  </button>
                )}
              </div>
            )}
          </div>
          <p className={styles.tip}>Tip: drag to move, corners to resize and rotate. On a phone, pinch with two fingers.</p>
        </section>
      </div>
    </div>
  )
}
