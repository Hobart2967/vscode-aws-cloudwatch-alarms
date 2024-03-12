// vite.config.ts
import * as path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import solidSvg from 'vite-plugin-solid-svg';

export default defineConfig({
  root: path.join(__dirname),
  plugins: [solidPlugin(), solidSvg()],
  build: {
    outDir: path.join(__dirname, '..', 'dist-webviews'),
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    }
  }
});
