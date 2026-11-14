import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
test('v2 original Figma assets retain their bytes, dimensions and component slots', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../docs/v2-assets.json', import.meta.url)),
  );
  for (const asset of manifest.assets) {
    const bytes = readFileSync(new URL('../' + asset.path, import.meta.url));
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      asset.sha256,
    );
    const root = bytes.toString().match(/<svg\b[^>]*>/)[0];
    assert.equal(Number(root.match(/\bwidth="([\d.]+)"/)[1]), asset.width);
    assert.equal(Number(root.match(/\bheight="([\d.]+)"/)[1]), asset.height);
  }
});
