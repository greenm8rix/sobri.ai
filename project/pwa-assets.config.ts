import { defineConfig } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: 'apple'
  },
  preset: {
    apple: {
      sizes: [180],
      padding: 0.3
    },
    android: {
      sizes: [512, 192, 144, 96, 72, 48],
      padding: 0.3,
      resizeOptions: {
        background: '#FFFFFF'
      }
    },
    windows: false,
    favicon: {
      sizes: [32, 16]
    }
  },
  images: [
    'public/icon-512.png'
  ],
  manifestMaskable: {
    path: 'public/maskable',
    imageOptions: {
      padding: 0.3,
      resizeOptions: {
        background: '#4f46e5'
      }
    }
  }
})