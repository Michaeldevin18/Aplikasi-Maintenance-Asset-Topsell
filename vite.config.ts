import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(
      command === 'serve'
        ? {
            babel: {
              plugins: ['react-dev-locator'],
            },
          }
        : {},
    ),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Aplikasi Management Asset Topsell',
        short_name: 'Topsell Asset',
        description: 'Aplikasi Management Asset Topsell untuk teknisi dan manajemen aset.',
        theme_color: '#E60012',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'logo.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        start_url: '/',
        scope: '/',
        lang: 'id'
      },
      devOptions: {
        enabled: true
      }
    }),
    tsconfigPaths(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
}))
