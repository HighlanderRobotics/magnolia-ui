<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  let {
    day,
    label,
    selected = false,
    today = false,
    outside = false,
    inRange = false,
    edge = 'single',
    ...rest
  }: HTMLButtonAttributes & {
    day: number | string;
    label: string;
    selected?: boolean;
    today?: boolean;
    outside?: boolean;
    inRange?: boolean;
    edge?: 'single' | 'start' | 'end' | 'middle';
  } = $props();
</script>

<button
  {...rest}
  type="button"
  class="mg2-day"
  aria-label={label}
  aria-pressed={selected}
  aria-current={today ? 'date' : undefined}
  data-today={today}
  data-outside={outside}
  data-range={inRange}
  data-edge={edge}
  >{day}{#if today}<Glyph name="today-dot" />{/if}</button
>
