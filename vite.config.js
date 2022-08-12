import {basename, join} from 'node:path';
import {defineConfig} from 'vite';
import {readdir} from 'node:fs/promises';

const root = 'src';

export default defineConfig(async () => {
  const entries = await readdir(root);
  const input = {};
  for (const entry of entries) {
    if (entry.endsWith('.html')) {
      const name = basename(entry, '.html');
      input[name] = join(root, entry);
    }
  }
  return {
    root,
    base: './',
    build: {
      sourcemap: true,
      outDir: '../dist',
      emptyOutDir: true,
      rollupOptions: {input},
    },
  };
});
