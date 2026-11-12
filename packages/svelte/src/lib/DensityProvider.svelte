<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    density = 'comfortable',
    children,
  }: { density?: 'comfortable' | 'spacious' | 'compact'; children?: Snippet } =
    $props();
</script>

<div data-density={density === 'spacious' ? 'comfortable' : density}>
  {@render children?.()}
</div>
