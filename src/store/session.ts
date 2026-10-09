import { create } from 'zustand'
import { getLayout, type LayoutId } from '../booth/layouts'
import type { FilterId } from '../decorate/filters'
import type { FrameId } from '../decorate/frames'
import type { PropId } from '../face/props'

export type Step = 'landing' | 'setup' | 'shoot' | 'decorate' | 'result'

export type Shot = { id: string; blob: Blob; url: string }

/** A sticker or caption placed on the strip. x/y is its centre, in strip pixels. */
export type Item = {
  id: string
  kind: 'sticker' | 'text'
  stickerId?: string
  text?: string
  font?: string
  color?: string
  x: number
  y: number
  rotation: number
  scale: number
  flipX: boolean
}

export type Print = { blob: Blob; url: string }

type SessionState = {
  step: Step
  layoutId: LayoutId
  frameId: FrameId
  filterId: FilterId
  shots: (Shot | null)[]
  items: Item[]
  /** Face-tracked props switched on in the camera. */
  props: PropId[]
  print: Print | null
  serial: string
  muted: boolean
  go: (step: Step) => void
  chooseLayout: (id: LayoutId) => void
  setFrame: (id: FrameId) => void
  setFilter: (id: FilterId) => void
  setShot: (index: number, blob: Blob) => void
  setItems: (items: Item[]) => void
  toggleProp: (id: PropId) => void
  setPrint: (blob: Blob) => void
  /** Clears shots, stickers and the print, and issues a new ticket serial. */
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
  frameId: 'pop-peach',
  filterId: 'none',
  shots: emptyShots('strip4'),
  items: [],
  props: [],
  print: null,
  serial: makeSerial(),
  muted: readMuted(),

  go: (step) => {
    window.scrollTo({ top: 0 })
    set({ step })
  },

  chooseLayout: (layoutId) => {
    if (layoutId === get().layoutId) return
    revokeAll(get().shots)
    // Sticker positions are in strip pixels, so they do not carry across layouts.
    set({ layoutId, shots: emptyShots(layoutId), items: [] })
  },

  setFrame: (frameId) => set({ frameId }),
  setFilter: (filterId) => set({ filterId }),

  setShot: (index, blob) => {
    const shots = [...get().shots]
    const old = shots[index]
    if (old) URL.revokeObjectURL(old.url)
    shots[index] = { id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob) }
    set({ shots })
  },

  setItems: (items) => set({ items }),

  toggleProp: (id) => {
    const props = get().props
    set({ props: props.includes(id) ? props.filter((p) => p !== id) : [...props, id] })
  },

  setPrint: (blob) => {
    const old = get().print
    if (old) URL.revokeObjectURL(old.url)
    set({ print: { blob, url: URL.createObjectURL(blob) } })
  },

  newSession: () => {
    const { shots, print, layoutId } = get()
    revokeAll(shots)
    if (print) URL.revokeObjectURL(print.url)
    set({ shots: emptyShots(layoutId), items: [], print: null, serial: makeSerial() })
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
