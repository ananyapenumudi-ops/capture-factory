# Capture Factory

A retro photo booth machine that runs in your browser. Strike a pose, get a 3-2-1 countdown, and walk away with a printed-style photo strip, complete with an "Admit One" ticket stub.

Everything happens on your device: photos are never uploaded, and there is no account or backend.

## Features

**Working now (milestone 1: booth core)**

- Four layouts: classic 4-shot strip, 3-shot trio, 2×2 grid and a single polaroid
- Live mirrored camera preview, a 3-2-1 countdown, flash and shutter sounds (with a mute toggle)
- Retake any single shot
- Falls back to uploading photos when there is no camera or access is denied
- High-resolution PNG export (a classic strip is 1200×3600 px) with a dated, numbered ticket stub
- Native share sheet on phones
- Mobile-first: safe-area aware, large touch targets, a landscape phone layout, reduced-motion support

**Coming next**

- Milestone 2: decorate. Stickers, frames, filters, text, undo and redo
- Milestone 3: face-tracked props (MediaPipe FaceLandmarker)
- Milestone 4: the illustrated machine, the mascot and the full sticker set

## Tech

React 19, TypeScript, Vite, Zustand. The camera uses `getUserMedia`, and the strips are composited on `<canvas>`.

## Run it

```bash
npm install
npm run dev
```

To test on a phone on the same Wi-Fi, run `npm run dev:phone` and open the HTTPS network URL it prints. Phones only allow camera access over HTTPS, so accept the self-signed certificate warning.

## Project layout

```text
src/
  app/      screens: Landing, Setup, Shoot, Result
  booth/    layouts, camera hook, frame capture, sounds
  export/   strip renderer (photos + ticket stub)
  store/    Zustand session store
```
