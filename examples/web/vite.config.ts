import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
const root = fileURLToPath(new URL('.', import.meta.url));
function ssrFixture(): Plugin {
  return {
    name: 'magnolia-ssr-fixture',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== '/ssr') return next();
        try {
          const template = await readFile(
            new URL('./index.html', import.meta.url),
            'utf8',
          );
          const html = await server.transformIndexHtml('/ssr', template);
          const { default: App } =
            await server.ssrLoadModule('/src/App.svelte');
          const { render } = await server.ssrLoadModule('svelte/server');
          const output = render(App);
          res.setHeader('Content-Type', 'text/html');
          res.end(
            html
              .replace(
                '<div id="app"></div>',
                `<div id="app" data-ssr="true">${output.body}</div>`,
              )
              .replace('</head>', `${output.head}</head>`),
          );
        } catch (error) {
          next(error as Error);
        }
      });
    },
  };
}
export default defineConfig({
  root,
  plugins: [svelte(), ssrFixture()],
  server: { host: '127.0.0.1', port: 4173, strictPort: true },
  build: { outDir: 'dist' },
});
