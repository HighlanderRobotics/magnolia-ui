<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    open = $bindable(false),
    title,
    name,
    children,
  }: {
    open?: boolean;
    title: string;
    name?: string;
    children?: Snippet;
  } = $props();
</script>

<details bind:open {name} class="mg-accordion">
  <summary>{title}</summary>
  <div class="mg-accordion-content">{@render children?.()}</div>
</details>
