<script lang="ts">
  import type { HTMLThAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  let {
    label,
    sort,
    onsort,
    align = 'start',
    ...rest
  }: Omit<HTMLThAttributes, 'align'> & {
    label: string;
    sort?: 'ascending' | 'descending';
    onsort?: () => void;
    align?: 'start' | 'end';
  } = $props();
</script>

<th
  {...rest}
  scope={rest.scope ?? 'col'}
  aria-sort={sort}
  class={`mg2-table-header ${rest.class ?? ''}`}
  data-align={align}
  data-sorted={!!sort}
>
  {#if onsort}<button type="button" onclick={onsort}
      ><span>{label}</span><Glyph
        class="mg2-table-sort"
        name={sort ? `table-${sort}` : 'table-sort'}
      /></button
    >{:else}<span>{label}</span>{/if}
</th>
