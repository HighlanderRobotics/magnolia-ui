<script lang="ts">
  import { progressValue } from '@highlanderrobotics/magnolia-tokens/v2';
  import Glyph from './Glyph.svelte';
  let {
    value,
    label,
    size = 'small',
    tone = 'neutral',
  }: {
    value?: number;
    label: string;
    size?: 'small' | 'large';
    tone?: 'neutral' | 'accent';
  } = $props();
  let amount = $derived(progressValue(value));
  let width = $derived(size === 'large' ? 96 : 24),
    stroke = $derived(size === 'large' ? 8 : 3),
    radius = $derived((width - stroke) / 2);
</script>

<span
  class="mg2-progress-ring"
  role="progressbar"
  aria-label={label}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow={amount}
  data-tone={tone}
  data-indeterminate={amount === undefined}
  style={`width:${width}px;height:${width}px`}
>
  <Glyph name={size === 'large' ? 'ring-fill-large' : 'ring-fill-small'} />
  {#if amount === undefined || amount > 0}<svg
      aria-hidden="true"
      {width}
      height={width}
      viewBox={`0 0 ${width} ${width}`}
      ><circle
        cx={width / 2}
        cy={width / 2}
        r={radius}
        pathLength="100"
        fill="none"
        stroke="currentColor"
        stroke-width={stroke}
        stroke-linecap="round"
        stroke-dasharray={`${amount ?? 25} 100`}
        transform={`rotate(-90 ${width / 2} ${width / 2})`}
      /></svg
    >{/if}
  {#if size === 'large'}<span aria-hidden="true" class="mg2-progress-ring-value"
      >{amount === undefined ? '—' : `${Math.round(amount)}%`}</span
    >{/if}
</span>
