import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  contextHue,
  progressValue,
  initials,
  sliderValue,
  paginationRange,
  paginationPages,
  chartDomain,
  chartTicks,
  chartIndex,
  heatThresholds,
  heatLevel,
  validBoxPlot,
  validScatterPoint,
  nearestChartPoint,
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

test('v2 pagination bounds empty, fractional and stale pages without phantom rows', () => {
  assert.deepEqual(paginationRange(99, 0, 25), {
    current: 1,
    total: 0,
    pageSize: 25,
    totalPages: 1,
    start: 0,
    end: 0,
  });
  assert.deepEqual(paginationRange(99, 312, 25), {
    current: 13,
    total: 312,
    pageSize: 25,
    totalPages: 13,
    start: 301,
    end: 312,
  });
  assert.deepEqual(paginationRange(NaN, Infinity, NaN), {
    current: 1,
    total: 0,
    pageSize: 25,
    totalPages: 1,
    start: 0,
    end: 0,
  });
  assert.equal(paginationRange(-2, 12, -1).pageSize, 1);
  assert.deepEqual(paginationPages(3, 13), [1, 2, 3, 4, 13]);
  assert.deepEqual(paginationPages(99, 1), [1]);
});

test('v2 chart domains and selection preserve missing data and sensible axes', () => {
  assert.deepEqual(chartDomain([34, 41, 38, 52, 47, 61, 58, 66]), [0, 75]);
  assert.deepEqual(chartDomain([18, 22, 25, 24, 31, 42, 40, 44]), [0, 45]);
  assert.deepEqual(chartDomain([null, NaN, Infinity]), [0, 1]);
  assert.deepEqual(chartDomain([-5, 10]), [-5, 10]);
  assert.deepEqual(chartDomain([5], [10, 20]), [10, 20]);
  assert.deepEqual(chartTicks([-5, 10]), [-5, 0, 5, 10]);
  assert.equal(chartIndex([null, 12, NaN, 9], 0), 1);
  assert.equal(chartIndex([null, 12, NaN, 9], 2), 1);
  assert.equal(chartIndex([null, 12, NaN, 9]), 3);
  assert.equal(chartIndex([null, NaN]), -1);
});

test('v2 heatmap thresholds distinguish zero, saturation and missing values', () => {
  assert.equal(heatLevel(0), 1);
  assert.equal(heatLevel(10), 3);
  assert.equal(heatLevel(30), 7);
  assert.equal(heatLevel(300), 7);
  for (const value of [null, undefined, NaN, Infinity])
    assert.equal(heatLevel(value), undefined);
  assert.deepEqual(heatThresholds([10, 5]), [0, 5, 10, 15, 20, 25, 30]);
  assert.equal(heatLevel(30, [0, 10, 20, 30, 40, 50, 60]), 4);
});

test('v2 box plots reject unordered and nonfinite quantiles', () => {
  const row = {
    label: 'Northwind',
    min: 12,
    q1: 22,
    median: 28,
    q3: 34,
    max: 48,
  };
  assert.equal(validBoxPlot(row), true);
  assert.equal(validBoxPlot({ ...row, q1: 40 }), false);
  assert.equal(validBoxPlot({ ...row, min: NaN }), false);
  assert.equal(
    validBoxPlot({ ...row, min: 1, q1: 1, median: 1, q3: 1, max: 1 }),
    true,
  );
});

test('v2 scatter inspection chooses nearest finite points with stable tie handling', () => {
  assert.equal(validScatterPoint({ label: 'A', x: 1.2, y: 34 }), true);
  assert.equal(validScatterPoint({ label: 'Missing', x: NaN, y: 34 }), false);
  assert.equal(
    nearestChartPoint(
      [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
      ],
      1,
      0,
    ),
    0,
  );
  assert.equal(
    nearestChartPoint(
      [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
      ],
      1.5,
      0,
    ),
    1,
  );
  assert.equal(
    nearestChartPoint(
      [
        { x: NaN, y: 0 },
        { x: 2, y: 0 },
      ],
      1,
      0,
    ),
    1,
  );
  assert.equal(nearestChartPoint([], 1, 0), -1);
});
