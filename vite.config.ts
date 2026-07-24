import { VitePWA } from 'vite-plugin-pwa'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({ registerType: 'autoUpdate' }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})
