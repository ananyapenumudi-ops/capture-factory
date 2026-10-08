import type { FaceLandmarker } from '@mediapipe/tasks-vision'

/** Up to this many faces get props at once, for group shots. */
export const MAX_FACES = 4

let loading: Promise<FaceLandmarker> | null = null
let lastTimestamp = 0

/**
 * MediaPipe rejects a frame whose timestamp is not later than the previous one.
 * The tracker is shared across screens, so the clock is shared too.
 */
export function nextTimestamp(): number {
  lastTimestamp = Math.max(performance.now(), lastTimestamp + 1)
  return lastTimestamp
}

async function create(): Promise<FaceLandmarker> {
  // The library (and its ~13 MB WebAssembly runtime) only loads once someone turns props on.
  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
  const fileset = await FilesetResolver.forVisionTasks(`${import.meta.env.BASE_URL}mediapipe/wasm`)
  const options = (delegate: 'GPU' | 'CPU') => ({
    baseOptions: { modelAssetPath: `${import.meta.env.BASE_URL}models/face_landmarker.task`, delegate },
    runningMode: 'VIDEO' as const,
    numFaces: MAX_FACES,
  })
  try {
    return await FaceLandmarker.createFromOptions(fileset, options('GPU'))
  } catch {
    // Some phones and browsers have no usable WebGL; the CPU path is slower but works.
    return FaceLandmarker.createFromOptions(fileset, options('CPU'))
  }
}

/** Loads the face landmarker once and shares it. A failed load can be retried. */
export function getFaceTracker(): Promise<FaceLandmarker> {
  if (!loading) {
    loading = create()
    loading.catch(() => {
      loading = null
    })
  }
  return loading
}
