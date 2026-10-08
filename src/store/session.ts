import { create } from 'zustand'
import { getLayout, type LayoutId } from '../booth/layouts'

export type Step = 'landing' | 'setup' | 'shoot' | 'result'

export type Shot = { id: string; blob: Blob; url: string }

type SessionState = {
  step: Step
  layoutId: LayoutId
  shots: (Shot | null)[]
  serial: string
  muted: boolean
  go: (step: Step) => void
  chooseLayout: (id: LayoutId) => void
  setShot: (index: number, blob: Blob) => void
  /** Clears the shots and issues a new ticket serial. */
  newSession: () => void
  clearShots: () => void
  toggleMute: () => void
}

/** Ticket-stub number, e.g. "081026-4417": the date plus four random digits. */
function makeSerial(date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${dd}${mm}${yy}-${rand}`
}

function readMuted(): boolean {
  try {
    return localStorage.getItem('cf-muted') === '1'
  } catch {
    return false
  }
}

function emptyShots(layoutId: LayoutId): null[] {
  return Array.from({ length: getLayout(layoutId).shots }, () => null)
}

function revokeAll(shots: (Shot | null)[]) {
  shots.forEach((s) => s && URL.revokeObjectURL(s.url))
}

export const useSession = create<SessionState>((set, get) => ({
  step: 'landing',
  layoutId: 'strip4',
  shots: emptyShots('strip4'),
  serial: makeSerial(),
  muted: readMuted(),

  go: (step) => set({ step }),

  chooseLayout: (layoutId) => {
    revokeAll(get().shots)
    set({ layoutId, shots: emptyShots(layoutId) })
  },

  setShot: (index, blob) => {
    const shots = [...get().shots]
    const old = shots[index]
    if (old) URL.revokeObjectURL(old.url)
    shots[index] = { id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob) }
    set({ shots })
  },

  newSession: () => {
    revokeAll(get().shots)
    set({ shots: emptyShots(get().layoutId), serial: makeSerial() })
  },

  clearShots: () => {
    revokeAll(get().shots)
    set({ shots: emptyShots(get().layoutId) })
  },

  toggleMute: () => {
    const muted = !get().muted
    try {
      localStorage.setItem('cf-muted', muted ? '1' : '0')
    } catch {
      // Storage can be blocked (private mode); the toggle still works for this visit.
    }
    set({ muted })
  },
}))
