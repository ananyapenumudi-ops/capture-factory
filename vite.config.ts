import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Phones only allow camera access over HTTPS, so `npm run dev:phone`
// serves on the local network with a self-signed certificate.
export default defineConfig(({ mode }) => {
  const phone = mode === 'phone'
  return {
    plugins: [react(), ...(phone ? [basicSsl()] : [])],
    server: phone ? { host: true } : undefined,
  }
})
