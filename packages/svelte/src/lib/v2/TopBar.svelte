<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import IconButton from './IconButton.svelte';
  import Glyph from './Glyph.svelte';
  let {
    title,
    variant = 'inline',
    collapsed = false,
    onback,
    backLabel = 'Back',
    onaction,
    actionLabel = 'More options',
    action,
    ...rest
  }: HTMLAttributes<HTMLElement> & {
    title: string;
    variant?: 'inline' | 'large';
    collapsed?: boolean;
    onback?: () => void;
    backLabel?: string;
    onaction?: () => void;
    actionLabel?: string;
    action?: Snippet;
  } = $props();
  let large = $derived(variant === 'large' && !collapsed);
</script>

<header {...rest} class={`mg2-top-bar ${rest.class ?? ''}`} data-large={large}>
  <div class="mg2-top-bar-row">
    {#if onback}<IconButton
        label={backLabel}
        variant="tertiary"
        onclick={onback}
        >{#snippet icon()}<Glyph name="top-back" />{/snippet}</IconButton
      >{:else}<span class="mg2-top-bar-spacer" aria-hidden="true"></span>{/if}
    {#if !large}<h2>{title}</h2>{:else}<span
        class="mg2-top-bar-spacer-title"
        aria-hidden="true"
      ></span>{/if}
    {#if action}{@render action()}{:else if onaction}<IconButton
        label={actionLabel}
        variant="tertiary"
        onclick={onaction}
        >{#snippet icon()}<Glyph name="top-more" />{/snippet}</IconButton
      >{:else}<span class="mg2-top-bar-spacer" aria-hidden="true"></span>{/if}
  </div>
  {#if large}<h2 class="mg2-top-bar-large-title">{title}</h2>{/if}
</header>
