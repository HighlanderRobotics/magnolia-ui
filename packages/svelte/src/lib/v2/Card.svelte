<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import CardHeader from './CardHeader.svelte';
  let {
    title,
    description,
    action,
    children,
    class: className = '',
    ...rest
  }: HTMLAttributes<HTMLElement> & {
    title?: string;
    description?: string;
    action?: Snippet;
    children?: Snippet;
  } = $props();
</script>

<section {...rest} class="mg2-card {className}">
  {#if title || action}<CardHeader {title} {description} {action} />{/if}
  {@render children?.()}
</section>
