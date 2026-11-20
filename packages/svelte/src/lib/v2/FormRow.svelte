<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

<div class="mg2-form-row">{@render children?.()}</div>
