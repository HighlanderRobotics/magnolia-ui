import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateV2 } from '../scripts/generate-v2.mjs';
const source = JSON.parse(
  readFileSync(new URL('../packages/tokens/v2/figma.json', import.meta.url)),
);
test('v2 exports every Figma variable and every mode reproducibly', () => {
  assert.equal(source.variables.length, 577);
  assert.deepEqual(
    source.collections.map((c) => c.name),
    ['Primitives', 'Scale', 'Color', 'Density'],
  );
  const outputs = generateV2(source);
  assert.deepEqual(outputs, generateV2(structuredClone(source)));
  for (const [path, expected] of Object.entries(outputs))
    assert.equal(
      readFileSync(new URL('../' + path, import.meta.url), 'utf8'),
      expected,
      path,
    );
  const dtcg = JSON.parse(outputs['packages/tokens/v2/tokens.json']);
  const leaves = [];
  function visit(node) {
    if (node.$value !== undefined) leaves.push(node);
    else
      for (const [k, v] of Object.entries(node))
        if (!k.startsWith('$')) visit(v);
  }
  visit(dtcg);
  assert.equal(leaves.length, 925);
  for (const token of leaves)
    if (typeof token.$value === 'string' && token.$value.startsWith('{')) {
      const path = token.$value.slice(1, -1).split('.');
      assert.ok(path.reduce((node, k) => node?.[k], dtcg)?.$type, token.$value);
    }
  assert.match(
    outputs['packages/tokens/v2/tokens.css'],
    /--mg-v2-size-control: 44px/,
  );
  assert.match(
    outputs['packages/tokens/v2/tokens.css'],
    /--mg-v2-size-control: 32px/,
  );
  assert.match(
    outputs['packages/tokens/v2/tokens.css'],
    /--mg-v2-font-family: 'Roboto'/,
  );
  assert.ok(
    !outputs['packages/tokens/v2/tokens.css'].includes(':root'),
    'v2 CSS must stay opt-in',
  );
});
test('v2 rejects missing aliases, alias cycles and incomplete mode values', () => {
  const alias = source.variables.find((v) =>
    Object.values(v.values).some((x) => x?.type === 'VARIABLE_ALIAS'),
  );
  const key = Object.keys(alias.values)[0];
  const missing = structuredClone(source);
  missing.variables.find((v) => v.id === alias.id).values[key] = {
    type: 'VARIABLE_ALIAS',
    id: 'missing',
  };
  assert.throws(() => generateV2(missing), /Unknown variable alias/);
  const cycle = structuredClone(source);
  cycle.variables.find((v) => v.id === alias.id).values[key] = {
    type: 'VARIABLE_ALIAS',
    id: alias.id,
  };
  assert.throws(() => generateV2(cycle), /Cyclic variable alias/);
  const incomplete = structuredClone(source);
  delete incomplete.variables[0].values[
    Object.keys(incomplete.variables[0].values)[0]
  ];
  assert.throws(() => generateV2(incomplete), /Missing .* value/);
});
