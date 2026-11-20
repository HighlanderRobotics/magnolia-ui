<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    title,
    description,
    action,
  }: { title?: string; description?: string; action?: Snippet } = $props();
</script>

<div class="mg2-card-header">
  <div>
    {#if title}<h3>{title}</h3>{/if}{#if description}<p>{description}</p>{/if}
  </div>
  {#if action}<div>{@render action()}</div>{/if}
</div>
