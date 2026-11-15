import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseDate,
  formatDate,
  addDays,
  addMonths,
  monthGrid,
  parseTime,
  formatTime,
  quarterHours,
} from '../packages/tokens/dist/v2.js';
test('date parsing rejects rollovers and unknown months without timezone drift', () => {
  assert.equal(parseDate('2024-02-29'), '2024-02-29');
  for (const value of [
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
    'Junk 14, 2026',
    '',
  ])
    assert.equal(parseDate(value), undefined);
  assert.equal(parseDate('Wed, Oct 14, 2026'), '2026-10-14');
  assert.equal(parseDate('October 14, 2026'), '2026-10-14');
  assert.equal(formatDate('2026-10-14'), 'Wed, Oct 14, 2026');
  assert.equal(addDays('2026-03-08', 1), '2026-03-09');
  assert.equal(addMonths('2024-01-31', 1), '2024-02-29');
  assert.equal(addMonths('2024-02-29', 12), '2025-02-28');
});
test('calendar grids retain Monday start and complete month rows', () => {
  const days = monthGrid('2026-10-14');
  assert.equal(days.length, 35);
  assert.equal(days[0], '2026-09-28');
  assert.equal(days.at(-1), '2026-11-01');
  assert.equal(new Set(days).size, days.length);
  assert.equal(monthGrid('2026-10-14', 0)[0], '2026-09-27');
  assert.equal(monthGrid('0001-01-01', 0)[0], '');
  const last = monthGrid('9999-12-01');
  const valid = last.filter(Boolean);
  assert.equal(new Set(valid).size, valid.length);
  assert.ok(last.includes(''));
});
test('time parsing preserves midnight/noon and provides 96 quarter-hour choices', () => {
  for (const [typed, value] of [
    ['12:00 AM', '00:00'],
    ['12:00 PM', '12:00'],
    ['2:30 pm', '14:30'],
    ['23:59', '23:59'],
  ])
    assert.equal(parseTime(typed), value);
  for (const value of ['24:00', '12:60', '0:30 AM', '13:00 PM', ''])
    assert.equal(parseTime(value), undefined);
  assert.equal(formatTime('00:00'), '12:00 AM');
  assert.equal(formatTime('14:30'), '2:30 PM');
  assert.equal(quarterHours.length, 96);
  assert.equal(quarterHours.at(-1), '23:45');
});
