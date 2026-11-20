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
    header,
    rowContent,
    rowKey,
    class: className = '',
  }: {
    caption: string;
    columns: { key: string; label: string; sortable?: boolean }[];
    rows: Row[];
    sortBy?: string | null;
    sortDirection?: 'ascending' | 'descending';
    cell?: Snippet<[Row, string]>;
    header?: Snippet<
      [
        { key: string; label: string; sortable?: boolean },
        'ascending' | 'descending' | undefined,
        () => void,
      ]
    >;
    rowContent?: Snippet<[Row]>;
    rowKey?: (row: Row, index: number) => string | number;
    class?: string;
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
<div
  class={`mg-table-scroll ${className}`}
  role="region"
  aria-label={caption}
  tabindex="0"
>
  <table class="mg-table">
    <caption>{caption}</caption>
    <thead
      ><tr
        >{#each columns as column}{#if header}{@render header(
              column,
              sortBy === column.key ? sortDirection : undefined,
              () => sort(column.key),
            )}{:else}<th
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
            </th>{/if}{/each}</tr
      ></thead
    >
    <tbody
      >{#each sorted as row, index (rowKey ? rowKey(row, index) : index)}{#if rowContent}{@render rowContent(
            row,
          )}{:else}<tr
            >{#each columns as column}<td
                >{#if cell}{@render cell(row, column.key)}{:else}{row[
                    column.key
                  ] ?? ''}{/if}</td
              >{/each}</tr
          >{/if}{:else}<tr><td colspan={columns.length}>No results</td></tr
        >{/each}</tbody
    >
  </table>
</div>
