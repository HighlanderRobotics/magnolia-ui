<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import Button from './Button.svelte';
  import IconButton from './IconButton.svelte';
  import Glyph from './Glyph.svelte';
  let {
    count,
    onclear,
    onassign,
    onexport,
    ondelete,
    children,
    label = 'Selection actions',
    floating = true,
  }: {
    count: number;
    onclear: () => void;
    onassign?: () => void;
    onexport?: () => void;
    ondelete?: () => void;
    children?: Snippet;
    label?: string;
    floating?: boolean;
  } = $props();
  let bar = $state<HTMLDivElement>(null!);
  let previous: HTMLElement | undefined,
    wasOpen = false;
  $effect(() => {
    if (count > 0 && !wasOpen) {
      previous =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : undefined;
      wasOpen = true;
    } else if (!(count > 0)) wasOpen = false;
  });
  async function clear() {
    const restore = bar?.contains(document.activeElement);
    onclear();
    await tick();
    if (restore && previous?.isConnected) previous.focus();
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (count > 0 && e.key === 'Escape' && !e.defaultPrevented) {
      e.preventDefault();
      void clear();
    }
  }}
/>
{#if count > 0}<div
    bind:this={bar}
    class="mg2-bulk-action-bar"
    role="group"
    aria-label={label}
    data-floating={floating}
  >
    <span role="status" class="mg2-bulk-count"
      >{Math.floor(count)} selected</span
    ><span class="mg2-bulk-separator" aria-hidden="true"></span>
    {#if children}{@render children()}{:else}
      {#if onassign}<Button variant="tertiary" onclick={onassign}
          >{#snippet icon()}<Glyph name="bulk-assign" />{/snippet}Assign</Button
        >{/if}
      {#if onexport}<Button variant="tertiary" onclick={onexport}
          >{#snippet icon()}<Glyph name="bulk-export" />{/snippet}Export</Button
        >{/if}
      {#if ondelete}<Button variant="tertiary" onclick={ondelete}
          >{#snippet icon()}<Glyph name="bulk-delete" />{/snippet}Delete</Button
        >{/if}
    {/if}
    <IconButton label="Clear selection" variant="tertiary" onclick={clear}
      >{#snippet icon()}<Glyph name="bulk-clear" />{/snippet}</IconButton
    >
  </div>{/if}
