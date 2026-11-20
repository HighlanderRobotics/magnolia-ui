<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  let {
    title,
    description,
    meta,
    leading,
    chevron = true,
    unread = false,
    selected = false,
    class: className = '',
    ...rest
  }: HTMLButtonAttributes & {
    title: string;
    description?: string;
    meta?: string;
    leading?: Snippet;
    chevron?: boolean;
    unread?: boolean;
    selected?: boolean;
  } = $props();
</script>

<button
  {...rest}
  type="button"
  class="mg2-list-item {className}"
  aria-pressed={selected}
  data-unread={unread}
>
  {#if leading}<span class="mg2-list-leading">{@render leading()}</span>{/if}
  <span class="mg2-list-text"
    ><span class="mg2-list-title-row"
      >{#if unread}<span class="mg2-list-unread"><Glyph name="unread" /></span
        ><span class="mg2-sr-only">Unread: </span>{/if}<span
        class="mg2-list-title">{title}</span
      ></span
    >{#if description}<span class="mg2-list-description">{description}</span
      >{/if}</span
  >
  {#if meta}<span class="mg2-list-meta">{meta}</span>{/if}{#if chevron}<span
      class="mg2-list-chevron"><Glyph name="chevron-right" /></span
    >{/if}
</button>
