<script lang="ts">
  import { paginationRange } from '@highlanderrobotics/magnolia-tokens/v2';
  import Base from '../Pagination.svelte';
  import IconButton from './IconButton.svelte';
  import Glyph from './Glyph.svelte';
  let {
    page = $bindable(1),
    pageSize = $bindable(25),
    total,
    pageSizes = [10, 25, 50, 100],
    disabled = false,
    label = 'Table pagination',
  }: {
    page?: number;
    pageSize?: number;
    total: number;
    pageSizes?: number[];
    disabled?: boolean;
    label?: string;
  } = $props();
  let range = $derived(paginationRange(page, total, pageSize));
  let sizes = $derived(
    [...new Set([...pageSizes, range.pageSize])]
      .filter((n) => Number.isInteger(n) && n > 0)
      .sort((a, b) => a - b),
  );
</script>

<Base
  bind:page
  totalPages={range.totalPages}
  {label}
  {disabled}
  class="mg2-pagination"
  showPages={false}
  showStatus={false}
>
  {#snippet leading()}<span role="status" class="mg2-page-range"
      >{range.start}–{range.end} of {range.total}</span
    ><label class="mg2-page-size"
      >Rows <span
        ><select
          aria-label="Rows per page"
          {disabled}
          value={range.pageSize}
          onchange={(e) => {
            pageSize = Number(e.currentTarget.value);
            page = 1;
          }}
          >{#each sizes as size}<option value={size}>{size}</option
            >{/each}</select
        ><Glyph name="page-down" /></span
      ></label
    >{/snippet}
  {#snippet previous(unavailable, go)}<IconButton
      label="Previous page"
      variant="tertiary"
      disabled={unavailable}
      onclick={go}
      >{#snippet icon()}<Glyph
          name={unavailable ? 'page-prev-disabled' : 'page-prev'}
        />{/snippet}</IconButton
    >{/snippet}
  {#snippet next(unavailable, go)}<IconButton
      label="Next page"
      variant="tertiary"
      disabled={unavailable}
      onclick={go}
      >{#snippet icon()}<Glyph name="page-next" />{/snippet}</IconButton
    >{/snippet}
</Base>
