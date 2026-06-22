import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const isDemoMode = process.env.VITE_DEMO_MODE === 'true'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        name: 'Hobbyist',
        short_name: 'Hobbyist',
        description: 'Track books, films, games and podcasts with your friends in small, focused clubs.',
        theme_color: '#E8A020',
        background_color: '#0F1923',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: isDemoMode ? '/hobbyist/' : '/',
        start_url: isDemoMode ? '/hobbyist/' : '/',
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Cache cover art from Open Library, TMDB, IGDB
            urlPattern: /^https:\/\/(covers\.openlibrary\.org|image\.tmdb\.org|images\.igdb\.com)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cover-art-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3001', ws: true, changeOrigin: true },
    }
  },
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.js'],
  },
})
