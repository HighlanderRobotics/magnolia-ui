<script lang="ts">
  import {
    chartDomain,
    chartTicks,
    validScatterPoint,
    nearestChartPoint,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import type {
    ScatterPoint,
    ChartDomain,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import ChartFrame from './ChartFrame.svelte';
  import ChartMarker from './ChartMarker.svelte';
  import ChartTooltip from './ChartTooltip.svelte';
  import ChartReadout from './ChartReadout.svelte';
  const uid = $props.id();
  let {
    points,
    label,
    xLabel = 'X',
    yLabel = 'Y',
    xDomain,
    yDomain,
    formatX = String,
    formatY = String,
    oninspect,
  }: {
    points: readonly ScatterPoint[];
    label: string;
    xLabel?: string;
    yLabel?: string;
    xDomain?: ChartDomain;
    yDomain?: ChartDomain;
    formatX?: (value: number) => string;
    formatY?: (value: number) => string;
    oninspect?: (index: number, point: ScatterPoint) => void;
  } = $props();
  let valid = $derived(
      points.flatMap((p, i) => (validScatterPoint(p) ? [i] : [])),
    ),
    xb = $derived(
      chartDomain(
        valid.map((i) => points[i].x),
        xDomain,
        4,
      ),
    ),
    yb = $derived(
      chartDomain(
        valid.map((i) => points[i].y),
        yDomain,
        4,
      ),
    ),
    xt = $derived(chartTicks(xb, 4)),
    yt = $derived(chartTicks(yb, 4)),
    visible = $derived(
      valid.filter(
        (i) =>
          points[i].x >= xb[0] &&
          points[i].x <= xb[1] &&
          points[i].y >= yb[0] &&
          points[i].y <= yb[1],
      ),
    );
  const x = (value: number) => 44 + ((value - xb[0]) / (xb[1] - xb[0])) * 500,
    y = (value: number) => 204 - ((value - yb[0]) / (yb[1] - yb[0])) * 196;
  let active = $state(-1),
    tabStop = $state(-1),
    tooltip = $state(false),
    buttons = $state<(HTMLButtonElement | null)[]>([]),
    root = $state<HTMLDivElement>(null!);
  let current = $derived(active >= 0 ? points[active] : undefined);
  let lastInspection: string | undefined;
  function describe(p: ScatterPoint) {
    return `${p.label}, ${xLabel}: ${formatX(p.x)}, ${yLabel}: ${formatY(p.y)}, ${p.highlighted ? 'highlighted' : 'context'}`;
  }
  function inspect(index: number, focus = false) {
    if (!visible.includes(index)) return;
    active = index;
    tooltip = true;
    if (focus) {
      tabStop = index;
      buttons[index]?.focus();
    }
    const p = points[index],
      key = `${index}:${p.label}:${p.x}:${p.y}`;
    if (key !== lastInspection) {
      lastInspection = key;
      oninspect?.(index, p);
    }
  }
  function pointer(event: PointerEvent, focus = false) {
    const box = root.getBoundingClientRect(),
      px = event.clientX - box.x,
      py = event.clientY - box.y;
    if (px < 44 || px > 544 || py < 8 || py > 204) {
      tooltip = false;
      return;
    }
    const nearest = nearestChartPoint(
      visible.map((i) => ({ x: x(points[i].x), y: y(points[i].y) })),
      px,
      py,
    );
    if (nearest >= 0) inspect(visible[nearest], focus);
  }
  function key(e: KeyboardEvent, index: number) {
    if (e.key === 'Escape') {
      tooltip = false;
      e.preventDefault();
      return;
    }
    const at = visible.indexOf(index),
      next =
        e.key === 'Home'
          ? visible[0]
          : e.key === 'End'
            ? visible.at(-1)
            : e.key === 'ArrowRight'
              ? visible[Math.min(visible.length - 1, at + 1)]
              : e.key === 'ArrowLeft'
                ? visible[Math.max(0, at - 1)]
                : undefined;
    if (next !== undefined) {
      e.preventDefault();
      inspect(next, true);
    }
  }
  $effect(() => {
    if (!visible.includes(active)) {
      active = -1;
      tooltip = false;
    }
    if (!visible.includes(tabStop)) tabStop = -1;
  });
</script>

<ChartFrame
  {label}
  columns={['Observation', xLabel, yLabel, 'Group']}
  rows={points.map((p) => [
    p.label,
    Number.isFinite(p.x) ? formatX(p.x) : null,
    Number.isFinite(p.y) ? formatY(p.y) : null,
    p.highlighted ? 'Highlighted' : 'Context',
  ])}
>
  <div
    class="mg2-scatter"
    role="group"
    aria-label={`${label} observations`}
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
      >Left/Right and Home/End inspect observations. Escape hides the readout.</span
    >
    {#if !visible.length}<span class="mg2-chart-empty"
        >{valid.length ? 'No data in this range' : 'No data'}</span
      >{:else}
      <div aria-hidden="true">
        {#each yt as value}<span
            class="mg2-chart-grid"
            style={`left:44px;top:${y(value)}px;width:500px`}
          ></span><span
            class="mg2-chart-axis mg2-scatter-y"
            style={`top:${y(value) - 8}px`}>{formatY(value)}</span
          >{/each}{#each xt as value}<span
            class="mg2-chart-axis mg2-scatter-x"
            style={`left:${x(value) - 8}px`}>{formatX(value)}</span
          >{/each}<span class="mg2-chart-axis mg2-scatter-x-label"
          >{xLabel === 'X' ? '' : xLabel}</span
        >
      </div>
      {#each visible as index}{@const point = points[index]}<button
          type="button"
          class="mg2-scatter-point"
          bind:this={buttons[index]}
          data-highlight={!!point.highlighted}
          style={`left:${x(point.x) - 6.5}px;top:${y(point.y) - 6.5}px`}
          aria-label={describe(point)}
          aria-describedby={tooltip && active === index
            ? `${uid}-tooltip`
            : `${uid}-help`}
          tabindex={index === (tabStop < 0 ? visible[0] : tabStop) ? 0 : -1}
          onfocus={() => {
            tabStop = index;
            inspect(index);
          }}
          onblur={() => (tooltip = false)}
          onclick={() => inspect(index)}
          onkeydown={(e) => key(e, index)}
          ><ChartMarker
            kind={point.highlighted ? 'scatter-highlight' : 'scatter-neutral'}
          /></button
        >{/each}
    {/if}
    {#if tooltip && current && visible.includes(active)}
      <ChartReadout
        anchor={buttons[active] ?? undefined}
        ondismiss={() => (tooltip = false)}
      >
        <ChartTooltip
          id={`${uid}-tooltip`}
          title={current.label}
          items={[
            {
              label: xLabel,
              value: formatX(current.x),
              series: current.highlighted ? 1 : 'other',
            },
            {
              label: yLabel,
              value: formatY(current.y),
              series: current.highlighted ? 1 : 'other',
            },
          ]}
        />
      </ChartReadout>
    {/if}
  </div>
</ChartFrame>
