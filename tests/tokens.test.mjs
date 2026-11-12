import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generate, resolveTokens } from '../scripts/generate-tokens.mjs';
const source = JSON.parse(
  readFileSync(new URL('../packages/tokens/tokens.json', import.meta.url)),
);
const resolved = resolveTokens(source);
function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
test('generated artifacts are reproducible and current', () => {
  assert.deepEqual(generate(source), generate(structuredClone(source)));
  for (const [file, content] of Object.entries(generate(source)))
    assert.equal(
      readFileSync(new URL('../' + file, import.meta.url), 'utf8'),
      content,
      file,
    );
});
test('aliases reject missing values and cycles', () => {
  assert.throws(() => resolveTokens({ a: '{missing}' }), /Unknown alias/);
  assert.throws(() => resolveTokens({ a: '{b}', b: '{a}' }), /Cyclic alias/);
});
test('themes have identical contracts and preserve original primary colors', () => {
  assert.deepEqual(
    Object.keys(resolved.themes.light),
    Object.keys(resolved.themes.dark),
  );
  assert.equal(resolved.themes.light.primary, '#350868');
  assert.equal(resolved.themes.dark.primary, '#b59aff');
  assert.equal(resolved.material.dark.surface, '#1f1f1f');
});
test('semantic text and control colors meet AA contrast', () => {
  for (const [mode, t] of Object.entries(resolved.themes))
    for (const [fg, bg] of [
      ['onBackground', 'background'],
      ['onBackground', 'surface'],
      ['muted', 'background'],
      ['placeholder', 'surface'],
      ['onPrimary', 'primary'],
      ['onPrimary', 'primaryHover'],
      ['onSecondary', 'secondary'],
      ['onSecondary', 'secondaryHover'],
      ['onDanger', 'danger'],
      ['onDanger', 'dangerHover'],
      ['errorText', 'background'],
    ])
      assert.ok(
        contrast(t[fg], t[bg]) >= 4.5,
        `${mode}: ${fg}/${bg} = ${contrast(t[fg], t[bg])}`,
      );
});
test('focus, input boundaries and minimum touch targets remain visible', () => {
  for (const [mode, t] of Object.entries(resolved.themes))
    for (const bg of ['surface', 'background'])
      assert.ok(contrast(t.outline, t[bg]) >= 3, mode + ' outline/' + bg);
  for (const d of Object.values(resolved.density)) assert.ok(d.target >= 44);
  assert.equal(resolved.motion.reduced, 0);
});
