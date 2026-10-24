import { defineConfig } from 'vite';
export default defineConfig({
  base: '/SubstratePRO-Toolworks/',
  build: { target: 'es2022', outDir: 'dist', emptyOutDir: true }
});
