import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { reticle } from '@reticlehq/vite-plugin';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reticle({ port: 4400 }), react()],
})
