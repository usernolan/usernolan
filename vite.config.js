import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        images: resolve(__dirname, 'images/index.html'),
        links: resolve(__dirname, 'links/index.html'),
        quotes: resolve(__dirname, 'quotes/index.html')
      }
    }
  }
})
