<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  let {
    children,
    variant = 'inline',
    external = false,
    disabled = false,
    href,
    onclick,
    ...rest
  }: HTMLAnchorAttributes & {
    children: Snippet;
    variant?: 'inline' | 'quiet';
    external?: boolean;
    disabled?: boolean;
  } = $props();
</script>

<a
  {...rest}
  href={disabled ? undefined : href}
  role={disabled ? 'link' : undefined}
  aria-disabled={disabled || undefined}
  tabindex={disabled ? -1 : rest.tabindex}
  target={external ? '_blank' : rest.target}
  rel={external ? 'noopener noreferrer' : rest.rel}
  class={`mg2-link ${rest.class ?? ''}`}
  data-variant={variant}
  onclick={(event) => {
    if (disabled) event.preventDefault();
    else onclick?.(event);
  }}
  >{@render children()}{#if external && variant === 'inline'}<Glyph
      name="external"
    /><span class="mg2-sr-only"> (opens in a new tab)</span>{/if}</a
>
