import { defineConfig } from 'vite';

export default defineConfig({
  // Relative URLs work under the SubstratePRO GitHub Pages project path.
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true
  }
});
