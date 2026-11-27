/**
 * Generación de íconos de la PWA a partir de public/icon.svg.
 * Uso: npm run generate-icons
 */
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

const BG = '#0b0d12'; // mismo fondo que la app

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: BG } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: BG } },
  },
  images: ['public/icon.svg'],
});
