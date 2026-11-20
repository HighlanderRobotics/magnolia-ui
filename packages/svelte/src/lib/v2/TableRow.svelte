<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import Checkbox from './Checkbox.svelte';
  let {
    children,
    selected = $bindable(false),
    selectable = false,
    label = 'Select row',
    onselectionchange,
    ...rest
  }: HTMLAttributes<HTMLTableRowElement> & {
    children: Snippet;
    selected?: boolean;
    selectable?: boolean;
    label?: string;
    onselectionchange?: (selected: boolean) => void;
  } = $props();
</script>

<tr
  {...rest}
  class={`mg2-table-row ${rest.class ?? ''}`}
  data-selected={selected}
>
  {#if selectable}<td class="mg2-table-cell mg2-table-select"
      ><Checkbox
        {label}
        checked={selected}
        onchange={(e) => {
          selected = (e.currentTarget as HTMLInputElement).checked;
          onselectionchange?.(selected);
        }}
      /></td
    >{/if}
  {@render children()}
</tr>
