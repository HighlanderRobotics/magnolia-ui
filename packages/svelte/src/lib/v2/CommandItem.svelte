<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';
  import Glyph from './Glyph.svelte';
  import Kbd from './Kbd.svelte';
  let {
    label,
    meta,
    shortcut = [],
    active = false,
    icon,
    disabled = false,
    class: className = '',
    ...rest
  }: Omit<HTMLButtonAttributes, 'children'> & {
    label: string;
    meta?: string;
    shortcut?: readonly string[];
    active?: boolean;
    icon?: Snippet;
  } = $props();
</script>

<button
  type="button"
  {...rest}
  {disabled}
  class="mg2-command-item {className}"
  data-active={active}
>
  <span class="mg2-command-icon"
    >{#if icon}{@render icon()}{:else}<Glyph name="command-file" />{/if}</span
  >
  <span class="mg2-command-label">{label}</span>
  {#if meta}<span class="mg2-command-meta">{meta}</span>{/if}
  {#if shortcut.length}<span class="mg2-command-shortcut" aria-hidden="true"
      >{#each shortcut as key}<Kbd {key} />{/each}</span
    >{/if}
</button>
