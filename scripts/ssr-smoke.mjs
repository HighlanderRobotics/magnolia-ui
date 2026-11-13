import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import assert from 'node:assert/strict';
const server = await createServer({
  configFile: false,
  plugins: [svelte()],
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
});
try {
  const { render } = await server.ssrLoadModule('svelte/server');
  const { default: App } = await server.ssrLoadModule(
    '/examples/web/src/App.svelte',
  );
  const { body } = render(App);
  assert.match(body, /Magnolia UI/);
  assert.match(body, /aria-errormessage=/);
  assert.doesNotMatch(body, /document\.fonts/);
  const ids = [...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, 'SSR control IDs must be unique');
  const { default: Controls } = await server.ssrLoadModule(
    '/examples/web/src/Controls.svelte',
  );
  const expanded = render(Controls).body;
  assert.match(expanded, /role="tablist"/);
  assert.match(expanded, /role="combobox"/);
  const expandedIds = [...expanded.matchAll(/\sid="([^"]+)"/g)].map(
    (m) => m[1],
  );
  assert.equal(
    expandedIds.length,
    new Set(expandedIds).size,
    'Extended SSR IDs must be unique',
  );
  console.log(
    'Svelte server rendering passed without window, document or font loading.',
  );
} finally {
  await server.close();
}
