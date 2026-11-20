export type Tone =
  'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type ContextHue = 'accent' | 'teal' | 'amber' | 'green' | 'blue';
/** Stable across web/native clients. No context is mapped to a danger/red wash. */
export function contextHue(id: string): ContextHue {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++)
    hash = Math.imul(hash ^ id.charCodeAt(i), 16777619) >>> 0;
  return (['accent', 'teal', 'amber', 'green', 'blue'] as const)[hash % 5];
}
export function progressValue(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value)
    ? undefined
    : Math.max(0, Math.min(100, value));
}
/** Snap to a step relative to min, retaining decimal input without binary noise. */
export function sliderValue(
  value: number,
  min = 0,
  max = 100,
  step = 1,
): number {
  if (max <= min) return min;
  const clamped = Math.max(
    min,
    Math.min(max, Number.isFinite(value) ? value : min),
  );
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  const snapped = min + Math.round((clamped - min) / increment) * increment;
  return Math.max(min, Math.min(max, Number(snapped.toPrecision(12))));
}
export function initials(name: string): string {
  const words = name.normalize('NFC').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  return (
    words.length > 1
      ? Array.from(words[0])[0] + Array.from(words.at(-1)!)[0]
      : Array.from(words[0]).slice(0, 2).join('')
  ).toUpperCase();
}

/** A bounded one-based page, including an honest empty range for zero rows. */
export function paginationRange(page: number, total: number, pageSize = 25) {
  const count = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const size = Number.isFinite(pageSize)
    ? Math.max(1, Math.floor(pageSize))
    : 25;
  const totalPages = Math.max(1, Math.ceil(count / size));
  const current = Number.isFinite(page)
    ? Math.max(1, Math.min(totalPages, Math.floor(page)))
    : 1;
  return {
    current,
    total: count,
    pageSize: size,
    totalPages,
    start: count ? (current - 1) * size + 1 : 0,
    end: Math.min(count, current * size),
  };
}
export function paginationPages(current: number, total: number) {
  const bounded = paginationRange(current, total, 1);
  return [
    ...new Set([
      1,
      bounded.current - 1,
      bounded.current,
      bounded.current + 1,
      bounded.totalPages,
    ]),
  ]
    .filter((p) => p >= 1 && p <= bounded.totalPages)
    .sort((a, b) => a - b);
}

export type ChartSeries = 1 | 2 | 3 | 4 | 5 | 'other';

export type ChartDatum = { label: string; value: number | null };
export type ChartDomain = readonly [number, number];
/** Stable chart domains include zero, and never turn missing values into zero. */
export function chartDomain(
  values: readonly (number | null)[],
  domain?: ChartDomain,
  intervals = 3,
): ChartDomain {
  if (
    domain &&
    Number.isFinite(domain[0]) &&
    Number.isFinite(domain[1]) &&
    domain[1] > domain[0]
  )
    return domain;
  const finite = values.filter(
    (n): n is number => n !== null && Number.isFinite(n),
  );
  if (!finite.length) return [0, 1];
  const lo = Math.min(0, ...finite),
    hi = Math.max(0, ...finite);
  if (lo === hi) return [0, 1];
  const count = Number.isFinite(intervals)
    ? Math.max(1, Math.floor(intervals))
    : 3;
  const raw = (hi - lo) / count,
    power = 10 ** Math.floor(Math.log10(raw)),
    fraction = raw / power;
  const step =
    ([1, 1.5, 2, 2.5, 3, 5, 7.5, 10].find((n) => n >= fraction) ?? 10) * power;
  return [
    Number((Math.floor(lo / step) * step).toPrecision(12)),
    Number((Math.ceil(hi / step) * step).toPrecision(12)),
  ];
}
export function chartTicks(domain: ChartDomain, intervals = 3): number[] {
  const count = Number.isFinite(intervals)
    ? Math.max(1, Math.floor(intervals))
    : 3;
  return Array.from({ length: count + 1 }, (_, i) =>
    Number((domain[0] + ((domain[1] - domain[0]) * i) / count).toPrecision(12)),
  );
}
export function chartIndex(
  values: readonly (number | null)[],
  requested?: number,
): number {
  const enabled = values.flatMap((value, i) =>
    value !== null && Number.isFinite(value) ? [i] : [],
  );
  if (!enabled.length) return -1;
  if (requested === undefined || !Number.isFinite(requested))
    return enabled[enabled.length - 1];
  const target = Math.max(
    0,
    Math.min(values.length - 1, Math.floor(requested)),
  );
  return enabled.reduce(
    (best, i) => (Math.abs(i - target) < Math.abs(best - target) ? i : best),
    enabled[0],
  );
}

export type HeatLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export function heatThresholds(values?: readonly number[]): readonly number[] {
  return values?.length === 7 &&
    values.every((v, i) => Number.isFinite(v) && (i === 0 || v > values[i - 1]))
    ? values
    : [0, 5, 10, 15, 20, 25, 30];
}
export function heatLevel(
  value: number | null | undefined,
  thresholds?: readonly number[],
): HeatLevel | undefined {
  if (value === null || value === undefined || !Number.isFinite(value))
    return undefined;
  const stops = heatThresholds(thresholds);
  let level = 1;
  for (let i = 1; i < stops.length; i++) if (value >= stops[i]) level = i + 1;
  return level as HeatLevel;
}
export type HeatmapRow = { label: string; values: (number | null)[] };

export type BoxPlotDatum = {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: readonly number[];
};
export function validBoxPlot(row: BoxPlotDatum): boolean {
  return (
    [row.min, row.q1, row.median, row.q3, row.max].every(Number.isFinite) &&
    row.min <= row.q1 &&
    row.q1 <= row.median &&
    row.median <= row.q3 &&
    row.q3 <= row.max
  );
}
