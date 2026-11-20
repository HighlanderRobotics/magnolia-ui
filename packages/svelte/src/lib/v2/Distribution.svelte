<script lang="ts">
  import {
    chartDomain,
    chartTicks,
    validBoxPlot,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import type {
    BoxPlotDatum,
    ChartDomain,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import ChartFrame from './ChartFrame.svelte';
  import Glyph from './Glyph.svelte';
  let {
    data,
    label,
    domain,
    highlightIndex = $bindable(0),
    onhighlightchange,
    formatValue = String,
  }: {
    data: readonly BoxPlotDatum[];
    label: string;
    domain?: ChartDomain;
    highlightIndex?: number;
    onhighlightchange?: (index: number) => void;
    formatValue?: (value: number) => string;
  } = $props();
  let enabled = $derived(
      data.flatMap((row, i) => (validBoxPlot(row) ? [i] : [])),
    ),
    bounds = $derived(
      chartDomain(
        data.flatMap((row) =>
          validBoxPlot(row) ? [row.min, row.max, ...(row.outliers ?? [])] : [],
        ),
        domain,
        4,
      ),
    ),
    ticks = $derived(chartTicks(bounds, 4)),
    selected = $derived(
      enabled.includes(highlightIndex) ? highlightIndex : (enabled[0] ?? -1),
    ),
    buttons = $state<(HTMLButtonElement | null)[]>([]);
  const x = (value: number) =>
    96 +
    Math.max(0, Math.min(1, (value - bounds[0]) / (bounds[1] - bounds[0]))) *
      448;
  function describe(row: BoxPlotDatum) {
    return validBoxPlot(row)
      ? `${row.label}, minimum ${formatValue(row.min)}, Q1 ${formatValue(row.q1)}, median ${formatValue(row.median)}, Q3 ${formatValue(row.q3)}, maximum ${formatValue(row.max)}${row.outliers?.length ? `, outliers ${row.outliers.filter(Number.isFinite).map(formatValue).join(', ')}` : ''}`
      : `${row.label}: Invalid range`;
  }
  function choose(index: number, focus = false) {
    highlightIndex = index;
    onhighlightchange?.(index);
    if (focus) buttons[index]?.focus();
  }
  function key(e: KeyboardEvent, index: number) {
    const current = enabled.indexOf(index),
      next =
        e.key === 'Home'
          ? enabled[0]
          : e.key === 'End'
            ? enabled.at(-1)
            : e.key === 'ArrowDown'
              ? enabled[Math.min(enabled.length - 1, current + 1)]
              : e.key === 'ArrowUp'
                ? enabled[Math.max(0, current - 1)]
                : undefined;
    if (next !== undefined) {
      e.preventDefault();
      choose(next, true);
    }
  }
</script>

<ChartFrame
  {label}
  columns={['Project', 'Minimum', 'Q1', 'Median', 'Q3', 'Maximum', 'Outliers']}
  rows={data.map((row) => [
    row.label,
    ...[row.min, row.q1, row.median, row.q3, row.max].map((v) =>
      Number.isFinite(v) ? formatValue(v) : null,
    ),
    (row.outliers ?? []).filter(Number.isFinite).map(formatValue).join(', '),
  ])}
>
  <div
    class="mg2-distribution"
    style={`--mg2-distribution-rows:${data.length}`}
  >
    {#if selected < 0}<span class="mg2-chart-empty">No data</span>{:else}
      <div aria-hidden="true">
        {#each ticks as value}<span
            class="mg2-distribution-grid"
            style={`left:${x(value)}px`}
          ></span><span
            class="mg2-chart-axis mg2-distribution-tick"
            style={`left:${x(value) - 6}px`}>{formatValue(value)}</span
          >{/each}
      </div>
    {/if}
    {#each data as row, i}{@const highlighted = i === selected}
      <button
        class="mg2-distribution-row"
        type="button"
        bind:this={buttons[i]}
        style={`--mg2-distribution-row:${i}`}
        data-highlight={highlighted}
        aria-label={describe(row)}
        aria-pressed={highlighted}
        disabled={!validBoxPlot(row)}
        tabindex={highlighted ? 0 : -1}
        onclick={() => choose(i)}
        onkeydown={(e) => key(e, i)}
      >
        <span aria-hidden="true" class="mg2-distribution-label"
          >{row.label}</span
        >
        {#if validBoxPlot(row)}<span
            aria-hidden="true"
            class="mg2-distribution-whisker"
            style={`left:${x(row.min)}px;width:${Math.max(0, x(row.max) - x(row.min))}px`}
          ></span>
          {#each [row.min, row.max] as cap}<span
              aria-hidden="true"
              class="mg2-distribution-cap"
              style={`left:${x(cap) - (highlighted ? 0.5 : 0)}px`}
            ></span>{/each}
          <span
            aria-hidden="true"
            class="mg2-distribution-box"
            style={`left:${x(row.q1)}px;width:${Math.max(0, x(row.q3) - x(row.q1))}px`}
          ></span>
          <span
            aria-hidden="true"
            class="mg2-distribution-median"
            style={`left:${x(row.median) - 1}px`}
          ></span>
          {#each (row.outliers ?? []).filter(Number.isFinite) as outlier}<span
              class="mg2-distribution-outlier"
              style={`left:${x(outlier) - 3}px`}
              ><Glyph
                name={highlighted
                  ? 'distribution-outlier-accent'
                  : 'distribution-outlier-neutral'}
              /></span
            >{/each}
        {/if}
      </button>
    {/each}
  </div>
</ChartFrame>
