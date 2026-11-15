import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  contextHue,
  progressValue,
  initials,
  sliderValue,
} from '../packages/tokens/dist/v2.js';
test('v2 slider steps are relative to min and do not leak floating-point tails', () => {
  assert.equal(sliderValue(0.3, 0.1, 1, 0.2), 0.3);
  assert.equal(sliderValue(0.4, 0.1, 1, 0.2), 0.5);
  assert.equal(sliderValue(-20), 0);
  assert.equal(sliderValue(120), 100);
  assert.equal(sliderValue(NaN, 10, 20), 10);
  assert.equal(sliderValue(10, 5, 5), 5);
});
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
