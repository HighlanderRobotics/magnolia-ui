<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  let {
    items,
    label = 'Breadcrumb',
    ...rest
  }: HTMLAttributes<HTMLElement> & {
    items: {
      label: string;
      href?: string;
      onclick?: (event: MouseEvent) => void;
    }[];
    label?: string;
  } = $props();
</script>

<nav {...rest} class={`mg2-breadcrumb ${rest.class ?? ''}`} aria-label={label}>
  <ol>
    {#each items as item, i}
      <li>
        {#if i > 0}<Glyph name="breadcrumb-separator" />{/if}
        {#if i === items.length - 1}
          <span aria-current="page">{item.label}</span>
        {:else if item.href}
          <a href={item.href} onclick={item.onclick}>{item.label}</a>
        {:else if item.onclick}
          <button type="button" onclick={item.onclick}>{item.label}</button>
        {:else}
          <span>{item.label}</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
