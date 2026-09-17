import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  server: { host: true, port: 5173 },
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      // Eigener Service Worker (src/sw.js) für Range-Requests bei Audio (iOS offline)
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      manifest: {
        name: 'Baderegel-Meister',
        short_name: 'Baderegeln',
        lang: 'de',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#0b6fb8',
        theme_color: '#0b6fb8',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      injectManifest: { globPatterns: ['**/*.{js,css,html,webp,m4a,svg,json,png}'], maximumFileSizeToCacheInBytes: 8 * 1024 * 1024 },
    }),
  ],
});
