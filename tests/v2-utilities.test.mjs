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
  lineChartLayout,
  chartLineSegments,
  sheetSwipe,
  commandResults,
} from '../packages/tokens/dist/v2.js';
test('v2 command search matches all query words across labels, groups, metadata and aliases in stable order', () => {
  const items = [
    {
      id: 'one',
      label: 'Café reports',
      group: 'Views',
      meta: '3 unread',
      keywords: ['charts'],
    },
    { id: 'two', label: 'Export CSV', group: 'Actions', disabled: true },
    { id: 'three', label: 'Weekly reports', group: 'Views' },
  ];
  assert.deepEqual(
    commandResults(items, '  CAFE views  ').map((x) => x.id),
    ['one'],
  );
  assert.deepEqual(
    commandResults(items, 'charts unread').map((x) => x.id),
    ['one'],
  );
  assert.deepEqual(
    commandResults(items, 'reports').map((x) => x.id),
    ['one', 'three'],
  );
  assert.deepEqual(commandResults(items, 'CSV'), [items[1]]);
  assert.deepEqual(commandResults(items, 'zzzz'), []);
  assert.deepEqual(commandResults(items, ''), items);
  assert.equal(items[0].label, 'Café reports');
});
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

test('v2 line geometry retains missing samples, source spacing and readable end labels', () => {
  const source = lineChartLayout(
    ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    [
      { label: 'Northwind', values: [18, 22, 25, 24, 31, 42, 40, 44] },
      { label: 'Larkspur', values: [20, 19, 25, 28, 27, 35, 33, 36] },
      { label: 'Halcyon', values: [10, 14, 13, 17, 22, 28, 26, 30] },
    ],
  );
  assert.equal(source.width, 640);
  assert.deepEqual(source.bounds, [0, 45]);
  assert.equal(source.x(5), 400);
  assert.equal(source.y(30), 76);
  assert.deepEqual(
    source.paths.map((p) => p.dash),
    [[], [6, 4], [4, 3]],
  );
  const gaps = lineChartLayout(
    ['A', 'B', 'C', 'D'],
    [
      { label: 'A', values: [1, null, 3, NaN] },
      { label: 'B', values: [1, null, 3, Infinity] },
    ],
  );
  assert.deepEqual(gaps.enabled, [0, 2]);
  assert.deepEqual(
    gaps.paths[0].runs.map((run) => run.map((p) => p.index)),
    [[0], [2]],
  );
  assert.equal(gaps.ends[1].y - gaps.ends[0].y, 20);
  const upper = lineChartLayout(
    ['A'],
    Array.from({ length: 5 }, (_, i) => ({ label: String(i), values: [0] })),
    [0, 10],
  );
  assert.deepEqual(
    upper.ends.map((e) => e.y),
    [132, 152, 172, 192, 212],
  );
  assert.equal(upper.x(0), 292);
  const offset = lineChartLayout(
    ['A'],
    [{ label: 'A', values: [5], labelOffsetY: 2 }],
    [0, 10],
  );
  assert.equal(offset.ends[0].y, offset.ends[0].point.y + 2);
  assert.deepEqual(lineChartLayout([], []).enabled, []);
});

test('v2 native chart segments preserve dash phase across corners and clip fixed domains', () => {
  assert.deepEqual(
    chartLineSegments(
      [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 8 },
      ],
      [6, 4],
    ),
    [
      { x1: 0, y1: 0, x2: 4, y2: 0 },
      { x1: 4, y1: 0, x2: 4, y2: 2 },
      { x1: 4, y1: 6, x2: 4, y2: 8 },
    ],
  );
  assert.deepEqual(
    chartLineSegments(
      [
        { x: -2, y: -2 },
        { x: 12, y: 12 },
      ],
      [],
      [0, 0, 10, 10],
    ),
    [{ x1: 0, y1: 0, x2: 10, y2: 10 }],
  );
  assert.deepEqual(
    chartLineSegments(
      [
        { x: -2, y: 0 },
        { x: -2, y: 10 },
      ],
      [],
      [0, 0, 10, 10],
    ),
    [],
  );
  assert.deepEqual(
    chartLineSegments([
      { x: 2, y: 2 },
      { x: 2, y: 2 },
    ]),
    [],
  );
});

test('v2 sheet swipe requires a finite, predominantly downward drag', () => {
  assert.equal(sheetSwipe(0, 64), true);
  assert.equal(sheetSwipe(12, 80), true);
  for (const [x, y] of [
    [0, 63],
    [0, -80],
    [70, 80],
    [-70, 80],
    [Infinity, 80],
    [0, Infinity],
    [NaN, 80],
  ])
    assert.equal(sheetSwipe(x, y), false);
});
