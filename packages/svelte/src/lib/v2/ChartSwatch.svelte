<script lang="ts">
  import type { ChartSeries } from '@highlanderrobotics/magnolia-tokens/v2';
  let { series = 1 }: { series?: ChartSeries } = $props();
</script>

<span class="mg2-chart-swatch" data-series={series} aria-hidden="true"></span>
