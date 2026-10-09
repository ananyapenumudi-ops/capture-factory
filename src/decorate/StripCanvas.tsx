import Konva from 'konva'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Image as KImage, Layer, Stage, Text as KText, Transformer } from 'react-konva'
import type { Item } from '../store/session'
import { stickerSize } from './stickerImage'

type Props = {
  width: number
  height: number
  scale: number
  base: HTMLCanvasElement | null
  items: Item[]
  images: Record<string, HTMLCanvasElement>
  selectedId: string | null
  popId: string | null
  onSelect: (id: string | null) => void
  onCommit: (items: Item[]) => void
  stageRef: React.RefObject<Konva.Stage | null>
}

const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

/** Reads a node's transform back into an Item after a drag, resize or pinch. */
function fromNode(item: Item, node: Konva.Node): Item {
  return {
    ...item,
    x: node.x(),
    y: node.y(),
    rotation: node.rotation(),
    scale: Math.abs(node.scaleY()),
    flipX: node.scaleX() < 0,
  }
}

/**
 * Sticker or caption pops in with a little overshoot when it is first added.
 * The target scale comes from the item, not the node, so a second run of the
 * effect (React StrictMode) cannot compound the shrink.
 */
function usePop(ref: React.RefObject<Konva.Node | null>, pop: boolean, item: Item) {
  const sx = item.scale * (item.flipX ? -1 : 1)
  const sy = item.scale
  useEffect(() => {
    const node = ref.current
    if (!pop || !node) return
    node.scale({ x: sx * 0.2, y: sy * 0.2 })
    const tween = new Konva.Tween({ node, scaleX: sx, scaleY: sy, duration: 0.4, easing: Konva.Easings.BackEaseOut })
    tween.play()
    return () => {
      tween.destroy()
      node.scale({ x: sx, y: sy })
    }
    // Only when the item first appears; later scale changes are not animated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pop, ref])
}

function StickerNode({ item, image, pop, ...handlers }: { item: Item; image?: HTMLCanvasElement; pop: boolean } & NodeHandlers) {
  const ref = useRef<Konva.Image>(null)
  usePop(ref, pop, item)
  const { w, h } = stickerSize(item.stickerId ?? '')
  return (
    <KImage
      ref={ref}
      id={item.id}
      image={image}
      x={item.x}
      y={item.y}
      width={w}
      height={h}
      offsetX={w / 2}
      offsetY={h / 2}
      rotation={item.rotation}
      scaleX={item.scale * (item.flipX ? -1 : 1)}
      scaleY={item.scale}
      shadowColor="#2B2522"
      shadowOpacity={0.35}
      shadowBlur={10}
      shadowOffset={{ x: 4, y: 6 }}
      draggable
      {...handlers}
    />
  )
}

function TextNode({ item, pop, ...handlers }: { item: Item; pop: boolean } & NodeHandlers) {
  const ref = useRef<Konva.Text>(null)
  usePop(ref, pop, item)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    node.offsetX(node.width() / 2)
    node.offsetY(node.height() / 2)
  })
  return (
    <KText
      ref={ref}
      id={item.id}
      text={item.text}
      fontFamily={item.font}
      fontSize={96}
      fill={item.color}
      align="center"
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      scaleX={item.scale * (item.flipX ? -1 : 1)}
      scaleY={item.scale}
      shadowColor="#2B2522"
      shadowOpacity={0.25}
      shadowBlur={4}
      shadowOffset={{ x: 3, y: 3 }}
      draggable
      {...handlers}
    />
  )
}

type NodeHandlers = {
  onMouseDown: () => void
  onTouchStart: () => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void
}

export function StripCanvas({ width, height, scale, base, items, images, selectedId, popId, onSelect, onCommit, stageRef }: Props) {
  const trRef = useRef<Konva.Transformer>(null)
  const pinch = useRef<{ dist: number; angle: number; scale: number; rotation: number } | null>(null)

  useEffect(() => {
    const tr = trRef.current
    const stage = stageRef.current
    if (!tr || !stage) return
    const node = selectedId ? stage.findOne(`#${selectedId}`) : null
    tr.nodes(node ? [node] : [])
    tr.getLayer()?.batchDraw()
  }, [selectedId, items, stageRef])

  const update = (id: string, node: Konva.Node) => onCommit(items.map((it) => (it.id === id ? fromNode(it, node) : it)))

  const handlersFor = (id: string): NodeHandlers => ({
    onMouseDown: () => onSelect(id),
    onTouchStart: () => onSelect(id),
    onDragEnd: (e) => update(id, e.target),
    onTransformEnd: (e) => update(id, e.target),
  })

  // Two-finger pinch on phones: resize and rotate the selected sticker.
  function onTouchMove(e: Konva.KonvaEventObject<TouchEvent>) {
    const touches = e.evt.touches
    if (touches.length !== 2 || !selectedId) return
    const node = stageRef.current?.findOne(`#${selectedId}`)
    if (!node) return
    e.evt.preventDefault()
    const [a, b] = [touches[0], touches[1]]
    const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
    const angle = (Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180) / Math.PI
    if (!pinch.current) {
      node.stopDrag()
      pinch.current = { dist, angle, scale: Math.abs(node.scaleY()), rotation: node.rotation() }
      return
    }
    const s = Math.min(6, Math.max(0.15, pinch.current.scale * (dist / pinch.current.dist)))
    node.scaleX(node.scaleX() < 0 ? -s : s)
    node.scaleY(s)
    node.rotation(pinch.current.rotation + angle - pinch.current.angle)
    node.getLayer()?.batchDraw()
  }

  function onTouchEnd() {
    if (!pinch.current || !selectedId) return
    pinch.current = null
    const node = stageRef.current?.findOne(`#${selectedId}`)
    if (node) update(selectedId, node)
  }

  return (
    <Stage
      ref={stageRef}
      width={Math.round(width * scale)}
      height={Math.round(height * scale)}
      scaleX={scale}
      scaleY={scale}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Layer>
        {base && (
          <KImage
            image={base}
            width={width}
            height={height}
            // Let a finger on the background scroll the page instead of being captured.
            preventDefault={false}
            onMouseDown={() => onSelect(null)}
            onTap={() => onSelect(null)}
          />
        )}
        {items.map((it) =>
          it.kind === 'sticker' ? (
            <StickerNode key={it.id} item={it} image={images[it.stickerId ?? '']} pop={it.id === popId} {...handlersFor(it.id)} />
          ) : (
            <TextNode key={it.id} item={it} pop={it.id === popId} {...handlersFor(it.id)} />
          ),
        )}
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio
          flipEnabled={false}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          anchorSize={coarse ? 26 : 16}
          anchorCornerRadius={13}
          anchorStroke="#141414"
          anchorFill="#FFC83D"
          anchorStrokeWidth={2}
          borderStroke="#4D4DF0"
          borderDash={[8, 6]}
          borderStrokeWidth={2}
          rotateAnchorOffset={coarse ? 44 : 34}
          ignoreStroke
          boundBoxFunc={(oldBox, newBox) => (Math.abs(newBox.width) < 30 ? oldBox : newBox)}
        />
      </Layer>
    </Stage>
  )
}
