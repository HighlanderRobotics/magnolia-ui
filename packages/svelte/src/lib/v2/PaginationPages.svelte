<script lang="ts">
  import Base from '../Pagination.svelte';
  import IconButton from './IconButton.svelte';
  import Glyph from './Glyph.svelte';
  let {
    page = $bindable(1),
    totalPages,
    label = 'Pagination',
    disabled = false,
  }: {
    page?: number;
    totalPages: number;
    label?: string;
    disabled?: boolean;
  } = $props();
</script>

<Base
  bind:page
  {totalPages}
  {label}
  {disabled}
  class="mg2-pagination-pages"
  showStatus={false}
>
  {#snippet previous(unavailable, go)}<IconButton
      label="Previous page"
      variant="tertiary"
      disabled={unavailable}
      onclick={go}
      >{#snippet icon()}<Glyph name="page-prev" />{/snippet}</IconButton
    >{/snippet}
  {#snippet next(unavailable, go)}<IconButton
      label="Next page"
      variant="tertiary"
      disabled={unavailable}
      onclick={go}
      >{#snippet icon()}<Glyph name="page-next" />{/snippet}</IconButton
    >{/snippet}
  {#snippet pageButton(number, current, go)}<button
      class="mg2-page"
      type="button"
      {disabled}
      aria-label={`Page ${number}`}
      aria-current={current ? 'page' : undefined}
      onclick={go}>{number}</button
    >{/snippet}
</Base>
