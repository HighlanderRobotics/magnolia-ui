<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { ChartSeries } from '@highlanderrobotics/magnolia-tokens/v2';
  import ChartSwatch from './ChartSwatch.svelte';
  let {
    label,
    series = 1,
    ...rest
  }: HTMLAttributes<HTMLSpanElement> & {
    label: string;
    series?: ChartSeries;
  } = $props();
</script>

<span {...rest} class={`mg2-legend-item ${rest.class ?? ''}`}
  ><ChartSwatch {series} />{label}</span
>
