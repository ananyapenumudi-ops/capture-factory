import { useCallback, useEffect, useRef, useState } from 'react'

export type CameraStatus = 'starting' | 'ready' | 'denied' | 'unavailable' | 'error'

const supported = () => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

/** Streams the front camera into a <video>. Stops the stream on unmount. */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  // Bumped on every start and on unmount, so a stream that arrives late is discarded.
  const generation = useRef(0)
  const [status, setStatus] = useState<CameraStatus>(() => (supported() ? 'starting' : 'unavailable'))

  const stop = useCallback(() => {
    generation.current++
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const start = useCallback(async () => {
    if (!supported()) return
    const gen = ++generation.current
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      if (gen !== generation.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play()
      }
      setStatus('ready')
    } catch (err) {
      if (gen !== generation.current) return
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'SecurityError') setStatus('denied')
      else if (name === 'NotFoundError' || name === 'OverconstrainedError') setStatus('unavailable')
      else setStatus('error')
    }
  }, [])

  useEffect(() => {
    void start()
    return stop
  }, [start, stop])

  const retry = useCallback(() => {
    setStatus('starting')
    void start()
  }, [start])

  return { videoRef, status, retry }
}
