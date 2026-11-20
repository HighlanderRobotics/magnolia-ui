import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
test('16 px canonical folder export matches the original Figma sizing example pixel for pixel', async () => {
  const { default: sharp } = await import('sharp');
  // Original source instance 67:5260, exported unchanged through Figma MCP.
  const reference = await sharp(
    new URL('./fixtures/v2/icon-folder-16.svg', import.meta.url).pathname,
    { density: 216 },
  )
    .ensureAlpha()
    .raw()
    .toBuffer();
  const icon = await sharp(
    new URL(
      '../packages/react-native/src/assets/v2/icon-folder-16.png',
      import.meta.url,
    ).pathname,
  )
    .ensureAlpha()
    .raw()
    .toBuffer();
  assert.deepEqual(icon, reference);
});
test('v2 canonical catalog covers all 75 source names at four exact export sizes', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../docs/v2-assets.json', import.meta.url)),
  );
  const icons = manifest.assets.filter((asset) => asset.catalog === 'icons');
  const names = [...new Set(icons.map((asset) => asset.iconName))];
  assert.equal(names.length, 75);
  assert.equal(icons.length, 300);
  for (const name of names) {
    const family = icons.filter((asset) => asset.iconName === name);
    assert.deepEqual(
      family.map((asset) => asset.size).sort((a, b) => a - b),
      [14, 16, 20, 24],
    );
    assert.equal(new Set(family.map((asset) => asset.nodeId)).size, 1);
    for (const asset of family) {
      assert.equal(asset.width, asset.size);
      assert.equal(asset.height, asset.size);
      assert.equal(asset.stroke, asset.size <= 16 ? 1.5 : 1.75);
    }
  }
});
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
    const name = asset.path.split('/').at(-1).replace('.svg', '.png');
    const png = readFileSync(
      new URL(
        '../packages/react-native/src/assets/v2/' + name,
        import.meta.url,
      ),
    );
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(
      png.readUInt32BE(16),
      Math.round(asset.width * 3),
      name + ' width',
    );
    assert.equal(
      png.readUInt32BE(20),
      Math.round(asset.height * 3),
      name + ' height',
    );
  }
});

test('chart marker artwork preserves theme-specific fills and original two-color rings', async () => {
  const { default: sharp } = await import('sharp');
  const { v2Tokens } = await import('../packages/tokens/dist/v2.js');
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  for (const family of [
    'scatter-highlight',
    'scatter-neutral',
    'line-point-1',
    'line-point-2',
    'line-point-3',
    'line-point-4',
    'line-point-5',
  ]) {
    for (const mode of ['dark', 'light']) {
      const { data, info } = await sharp(
        new URL(
          `../packages/react-native/src/assets/v2/${family}-${mode}.png`,
          import.meta.url,
        ).pathname,
      )
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const center = Math.floor(info.width / 2),
        at = (x, y) => [
          ...data.subarray(
            (y * info.width + x) * 4,
            (y * info.width + x) * 4 + 4,
          ),
        ];
      const fill =
        family === 'scatter-neutral'
          ? 'color/chart/other'
          : family === 'scatter-highlight'
            ? 'color/chart/cat-1'
            : `color/chart/cat-${family.at(-1)}`;
      const ring =
        family === 'scatter-highlight' ? 'color/fg/primary' : 'color/bg/raised';
      assert.deepEqual(
        at(center, center),
        [...rgb(v2Tokens.color[mode][fill]), 255],
        `${family} ${mode} fill`,
      );
      assert.deepEqual(
        at(center, 2),
        [...rgb(v2Tokens.color[mode][ring]), 255],
        `${family} ${mode} ring`,
      );
    }
  }
});
