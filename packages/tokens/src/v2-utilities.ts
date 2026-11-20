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

export type ScatterPoint = {
  label: string;
  x: number;
  y: number;
  highlighted?: boolean;
};
export function validScatterPoint(point: ScatterPoint): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}
export function nearestChartPoint(
  points: readonly { x: number; y: number }[],
  x: number,
  y: number,
): number {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return -1;
  let best = -1,
    distance = Infinity;
  points.forEach((point, i) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
    const d = (point.x - x) ** 2 + (point.y - y) ** 2;
    if (d < distance) {
      best = i;
      distance = d;
    }
  });
  return best;
}

export type LineSeries = {
  label: string;
  /** Fine positioning of an end label; collision avoidance still applies. */
  labelOffsetY?: number;
  values: readonly (number | null)[];
  series?: 1 | 2 | 3 | 4 | 5;
};
export type LinePoint = { x: number; y: number; index: number; value: number };
/** Shared web/native geometry. Missing samples break paths; values are never imputed. */
export function lineChartLayout(
  labels: readonly string[],
  series: readonly LineSeries[],
  domain?: ChartDomain,
) {
  const bounds = chartDomain(
      series.flatMap((s) => s.values.slice(0, labels.length)),
      domain,
    ),
    plotWidth = Math.max(504, (labels.length - 1) * 72),
    width = plotWidth + 136,
    x = (i: number) =>
      40 +
      (labels.length > 1
        ? (i * plotWidth) / (labels.length - 1)
        : plotWidth / 2),
    y = (v: number) => 212 - ((v - bounds[0]) / (bounds[1] - bounds[0])) * 204;
  const paths = series.map((s, si) => {
    const runs: LinePoint[][] = [];
    let run: LinePoint[] = [];
    labels.forEach((_, index) => {
      const value = s.values[index];
      if (typeof value === 'number' && Number.isFinite(value))
        run.push({ x: x(index), y: y(value), index, value });
      else if (run.length) {
        runs.push(run);
        run = [];
      }
    });
    if (run.length) runs.push(run);
    return {
      label: s.label,
      series: s.series ?? (((si % 5) + 1) as 1 | 2 | 3 | 4 | 5),
      dash: [[], [6, 4], [4, 3], [2, 3], [8, 3, 2, 3]][si % 5],
      runs,
    };
  });
  const ends = paths
    .flatMap((p, i) => {
      const last = p.runs.at(-1)?.at(-1);
      return last && last.y >= 8 && last.y <= 212
        ? [
            {
              index: i,
              point: last,
              y:
                last.y +
                (Number.isFinite(series[i].labelOffsetY)
                  ? series[i].labelOffsetY!
                  : 0),
            },
          ]
        : [];
    })
    .sort((a, b) => a.y - b.y);
  // Reserve a full label line for each endpoint, without moving the actual data.
  ends.forEach((p, i) => {
    p.y = Math.max(8, p.y, i ? ends[i - 1].y + 20 : 8);
  });
  if (ends.length && ends.at(-1)!.y > 212) {
    ends.at(-1)!.y = 212;
    for (let i = ends.length - 2; i >= 0; i--)
      ends[i].y = Math.min(ends[i].y, ends[i + 1].y - 20);
  }
  const enabled = labels.flatMap((_, i) =>
    series.some(
      (s) => typeof s.values[i] === 'number' && Number.isFinite(s.values[i]),
    )
      ? [i]
      : [],
  );
  return { bounds, width, plotWidth, paths, ends, enabled, x, y };
}
/** Dash segments retain phase across corners and clip at the chart boundary on native. */
export function chartLineSegments(
  points: readonly { x: number; y: number }[],
  dash: readonly number[] = [],
  bounds?: readonly [number, number, number, number],
) {
  const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
  let phase = 0,
    used = 0;
  const pattern = dash.filter((n) => Number.isFinite(n) && n > 0);
  function add(x1: number, y1: number, x2: number, y2: number) {
    if (bounds) {
      const [left, top, right, bottom] = bounds,
        dx = x2 - x1,
        dy = y2 - y1;
      let a = 0,
        b = 1;
      for (const [p, q] of [
        [-dx, x1 - left],
        [dx, right - x1],
        [-dy, y1 - top],
        [dy, bottom - y1],
      ]) {
        if (p === 0) {
          if (q < 0) return;
        } else if (p < 0) a = Math.max(a, q / p);
        else b = Math.min(b, q / p);
      }
      if (a >= b) return;
      segments.push({
        x1: x1 + a * dx,
        y1: y1 + a * dy,
        x2: x1 + b * dx,
        y2: y1 + b * dy,
      });
    } else segments.push({ x1, y1, x2, y2 });
  }
  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1],
      to = points[i],
      dx = to.x - from.x,
      dy = to.y - from.y,
      length = Math.hypot(dx, dy);
    if (!Number.isFinite(length) || length === 0) continue;
    if (!pattern.length) {
      add(from.x, from.y, to.x, to.y);
      continue;
    }
    let distance = 0;
    while (distance < length - 1e-9) {
      const step = Math.min(length - distance, pattern[phase] - used);
      if (phase % 2 === 0)
        add(
          from.x + (dx * distance) / length,
          from.y + (dy * distance) / length,
          from.x + (dx * (distance + step)) / length,
          from.y + (dy * (distance + step)) / length,
        );
      distance += step;
      used += step;
      if (used >= pattern[phase] - 1e-9) {
        phase = (phase + 1) % pattern.length;
        used = 0;
      }
    }
  }
  return segments;
}
