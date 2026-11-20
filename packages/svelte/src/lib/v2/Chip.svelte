<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  let {
    selected = $bindable(false),
    label,
    onclick,
    class: className = '',
    ...rest
  }: HTMLButtonAttributes & { selected?: boolean; label: string } = $props();
</script>

<button
  {...rest}
  type="button"
  class="mg2-chip {className}"
  aria-pressed={selected}
  onclick={(event) => {
    onclick?.(event);
    if (!event.defaultPrevented) selected = !selected;
  }}
>
  {#if selected}<Glyph name="chip-check" />{/if}{label}
</button>
