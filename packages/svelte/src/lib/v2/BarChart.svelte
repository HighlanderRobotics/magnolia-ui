<script lang="ts">
  import {
    chartDomain,
    chartTicks,
    chartIndex,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import type {
    ChartDatum,
    ChartDomain,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import ChartFrame from './ChartFrame.svelte';
  let {
    data,
    label,
    domain,
    highlightIndex = $bindable<number | undefined>(),
    onhighlightchange,
    formatValue = String,
  }: {
    data: ChartDatum[];
    label: string;
    domain?: ChartDomain;
    highlightIndex?: number;
    onhighlightchange?: (index: number) => void;
    formatValue?: (value: number) => string;
  } = $props();
  let values = $derived(data.map((d) => d.value)),
    bounds = $derived(chartDomain(values, domain)),
    ticks = $derived(chartTicks(bounds)),
    selected = $derived(chartIndex(values, highlightIndex)),
    slots = $state<(HTMLButtonElement | null)[]>([]);
  let width = $derived(Math.max(560, 48 + data.length * 64));
  let plotWidth = $derived(width - 48),
    slotWidth = $derived(plotWidth / Math.max(1, data.length));
  const y = (value: number) =>
    192 - ((value - bounds[0]) / (bounds[1] - bounds[0])) * 184;
  const renderY = (value: number) =>
    y(Math.max(bounds[0], Math.min(bounds[1], value)));
  const baseline = () => Math.max(bounds[0], Math.min(bounds[1], 0));
  function choose(index: number, focus = false) {
    highlightIndex = index;
    onhighlightchange?.(index);
    if (focus) slots[index]?.focus();
  }
  function key(event: KeyboardEvent, index: number) {
    const enabled = values.flatMap((v, i) =>
      v !== null && Number.isFinite(v) ? [i] : [],
    );
    const current = enabled.indexOf(index);
    const next =
      event.key === 'Home'
        ? enabled[0]
        : event.key === 'End'
          ? enabled.at(-1)
          : event.key === 'ArrowRight'
            ? enabled[Math.min(enabled.length - 1, current + 1)]
            : event.key === 'ArrowLeft'
              ? enabled[Math.max(0, current - 1)]
              : undefined;
    if (next !== undefined) {
      event.preventDefault();
      choose(next, true);
    }
  }
</script>

<ChartFrame
  {label}
  columns={['Period', 'Value']}
  rows={data.map((d) => [
    d.label,
    d.value !== null && Number.isFinite(d.value) ? formatValue(d.value) : null,
  ])}
>
  <div class="mg2-bar-chart" style={`width:${width}px`}>
    {#if selected < 0}<span class="mg2-chart-empty">No data</span>{:else}
      <div aria-hidden="true">
        {#each ticks as value}<span
            class="mg2-chart-grid"
            style={`left:40px;top:${y(value)}px;width:${plotWidth}px`}
          ></span><span
            class="mg2-chart-axis mg2-chart-y"
            style={`top:${y(value) - 8}px`}>{formatValue(value)}</span
          >{/each}
      </div>
      {#each data as datum, i}{@const value = datum.value}{@const valid =
          value !== null && Number.isFinite(value)}
        <button
          type="button"
          class="mg2-bar-slot"
          bind:this={slots[i]}
          style={`left:${40 + i * slotWidth}px;width:${slotWidth}px`}
          aria-label={`${datum.label}: ${valid ? formatValue(value!) : 'No data'}`}
          aria-pressed={i === selected}
          disabled={!valid}
          tabindex={i === selected ? 0 : -1}
          onclick={() => choose(i)}
          onkeydown={(e) => key(e, i)}
        >
          {#if valid}<span
              aria-hidden="true"
              class="mg2-bar"
              data-highlight={i === selected}
              style={`top:${Math.min(renderY(value!), y(baseline())) - 8}px;height:${Math.abs(y(baseline()) - renderY(value!))}px`}
            ></span>{#if i === selected}<span
                aria-hidden="true"
                class="mg2-bar-value"
                data-outside={value! < bounds[0] || value! > bounds[1]}
                style={`top:${Math.max(-8, Math.min(164, renderY(value!) - 28))}px`}
                >{formatValue(value!)}</span
              >{/if}{/if}
          <span aria-hidden="true" class="mg2-chart-axis mg2-bar-label"
            >{datum.label}</span
          >
        </button>
      {/each}
    {/if}
  </div>
</ChartFrame>
