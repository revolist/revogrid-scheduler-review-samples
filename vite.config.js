import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        comparison: resolve(import.meta.dirname, 'comparison.html'),
        mapping: resolve(import.meta.dirname, 'mapping.html'),
        proof: resolve(import.meta.dirname, 'proof.html'),
      },
    },
  },
});
