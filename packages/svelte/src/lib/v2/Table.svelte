<script lang="ts">
  import type { Snippet } from 'svelte';
  import Base from '../Table.svelte';
  import TableHeaderCell from './TableHeaderCell.svelte';
  import TableCell from './TableCell.svelte';
  import TableRow from './TableRow.svelte';
  type Row = Record<string, string | number | null>;
  let {
    caption,
    columns,
    rows,
    sortBy = $bindable<string | null>(null),
    sortDirection = $bindable<'ascending' | 'descending'>('ascending'),
    cell,
    rowContent: renderRow,
    rowKey = (row, index) => row.id ?? index,
  }: {
    caption: string;
    columns: {
      key: string;
      label: string;
      sortable?: boolean;
      align?: 'start' | 'end';
      secondary?: boolean;
    }[];
    rows: Row[];
    sortBy?: string | null;
    sortDirection?: 'ascending' | 'descending';
    cell?: Snippet<[Row, string]>;
    rowContent?: Snippet<[Row]>;
    rowKey?: (row: Row, index: number) => string | number;
  } = $props();
</script>

<Base
  {caption}
  {columns}
  {rows}
  {rowKey}
  bind:sortBy
  bind:sortDirection
  class="mg2-table-root"
>
  {#snippet header(column, sort, go)}<TableHeaderCell
      label={column.label}
      {sort}
      onsort={column.sortable ? go : undefined}
      align={columns.find((c) => c.key === column.key)?.align}
    />{/snippet}
  {#snippet rowContent(row)}{#if renderRow}{@render renderRow(
        row,
      )}{:else}<TableRow
        >{#each columns as column}<TableCell
            variant={column.align === 'end'
              ? 'numeric'
              : column.secondary
                ? 'secondary'
                : 'text'}
            >{#if cell}{@render cell(row, column.key)}{:else}{row[column.key] ??
                ''}{/if}</TableCell
          >{/each}</TableRow
      >{/if}{/snippet}
</Base>
