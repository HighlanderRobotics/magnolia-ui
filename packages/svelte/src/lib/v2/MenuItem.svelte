<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { MENU, type MenuContext } from '../menu-context.js';
  import Button from './Button.svelte';
  import Glyph from './Glyph.svelte';
  import Kbd from './Kbd.svelte';
  let {
    label,
    icon: iconContent,
    shortcut,
    modifier = false,
    checked,
    tone = 'default',
    disabled = false,
    onclick,
    onpointerenter,
    ...rest
  }: Omit<HTMLButtonAttributes, 'children' | 'aria-checked'> & {
    label: string;
    icon?: Snippet;
    shortcut?: string;
    modifier?: boolean;
    checked?: boolean;
    tone?: 'default' | 'destructive';
  } = $props();
  const menu = getContext<MenuContext | undefined>(MENU);
</script>

<Button
  {...rest}
  variant="tertiary"
  class={`mg2-menu-item ${rest.class ?? ''}`}
  role={rest.role ?? (checked === undefined ? 'menuitem' : 'menuitemradio')}
  aria-label={label}
  aria-checked={checked}
  tabindex={rest.tabindex ?? -1}
  {disabled}
  data-tone={tone}
  onpointerenter={(event) => {
    onpointerenter?.(event);
    if (!event.defaultPrevented && !disabled && event.pointerType !== 'touch')
      event.currentTarget.focus({ preventScroll: true });
  }}
  onclick={(event) => {
    onclick?.(event);
    if (!event.defaultPrevented) menu?.close();
  }}
>
  {#snippet icon()}{#if iconContent}{@render iconContent()}{:else}<Glyph
        name="menu-pencil"
      />{/if}{/snippet}
  <span class="mg2-menu-label">{label}</span>
  {#if checked}<Glyph name="menu-check" />{/if}
  {#if shortcut}<Kbd key={shortcut} {modifier} disabled={!!disabled} />{/if}
</Button>
