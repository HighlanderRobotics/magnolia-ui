<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

<div class="mg-menu-item" role="presentation">{@render children?.()}</div>
