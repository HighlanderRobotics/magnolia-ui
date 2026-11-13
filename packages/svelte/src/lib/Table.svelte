<script lang="ts">
  import type { Snippet } from 'svelte';
  type Row = Record<string, string | number | null>;
  let {
    caption,
    columns,
    rows,
    sortBy = $bindable<string | null>(null),
    sortDirection = $bindable<'ascending' | 'descending'>('ascending'),
    cell,
  }: {
    caption: string;
    columns: { key: string; label: string; sortable?: boolean }[];
    rows: Row[];
    sortBy?: string | null;
    sortDirection?: 'ascending' | 'descending';
    cell?: Snippet<[Row, string]>;
  } = $props();
  let sorted = $derived.by(() => {
    if (!sortBy || !columns.some((c) => c.key === sortBy && c.sortable))
      return rows;
    const key = sortBy;
    const collator = new Intl.Collator(undefined, { numeric: true });
    return [...rows].sort(
      (a, b) =>
        collator.compare(String(a[key] ?? ''), String(b[key] ?? '')) *
        (sortDirection === 'ascending' ? 1 : -1),
    );
  });
  function sort(key: string) {
    sortDirection =
      sortBy === key && sortDirection === 'ascending'
        ? 'descending'
        : 'ascending';
    sortBy = key;
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (the named scroll region needs keyboard scrolling) -->
<div class="mg-table-scroll" role="region" aria-label={caption} tabindex="0">
  <table class="mg-table">
    <caption>{caption}</caption>
    <thead
      ><tr
        >{#each columns as column}<th
            scope="col"
            aria-sort={sortBy === column.key ? sortDirection : undefined}
          >
            {#if column.sortable}<button
                type="button"
                onclick={() => sort(column.key)}
                >{column.label}<span aria-hidden="true"
                  >{sortBy === column.key
                    ? sortDirection === 'ascending'
                      ? ' ↑'
                      : ' ↓'
                    : ' ↕'}</span
                ></button
              >{:else}{column.label}{/if}
          </th>{/each}</tr
      ></thead
    >
    <tbody
      >{#each sorted as row}<tr
          >{#each columns as column}<td
              >{#if cell}{@render cell(row, column.key)}{:else}{row[
                  column.key
                ] ?? ''}{/if}</td
            >{/each}</tr
        >{:else}<tr><td colspan={columns.length}>No results</td></tr
        >{/each}</tbody
    >
  </table>
</div>
