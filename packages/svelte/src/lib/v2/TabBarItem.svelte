<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  let {
    label,
    icon,
    badge,
    selected = false,
    disabled = false,
    href,
    onclick,
    ...rest
  }: HTMLAnchorAttributes & {
    label: string;
    icon?: Snippet<[boolean]>;
    badge?: string | number;
    selected?: boolean;
    disabled?: boolean;
  } = $props();
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  {...rest}
  href={disabled ? undefined : href}
  type={href ? undefined : 'button'}
  role={href && disabled ? 'link' : undefined}
  disabled={!href && disabled ? true : undefined}
  aria-disabled={disabled || undefined}
  aria-current={selected ? 'page' : undefined}
  tabindex={disabled ? -1 : rest.tabindex}
  class={`mg2-tab-bar-item ${rest.class ?? ''}`}
  data-selected={selected}
  onclick={(e: MouseEvent & { currentTarget: HTMLAnchorElement }) => {
    if (disabled) e.preventDefault();
    else onclick?.(e);
  }}
>
  <span class="mg2-tab-bar-icon"
    >{#if icon}{@render icon(selected)}{:else}<Glyph
        name={selected ? 'tab-house-selected' : 'tab-house'}
      />{/if}</span
  >
  <span class="mg2-tab-bar-label">{label}</span>
  {#if badge !== undefined}<span class="mg2-tab-bar-badge"
      ><span class="mg2-sr-only">, </span>{badge}<span class="mg2-sr-only">
        unread</span
      ></span
    >{/if}
</svelte:element>
