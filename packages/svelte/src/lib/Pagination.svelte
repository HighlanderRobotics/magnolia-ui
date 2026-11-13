<script lang="ts">
  import Button from './Button.svelte';
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
  let total = $derived(
    Number.isFinite(totalPages) ? Math.max(1, Math.floor(totalPages)) : 1,
  );
  let current = $derived(
    Number.isFinite(page) ? Math.min(total, Math.max(1, Math.floor(page))) : 1,
  );
  let pages = $derived(
    [...new Set([1, current - 1, current, current + 1, total])]
      .filter((p) => p >= 1 && p <= total)
      .sort((a, b) => a - b),
  );
</script>

<nav aria-label={label} class="mg-pagination">
  <Button
    variant="secondary"
    disabled={disabled || current === 1}
    onclick={() => (page = current - 1)}>Previous</Button
  >
  {#each pages as number, i}
    {#if i && number - pages[i - 1] > 1}<span aria-hidden="true">…</span>{/if}
    <Button
      variant={number === current ? 'primary' : 'secondary'}
      aria-label={`Page ${number}`}
      aria-current={number === current ? 'page' : undefined}
      {disabled}
      onclick={() => (page = number)}>{number}</Button
    >
  {/each}
  <Button
    variant="secondary"
    disabled={disabled || current === total}
    onclick={() => (page = current + 1)}>Next</Button
  >
  <span class="mg-page-status" role="status">Page {current} of {total}</span>
</nav>
