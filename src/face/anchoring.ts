import type { Anchor, PropDef } from './props'

export type Point = { x: number; y: number }

/** Where a face is, in video pixels: the frame every prop is placed in. */
export type FacePose = {
  /** Midpoint between the outer eye corners. */
  eyes: Point
  forehead: Point
  cheekR: Point
  cheekL: Point
  lip: Point
  /** Distance between the outer eye corners, in pixels. */
  span: number
  /** Head tilt (roll), in radians. */
  angle: number
}

// MediaPipe FaceMesh landmark indices.
const EYE_OUTER_R = 33 // the subject's right eye, on the image's left
const EYE_OUTER_L = 263
const FOREHEAD = 10
const CHEEK_R = 205
const CHEEK_L = 425
const NOSE_BASE = 2
const UPPER_LIP = 0

type Landmark = { x: number; y: number }

export function poseFromLandmarks(lm: Landmark[], width: number, height: number): FacePose {
  const p = (i: number): Point => ({ x: lm[i].x * width, y: lm[i].y * height })
  const r = p(EYE_OUTER_R)
  const l = p(EYE_OUTER_L)
  const nose = p(NOSE_BASE)
  const lip = p(UPPER_LIP)
  return {
    eyes: { x: (r.x + l.x) / 2, y: (r.y + l.y) / 2 },
    forehead: p(FOREHEAD),
    cheekR: p(CHEEK_R),
    cheekL: p(CHEEK_L),
    lip: { x: (nose.x + lip.x) / 2, y: (nose.y + lip.y) / 2 },
    span: Math.hypot(l.x - r.x, l.y - r.y),
    angle: Math.atan2(l.y - r.y, l.x - r.x),
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerpPt = (a: Point, b: Point, t: number): Point => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) })

/**
 * Exponential smoothing between frames so props do not jitter. A big jump
 * (a different face, or a fast move) snaps instead of sliding across the frame.
 */
export function smoothPose(prev: FacePose | undefined, next: FacePose, t = 0.55): FacePose {
  if (!prev || Math.hypot(prev.eyes.x - next.eyes.x, prev.eyes.y - next.eyes.y) > next.span * 1.5) return next
  let da = next.angle - prev.angle
  if (da > Math.PI) da -= Math.PI * 2
  if (da < -Math.PI) da += Math.PI * 2
  return {
    eyes: lerpPt(prev.eyes, next.eyes, t),
    forehead: lerpPt(prev.forehead, next.forehead, t),
    cheekR: lerpPt(prev.cheekR, next.cheekR, t),
    cheekL: lerpPt(prev.cheekL, next.cheekL, t),
    lip: lerpPt(prev.lip, next.lip, t),
    span: lerp(prev.span, next.span, t),
    angle: prev.angle + da * t,
  }
}

function anchorPoints(pose: FacePose, anchor: Anchor): Point[] {
  switch (anchor) {
    case 'eyes':
      return [pose.eyes]
    case 'forehead':
      return [pose.forehead]
    case 'cheeks':
      return [pose.cheekR, pose.cheekL]
    case 'lip':
      return [pose.lip]
  }
}

/** Draws one prop on one face, in unmirrored video coordinates. */
export function drawProp(ctx: CanvasRenderingContext2D, pose: FacePose, def: PropDef, img: CanvasImageSource) {
  const w = def.width * pose.span
  const h = (w * def.h) / def.w
  for (const pt of anchorPoints(pose, def.anchor)) {
    ctx.save()
    ctx.translate(pt.x, pt.y)
    ctx.rotate(pose.angle)
    ctx.drawImage(img, -w / 2, -h * def.pivotY + def.offsetY * pose.span, w, h)
    ctx.restore()
  }
}
