# Capture Factory

A pop-art photo booth that runs in your browser. Strike a pose, get a 3-2-1 countdown, and walk away with a printed-style photo strip, complete with an "Admit One" ticket stub.

Everything happens on your device: photos are never uploaded, and there is no account or backend.

## Features

- **Pop-art look**: peach and lavender grounds, chunky condensed type, black block buttons and hand-drawn psychedelic illustrations. Everything moves: a camera-lens sun with spinning rays, drifting clouds, bobbing planets, winged polaroids flapping across the sky, a spinning "Strike a pose" badge, sections that rise in as you scroll, and a strip that feeds out of the printer and develops.
- **Four layouts**: classic 4-shot strip, 3-shot trio, 2×2 grid and a single polaroid.
- **Shoot**: a vintage camera viewfinder, 3-2-1 countdown, flash and shutter sounds (with a mute toggle), retake any single shot, or upload photos if there is no camera.
- **Face-tracked props**: heart shades, star shades, cat ears, flower crown, party hat, big bow, blush and a moustache. They follow your face live (position, size and head tilt) for up to 4 faces, and are baked into each shot. Tracking runs entirely on the device with MediaPipe FaceLandmarker; the 13 MB runtime only loads when you switch a prop on.
- **Decorate**:
  - 48 original stickers in 5 packs (pop, tickets, stamps and seals, study mood, cute bits), each with a die-cut white border
  - Drag, resize, rotate, flip, copy, layer and delete stickers; two-finger pinch on phones
  - 14 frames: pop peach, cosmic, dossier, kraft, blue, lilac and peach gingham, cherries, bows, leopard, kisses, plaid, film strip and noir
  - 6 filters, written as pixel maths so they work on iPhone Safari
  - Captions in serif, typewriter or handwritten fonts
  - Undo and redo (Ctrl+Z, Ctrl+Shift+Z)
- **Print**: a high-resolution PNG (a classic strip is 1200×3600 px) with a dated, numbered Admit One ticket stub, plus the native share sheet on phones.
- **Mobile-first**: safe-area aware, large touch targets, a landscape phone layout, reduced-motion support.

## Tech

React 19, TypeScript, Vite, Zustand, Konva (react-konva), MediaPipe Tasks Vision. The camera uses `getUserMedia`, and strips are composited on `<canvas>`. Sticker artwork is inline SVG, and the decorate screen is code-split so Konva only loads when you need it.

## Run it

```bash
npm install
npm run dev
```

To test on a phone on the same Wi-Fi, run `npm run dev:phone` and open the HTTPS network URL it prints. Phones only allow camera access over HTTPS, so accept the self-signed certificate warning.

## Project layout

```text
src/
  app/       screens: Landing, Setup, Shoot, Decorate, Result
  booth/     layouts, camera hook, frame capture, sounds
  decorate/  stickers (SVG), frames, filters, Konva canvas
  face/      face tracker loader, prop artwork, landmark anchoring + smoothing
  export/    strip renderer (frame + filtered photos + ticket stub)
  art/       landing illustrations (inline SVG + CSS animation)
  store/     Zustand session store
```

## Credits

Face tracking uses Google's [MediaPipe](https://ai.google.dev/edge/mediapipe) FaceLandmarker model (Apache 2.0), served from `public/models`. The WebAssembly runtime is copied from `node_modules` into `public/mediapipe` by `npm install` (see `scripts/copy-mediapipe.mjs`).
