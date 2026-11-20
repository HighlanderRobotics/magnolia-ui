<script lang="ts">
  import {
    lineChartLayout,
    chartTicks,
    nearestChartPoint,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import type {
    LineSeries,
    ChartDomain,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import ChartFrame from './ChartFrame.svelte';
  import ChartMarker from './ChartMarker.svelte';
  import ChartTooltip from './ChartTooltip.svelte';
  import ChartReadout from './ChartReadout.svelte';
  const colors = [
    'var(--mg-v2-color-chart-cat-1)',
    'var(--mg-v2-color-chart-cat-2)',
    'var(--mg-v2-color-chart-cat-3)',
    'var(--mg-v2-color-chart-cat-4)',
    'var(--mg-v2-color-chart-cat-5)',
  ];
  const uid = $props.id();
  let {
    labels,
    series,
    label,
    domain,
    activeIndex = $bindable(undefined),
    formatValue = String,
    oninspect,
  }: {
    labels: readonly string[];
    series: readonly LineSeries[];
    label: string;
    domain?: ChartDomain;
    activeIndex?: number;
    formatValue?: (value: number) => string;
    oninspect?: (index: number) => void;
  } = $props();
  let layout = $derived(lineChartLayout(labels, series, domain)),
    supported = $derived(series.length <= 5),
    selected = $derived(
      layout.enabled.includes(activeIndex ?? -1)
        ? activeIndex!
        : (layout.enabled.at(-1) ?? -1),
    ),
    tooltip = $state(false),
    tabStop = $state(-1),
    root = $state<HTMLDivElement>(null!),
    buttons = $state<(HTMLButtonElement | null)[]>([]);
  let lastInspection = '';
  function describe(index: number) {
    return `${labels[index]}, ${series.map((s) => `${s.label}: ${typeof s.values[index] === 'number' && Number.isFinite(s.values[index]) ? formatValue(s.values[index]!) : 'No data'}`).join(', ')}`;
  }
  function inspect(index: number, focus = false) {
    if (!layout.enabled.includes(index)) return;
    activeIndex = index;
    tooltip = true;
    if (focus) {
      tabStop = index;
      buttons[index]?.focus();
    }
    const key = describe(index);
    if (lastInspection !== key) {
      lastInspection = key;
      oninspect?.(index);
    }
  }
  function pointer(e: PointerEvent, focus = false) {
    const box = root.getBoundingClientRect(),
      px = e.clientX - box.x,
      py = e.clientY - box.y;
    if (px < 40 || px > 40 + layout.plotWidth || py < 8 || py > 212) {
      tooltip = false;
      return;
    }
    const nearest = nearestChartPoint(
      layout.enabled.map((i) => ({ x: layout.x(i), y: 0 })),
      px,
      0,
    );
    if (nearest >= 0) inspect(layout.enabled[nearest], focus);
  }
  function key(e: KeyboardEvent, index: number) {
    if (e.key === 'Escape') {
      tooltip = false;
      e.preventDefault();
      return;
    }
    const at = layout.enabled.indexOf(index),
      next =
        e.key === 'Home'
          ? layout.enabled[0]
          : e.key === 'End'
            ? layout.enabled.at(-1)
            : e.key === 'ArrowRight'
              ? layout.enabled[Math.min(layout.enabled.length - 1, at + 1)]
              : e.key === 'ArrowLeft'
                ? layout.enabled[Math.max(0, at - 1)]
                : undefined;
    if (next !== undefined) {
      e.preventDefault();
      inspect(next, true);
    }
  }
  $effect(() => {
    if (!layout.enabled.includes(tabStop)) tabStop = -1;
    if (selected < 0) tooltip = false;
  });
</script>

<ChartFrame
  {label}
  columns={['Period', ...series.map((s) => s.label)]}
  rows={labels.map((period, i) => [
    period,
    ...series.map((s) =>
      typeof s.values[i] === 'number' && Number.isFinite(s.values[i])
        ? formatValue(s.values[i]!)
        : null,
    ),
  ])}
>
  <div
    class="mg2-line-chart"
    style={`width:${layout.width}px`}
    role="group"
    aria-label={`${label} periods`}
    bind:this={root}
    onpointermove={(e) => pointer(e)}
    onpointerdown={(e) => {
      pointer(e, true);
      e.preventDefault();
    }}
    onpointerleave={(e) => {
      if (e.pointerType !== 'touch') tooltip = false;
    }}
  >
    <span class="mg2-sr-only" id={`${uid}-help`}
      >Left/Right and Home/End inspect periods. Escape hides the readout.</span
    >
    {#if !supported || !layout.enabled.length}
      <span class="mg2-chart-empty"
        >{supported
          ? 'No data'
          : 'LineChart supports up to five series. View all values in the data table.'}</span
      >
    {:else}
      <div aria-hidden="true">
        {#each chartTicks(layout.bounds) as value}
          <span
            class="mg2-chart-grid"
            style={`left:40px;top:${layout.y(value)}px;width:${layout.plotWidth}px`}
          ></span>
          <span
            class="mg2-chart-axis mg2-line-y"
            style={`top:${layout.y(value) - 8}px`}>{formatValue(value)}</span
          >
        {/each}
        {#each labels as period, i}<span
            class="mg2-chart-axis mg2-line-x"
            style={`left:${layout.x(i) - 8}px`}>{period}</span
          >{/each}
        <svg
          class="mg2-line-paths"
          width={layout.width}
          height="240"
          viewBox={`0 0 ${layout.width} 240`}
        >
          <defs
            ><clipPath id={`${uid}-clip`}
              ><rect
                x="39"
                y="7"
                width={layout.plotWidth + 2}
                height="206"
              /></clipPath
            ></defs
          >
          <g clip-path={`url(#${uid}-clip)`}>
            {#each layout.paths as path}
              {#each path.runs as run}
                {#if run.length > 1}<polyline
                    points={run.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={colors[path.series - 1]}
                    stroke-width="2"
                    stroke-dasharray={path.dash.join(' ') || undefined}
                  />
                {:else if run[0].y >= 8 && run[0].y <= 212}<circle
                    cx={run[0].x}
                    cy={run[0].y}
                    r="2"
                    fill={colors[path.series - 1]}
                  />{/if}
              {/each}
            {/each}
          </g>
          {#each layout.ends as end}
            {#if Math.abs(end.point.y + (series[end.index].labelOffsetY ?? 0) - end.y) > 0.1 || end.point.x < 40 + layout.plotWidth}
              <polyline
                points={`${end.point.x},${end.point.y} ${layout.plotWidth + 44},${end.y} ${layout.plotWidth + 48},${end.y}`}
                fill="none"
                stroke={colors[layout.paths[end.index].series - 1]}
                stroke-width="1"
              />
            {/if}
          {/each}
        </svg>
        {#each layout.ends as end}
          <span
            class="mg2-line-end"
            title={series[end.index].label}
            style={`left:${layout.plotWidth + 64}px;top:${end.y - 8}px`}
            ><span
              style={`background:${colors[layout.paths[end.index].series - 1]}`}
            ></span><span class="mg2-line-end-text"
              >{series[end.index].label}</span
            ></span
          >
        {/each}
        {#if selected >= 0}
          <span
            class="mg2-line-crosshair"
            style={`left:${layout.x(selected)}px`}
          ></span>
          {#each series as s, i}
            {@const value = s.values[selected]}
            {#if typeof value === 'number' && Number.isFinite(value) && value >= layout.bounds[0] && value <= layout.bounds[1]}
              <span
                class="mg2-line-marker"
                style={`left:${layout.x(selected) - 6}px;top:${layout.y(value) - 6}px`}
                ><ChartMarker
                  kind={`line-point-${layout.paths[i].series}`}
                /></span
              >
            {/if}
          {/each}
        {/if}
      </div>
      {#each labels as _, i}
        {#if layout.enabled.includes(i)}
          <button
            type="button"
            class="mg2-line-period"
            style={`left:${layout.x(i) - 22}px`}
            aria-label={describe(i)}
            aria-describedby={`${uid}-help`}
            tabindex={i === (tabStop >= 0 ? tabStop : layout.enabled[0])
              ? 0
              : -1}
            bind:this={buttons[i]}
            onfocus={() => inspect(i)}
            onblur={() => (tooltip = false)}
            onkeydown={(e) => key(e, i)}
          ></button>
        {/if}
      {/each}
      {#if tooltip && selected >= 0}
        <ChartReadout
          anchor={buttons[selected] ?? root}
          ondismiss={() => (tooltip = false)}
        >
          <ChartTooltip
            title={labels[selected]}
            items={series.map((s, i) => ({
              label: s.label,
              value:
                typeof s.values[selected] === 'number' &&
                Number.isFinite(s.values[selected])
                  ? formatValue(s.values[selected]!)
                  : '—',
              series: layout.paths[i].series,
            }))}
          />
        </ChartReadout>
      {/if}
    {/if}
  </div>
</ChartFrame>
