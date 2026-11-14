<script lang="ts">
  import type { Snippet } from 'svelte';
  import Glyph from './Glyph.svelte';
  let {
    title = 'Nothing here yet',
    body = 'Items you create or are assigned to will show up here.',
    icon,
    action,
  }: {
    title?: string;
    body?: string;
    icon?: Snippet;
    action?: Snippet;
  } = $props();
</script>

<div class="mg2-empty-state">
  <span class="mg2-empty-disc"
    >{#if icon}{@render icon()}{:else}<Glyph name="inbox" />{/if}</span
  >
  <h3>{title}</h3>
  <p>{body}</p>
  {#if action}<div>{@render action()}</div>{/if}
</div>
