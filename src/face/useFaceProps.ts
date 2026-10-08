import type { FaceLandmarker } from '@mediapipe/tasks-vision'
import { useCallback, useEffect, useRef, useState } from 'react'
import { svgUrl } from '../decorate/stickers'
import { drawProp, poseFromLandmarks, smoothPose, type FacePose } from './anchoring'
import { getFaceTracker, nextTimestamp } from './faceTracker'
import { getProp, type PropId } from './props'

export type PropsStatus = 'off' | 'loading' | 'ready' | 'error'

/** Detection rate cap; ~30 fps keeps phones cool and still looks smooth. */
const FRAME_MS = 32

// Face-hugging props first, headwear last, so hats sit on top of everything.
const DRAW_ORDER: PropId[] = ['blush', 'moustache', 'heart-glasses', 'star-glasses', 'flower-crown', 'cat-ears', 'big-bow', 'party-hat']

const images = new Map<PropId, HTMLImageElement>()
function propImage(id: PropId): HTMLImageElement {
  let img = images.get(id)
  if (!img) {
    img = new Image()
    img.src = svgUrl(getProp(id)!.svg)
    images.set(id, img)
  }
  return img
}

function paint(ctx: CanvasRenderingContext2D, poses: FacePose[], active: PropId[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  const ids = DRAW_ORDER.filter((id) => active.includes(id))
  for (const pose of poses) {
    for (const id of ids) {
      const img = propImage(id)
      if (img.complete && img.naturalWidth) drawProp(ctx, pose, getProp(id)!, img)
    }
  }
}

/**
 * Tracks faces in the live video and draws the chosen props on an overlay canvas
 * laid exactly over it. `composite()` returns the current frame with props baked in.
 */
export function useFaceProps(videoRef: React.RefObject<HTMLVideoElement | null>, active: PropId[], cameraReady: boolean) {
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const [tracker, setTracker] = useState<FaceLandmarker | null>(null)
  const [failed, setFailed] = useState(false)
  const [faces, setFaces] = useState(0)
  const posesRef = useRef<FacePose[]>([])
  /** Last face count reported to React; -1 forces a report on the next frame. */
  const reported = useRef(-1)
  const activeRef = useRef(active)
  const on = active.length > 0

  useEffect(() => {
    activeRef.current = active
    active.forEach(propImage)
  }, [active])

  // Load the tracker the first time any prop is switched on.
  useEffect(() => {
    if (!on || tracker || failed) return
    let alive = true
    getFaceTracker()
      .then((t) => alive && setTracker(t))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [on, tracker, failed])

  /** Detect faces in the current frame. Timestamps must strictly increase. */
  const detect = useCallback(
    (video: HTMLVideoElement): FacePose[] => {
      if (!tracker) return []
      const res = tracker.detectForVideo(video, nextTimestamp())
      return res.faceLandmarks.map((lm) => poseFromLandmarks(lm, video.videoWidth, video.videoHeight))
    },
    [tracker],
  )

  // The tracking loop.
  useEffect(() => {
    const canvas = overlayRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    if (!on || !tracker || !cameraReady) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      posesRef.current = []
      reported.current = -1
      return
    }
    let raf = 0
    let last = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const video = videoRef.current
      if (!video || video.readyState < 2 || now - last < FRAME_MS) return
      last = now
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }
      const raw = detect(video)
      const prev = posesRef.current
      posesRef.current = raw.map((p, i) => smoothPose(prev[i], p))
      if (raw.length !== reported.current) {
        reported.current = raw.length
        setFaces(raw.length)
      }
      paint(ctx, posesRef.current, activeRef.current)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [on, tracker, cameraReady, videoRef, detect])

  /** The current video frame with props drawn on, using a fresh (unsmoothed) detection so they line up exactly. */
  const composite = useCallback((): HTMLCanvasElement | null => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return null
    const c = document.createElement('canvas')
    c.width = video.videoWidth
    c.height = video.videoHeight
    const ctx = c.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    if (on && tracker) {
      const overlay = document.createElement('canvas')
      overlay.width = c.width
      overlay.height = c.height
      paint(overlay.getContext('2d')!, detect(video), activeRef.current)
      ctx.drawImage(overlay, 0, 0)
    }
    return c
  }, [videoRef, on, tracker, detect])

  const status: PropsStatus = !on ? 'off' : failed ? 'error' : tracker ? 'ready' : 'loading'

  return {
    overlayRef,
    status,
    faces,
    composite,
    retry: () => setFailed(false),
  }
}

