<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    children,
    logo,
    brand = 'A',
    brandLabel = 'Application',
    label = 'Primary navigation',
    height = 600,
  }: {
    children?: Snippet;
    logo?: Snippet;
    brand?: string;
    brandLabel?: string;
    label?: string;
    height?: number;
  } = $props();
</script>

<nav
  class="mg2-nav-rail"
  aria-label={label}
  style={`height:${Number.isFinite(height) ? Math.max(1, height) : 600}px`}
>
  {#if logo}{@render logo()}{:else}<span
      class="mg2-nav-rail-brand"
      role="img"
      aria-label={brandLabel}>{brand}</span
    >{/if}
  <span class="mg2-nav-rail-spacer" aria-hidden="true"></span>
  {@render children?.()}
</nav>
