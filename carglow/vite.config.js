import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const pages = ['static-classic', 'color-changing-rgb', 'graphic-mapping', 'rgbic-underglow'];

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        ...Object.fromEntries(pages.map((p) => [p, resolve(import.meta.dirname, `products/${p}/index.html`)])),
        ...Object.fromEntries(['build', 'pricing', 'install'].map((p) => [p, resolve(import.meta.dirname, `${p}/index.html`)])),
      },
    },
  },
});
