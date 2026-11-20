<script lang="ts">
  import type { Snippet } from 'svelte';
  import BaseAccordion from '../Accordion.svelte';
  import Glyph from './Glyph.svelte';
  let {
    open = $bindable(false),
    title,
    name,
    disabled = false,
    children,
  }: {
    open?: boolean;
    title: string;
    name?: string;
    disabled?: boolean;
    children?: Snippet;
  } = $props();
</script>

<BaseAccordion bind:open {title} {name} {disabled} class="mg2-accordion">
  {#snippet icon()}<Glyph
      name={open ? 'accordion-up' : 'accordion-down'}
    />{/snippet}
  {@render children?.()}
</BaseAccordion>
