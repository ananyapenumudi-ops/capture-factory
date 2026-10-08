// Copies the MediaPipe WebAssembly runtime into public/ so it is served from
// our own origin (no third-party CDN). Runs automatically after `npm install`.
import { cpSync, mkdirSync } from 'node:fs'

const from = 'node_modules/@mediapipe/tasks-vision/wasm'
const to = 'public/mediapipe/wasm'
mkdirSync(to, { recursive: true })
for (const f of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm', 'vision_wasm_nosimd_internal.js', 'vision_wasm_nosimd_internal.wasm']) {
  cpSync(`${from}/${f}`, `${to}/${f}`)
}
console.log('Copied MediaPipe wasm to', to)
