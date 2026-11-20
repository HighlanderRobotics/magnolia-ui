<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  let {
    label,
    icon,
    count,
    selected = false,
    disabled = false,
    rail = false,
    href,
    onclick,
    ...rest
  }: HTMLAnchorAttributes & {
    label: string;
    icon?: Snippet;
    count?: string | number;
    selected?: boolean;
    disabled?: boolean;
    rail?: boolean;
  } = $props();
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  {...rest}
  type={href ? undefined : 'button'}
  href={disabled ? undefined : href}
  role={href && disabled ? 'link' : undefined}
  disabled={!href && disabled ? true : undefined}
  aria-disabled={disabled || undefined}
  aria-current={selected ? 'page' : undefined}
  tabindex={disabled ? -1 : rest.tabindex}
  class={`mg2-destination ${rest.class ?? ''}`}
  data-rail={rail}
  data-selected={selected}
  onclick={(event: MouseEvent & { currentTarget: HTMLAnchorElement }) => {
    if (disabled) event.preventDefault();
    else onclick?.(event);
  }}
>
  <span class="mg2-destination-icon"
    >{#if icon}{@render icon()}{:else}<Glyph
        name={rail && selected ? 'rail-house-selected' : 'nav-house'}
      />{/if}</span
  >
  <span class="mg2-destination-label">{label}</span>
  {#if count !== undefined && !rail}<span class="mg2-destination-count"
      >{count}</span
    >{/if}
</svelte:element>
