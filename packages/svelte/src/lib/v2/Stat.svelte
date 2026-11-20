<script lang="ts">
  let {
    label,
    value,
    unit,
    size = 'large',
    emphasis = false,
    loading = false,
  }: {
    label: string;
    value?: string | number | null;
    unit?: string;
    size?: 'large' | 'medium';
    emphasis?: boolean;
    loading?: boolean;
  } = $props();
</script>

<dl
  class="mg2-stat"
  data-size={size}
  data-emphasis={emphasis}
  aria-busy={loading}
>
  <dt class="mg2-stat-label">{label}</dt>
  <dd class="mg2-stat-value">
    {#if loading}<span class="mg2-skeleton" aria-hidden="true"></span><span
        class="mg2-sr-only">Loading</span
      >
    {:else if value == null}<span aria-hidden="true">—</span><span
        class="mg2-sr-only">No data</span
      >
    {:else}{value}{#if unit}<span class="mg2-stat-unit">{unit}</span>{/if}{/if}
  </dd>
</dl>
