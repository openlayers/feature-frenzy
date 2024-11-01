import {cwd} from 'node:process';
import {join} from 'node:path';
import {defineConfig} from 'vite';
import {readdir, readFile} from 'node:fs/promises';
import type {InputOptions} from 'rollup';
import type {ViteDevServer} from 'vite';

export default defineConfig(async () => {
  const examplesDir = join(cwd(), 'examples')
  const entries = await readdir(examplesDir);
  const examples: string[] = [];
  for (const entry of entries) {
    if (entry.endsWith('.html') || entry.endsWith('.htm')) {
      examples.push(join(examplesDir, entry));
    }
  }

  return {
    plugins: [
      {
        name: 'slidev-iframes',
        options(options: InputOptions) {
          /**
           * This makes it so the build step includes all example sources.
           * This could be removed if Slidev were to treat the <iframe> URLs
           * like Vite does (bundling their resources and serving them).
           * See https://github.com/slidevjs/slidev/issues/1921.
           */
          if (!options.input) {
            options.input = [...examples];
          } else if (typeof options.input === 'string') {
            options.input = [options.input, ...examples];
          } else if (Array.isArray(options.input)) {
            options.input = [...options.input, ...examples];
          } else {
            console.error('unexpected options.input: ', options.input);
          }
          return options;
        },
        configureServer(server: ViteDevServer) {
          /**
           * This is a workaround for https://github.com/slidevjs/slidev/issues/1923.
           * If that issue is closed, this `configureServer` function can be removed.
           * If this stops working, another workaround is to use `.htm` files instead
           * of `.html`.
           *
           * See https://github.com/slidevjs/slidev/pull/1926 for a fix that could
           * make this unnecessary.
           */
          server.middlewares.use(async (req, res, next) => {
            if (req.url) {
              const filePath = join(cwd(), req.url);
              if (examples.includes(filePath)) {
                const content = await readFile(filePath, {encoding: 'utf8'});
                const end = res.end.bind(res);
                res.end = () => end(content);
              }
            }
            next();
          });  
        }
      }
    ]
  };
});
