import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  contextHue,
  progressValue,
  initials,
} from '../packages/tokens/dist/v2.js';
test('v2 progress treats nonfinite data as missing and clamps finite boundaries', () => {
  for (const value of [undefined, NaN, Infinity, -Infinity])
    assert.equal(progressValue(value), undefined);
  assert.equal(progressValue(-5), 0);
  assert.equal(progressValue(125), 100);
  assert.equal(progressValue(12.5), 12.5);
});
test('v2 context colors are deterministic and never danger red', () => {
  const allowed = ['accent', 'teal', 'amber', 'green', 'blue'];
  for (const id of ['', 'session-alpha', 'session-beta', '8033', '🌸']) {
    assert.ok(allowed.includes(contextHue(id)));
    assert.equal(contextHue(id), contextHue(`${id}`));
  }
});
test('v2 initials handle whitespace, unicode and empty names', () => {
  assert.equal(initials('  Maya  Chen  '), 'MC');
  assert.equal(initials('Alex'), 'AL');
  assert.equal(initials(''), '?');
  assert.equal(initials('e\u0301mile Zola'), 'ÉZ');
  assert.equal(initials('李 明'), '李明');
});
