<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';
  let {
    page = $bindable(1),
    totalPages,
    label = 'Pagination',
    disabled = false,
    class: className = '',
    previous,
    next,
    pageButton,
    leading,
    showPages = true,
    showStatus = true,
  }: {
    page?: number;
    totalPages: number;
    label?: string;
    disabled?: boolean;
    class?: string;
    previous?: Snippet<[boolean, () => void]>;
    next?: Snippet<[boolean, () => void]>;
    pageButton?: Snippet<[number, boolean, () => void]>;
    leading?: Snippet<[number, number]>;
    showPages?: boolean;
    showStatus?: boolean;
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

<nav aria-label={label} class={`mg-pagination ${className}`}>
  {#if leading}{@render leading(current, total)}{/if}
  {#if previous}{@render previous(
      disabled || current === 1,
      () => (page = current - 1),
    )}{:else}
    <Button
      variant="secondary"
      disabled={disabled || current === 1}
      onclick={() => (page = current - 1)}>Previous</Button
    >
  {/if}
  {#if showPages}{#each pages as number, i}
      {#if i && number - pages[i - 1] > 1}<span aria-hidden="true">…</span>{/if}
      {#if pageButton}{@render pageButton(
          number,
          number === current,
          () => (page = number),
        )}{:else}<Button
          variant={number === current ? 'primary' : 'secondary'}
          aria-label={`Page ${number}`}
          aria-current={number === current ? 'page' : undefined}
          {disabled}
          onclick={() => (page = number)}>{number}</Button
        >
      {/if}
    {/each}{/if}
  {#if next}{@render next(
      disabled || current === total,
      () => (page = current + 1),
    )}{:else}
    <Button
      variant="secondary"
      disabled={disabled || current === total}
      onclick={() => (page = current + 1)}>Next</Button
    >
  {/if}
  {#if showStatus}<span class="mg-page-status" role="status"
      >Page {current} of {total}</span
    >{/if}
</nav>
