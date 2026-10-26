import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Deployed to GitHub Pages under /ai-content-lifecycle/
export default defineConfig({
  base: '/ai-content-lifecycle/',
  plugins: [react()],
})
