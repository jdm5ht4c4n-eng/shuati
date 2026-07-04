import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'remove-module-type',
      closeBundle() {
        const outPath = 'docs/index.html';
        let html = fs.readFileSync(outPath, 'utf-8');
        html = html.replace(/<script type="module" crossorigin>/g, '<script>');
        html = html.replace(/<script type="module">/g, '<script>');
        fs.writeFileSync(outPath, html);
      },
    },
  ],
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
});
