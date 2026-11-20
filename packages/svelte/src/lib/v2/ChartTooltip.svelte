<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { ChartSeries } from '@highlanderrobotics/magnolia-tokens/v2';
  import ChartSwatch from './ChartSwatch.svelte';
  let {
    title,
    items,
    ...rest
  }: Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
    title: string;
    items: { label: string; value: string | number; series: ChartSeries }[];
  } = $props();
</script>

<div {...rest} role="tooltip" class={`mg2-chart-tooltip ${rest.class ?? ''}`}>
  <span class="mg2-chart-tooltip-title">{title}</span>
  <dl>
    {#each items as item}<div>
        <dt><ChartSwatch series={item.series} /><span>{item.label}</span></dt>
        <dd>{item.value}</dd>
      </div>{/each}
  </dl>
</div>
