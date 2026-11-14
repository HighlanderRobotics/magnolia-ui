<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import Button from './Button.svelte';
  import Glyph from './Glyph.svelte';
  let {
    label,
    icon,
    ...rest
  }: Omit<ComponentProps<typeof Button>, 'children' | 'icon'> & {
    label: string;
    icon?: Snippet;
  } = $props();
</script>

<Button
  {...rest}
  aria-label={label}
  class={`mg2-icon-button ${rest.class ?? ''}`}
>
  {#snippet children()}{#if icon}<span aria-hidden="true">{@render icon()}</span
      >{:else}<Glyph name="ellipsis" />{/if}{/snippet}
</Button>
