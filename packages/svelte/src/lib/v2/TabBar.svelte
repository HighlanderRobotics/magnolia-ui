<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  let {
    children,
    label = 'Main',
    bottomInset = 32,
    ...rest
  }: HTMLAttributes<HTMLElement> & {
    children: Snippet;
    label?: string;
    bottomInset?: number;
  } = $props();
</script>

<nav
  {...rest}
  aria-label={label}
  class={`mg2-tab-bar ${rest.class ?? ''}`}
  style={`--mg2-bottom-inset:${Math.max(0, Number.isFinite(bottomInset) ? bottomInset : 32)}px;${rest.style ?? ''}`}
>
  {@render children()}
</nav>
