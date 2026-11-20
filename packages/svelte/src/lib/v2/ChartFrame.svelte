<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    label,
    children,
    columns,
    rows,
  }: {
    label: string;
    children: Snippet;
    columns: string[];
    rows: (string | number | null)[][];
  } = $props();
</script>

<div class="mg2-chart-frame">
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (named chart region supports horizontal keyboard scrolling) -->
  <div class="mg2-chart-scroll" role="region" aria-label={label} tabindex="0">
    {@render children()}
  </div>
  <details class="mg2-chart-data">
    <summary>View {label} data</summary>
    <table>
      <caption>{label}</caption><thead
        ><tr
          >{#each columns as column}<th scope="col">{column}</th>{/each}</tr
        ></thead
      ><tbody
        >{#each rows as row}<tr
            >{#each row as value}<td>{value === null ? '—' : value}</td
              >{/each}</tr
          >{/each}</tbody
      >
    </table>
  </details>
</div>
