import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Política de seguridad de contenido (CSP), solo en la versión compilada.
 * (En desarrollo Vite inyecta scripts en línea que la CSP bloquearía.)
 *
 * - Scripts: solo los de la propia app. Nada externo, nada en línea.
 * - Red: la app no se conecta a ningún servidor, salvo para descargar las
 *   imágenes de referencia de free-exercise-db (GitHub).
 * - Sin frames, sin plugins, sin envío de formularios a terceros.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // estilos en línea de React (style={{...}})
  "img-src 'self' blob: data: https://raw.githubusercontent.com",
  "connect-src 'self' https://raw.githubusercontent.com",
  "font-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function cspPlugin(): Plugin {
  return {
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      );
    },
  };
}

/** Caché de imágenes de ejercicios (compartida con src/lib/offlineImages.ts). */
export const IMAGE_CACHE = 'exercise-images';

export default defineConfig({
  // './' permite servir la app desde cualquier subruta (p. ej. GitHub Pages /fuerza-app/).
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    cspPlugin(),
    VitePWA({
      // La app avisa cuando hay versión nueva y el usuario decide cuándo actualizar
      // (no recarga sola en mitad de un entrenamiento).
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg'],
      manifest: {
        name: 'Fuerza: entrenamiento de fuerza',
        short_name: 'Fuerza',
        description: 'Rutinas, entrenamiento en vivo y progreso. Funciona sin conexión; tus datos no salen del teléfono.',
        lang: 'es',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0b0d12',
        theme_color: '#0b0d12',
        categories: ['health', 'fitness', 'sports'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precarga TODA la app (incluida la base de ~870 ejercicios) para uso offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Imágenes de free-exercise-db: se guardan la primera vez que se ven.
            urlPattern: ({ url }) =>
              url.origin === 'https://raw.githubusercontent.com' && url.pathname.startsWith('/yuhonas/free-exercise-db/'),
            handler: 'CacheFirst',
            options: {
              cacheName: IMAGE_CACHE,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 2500, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  // La base de ejercicios (~850 KB) va en su propio fragmento a propósito.
  build: { chunkSizeWarningLimit: 1000 },
});
