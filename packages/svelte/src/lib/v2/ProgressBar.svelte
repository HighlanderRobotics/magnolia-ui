<script lang="ts">
  import { progressValue } from '@highlanderrobotics/magnolia-tokens/v2';
  let {
    value,
    label,
    tone = 'neutral',
  }: { value?: number; label: string; tone?: 'neutral' | 'accent' } = $props();
  let amount = $derived(progressValue(value));
</script>

<div
  class="mg2-progress"
  role="progressbar"
  aria-label={label}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow={amount}
  data-tone={tone}
  data-indeterminate={amount === undefined}
>
  <span style={`width:${amount ?? 30}%`}></span>
</div>
