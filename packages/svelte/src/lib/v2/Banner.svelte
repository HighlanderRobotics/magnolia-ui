<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Tone } from '@highlanderrobotics/magnolia-tokens/v2';
  import Glyph from './Glyph.svelte';
  let {
    title,
    body,
    tone = 'neutral',
    action,
    dismissible = false,
    open = $bindable(true),
    ondismiss,
  }: {
    title: string;
    body?: string;
    tone?: Exclude<Tone, 'accent'>;
    action?: Snippet;
    dismissible?: boolean;
    open?: boolean;
    ondismiss?: () => void;
  } = $props();
</script>

{#if open}<div
    class="mg2-banner mg2-tone"
    data-tone={tone}
    role={tone === 'danger' ? 'alert' : undefined}
    data-dismissible={dismissible}
  >
    <span class="mg2-banner-icon"
      ><Glyph
        name={tone === 'neutral' || tone === 'info'
          ? 'banner-info'
          : `banner-${tone}`}
      /></span
    >
    <div class="mg2-banner-content">
      <strong>{title}</strong>{#if body}<p>{body}</p>{/if}{#if action}<div
          class="mg2-banner-action"
        >
          {@render action()}
        </div>{/if}
    </div>
    {#if dismissible}<button
        type="button"
        class="mg2-banner-close"
        aria-label={`Dismiss ${title}`}
        onclick={() => {
          open = false;
          ondismiss?.();
        }}><Glyph name="close" /></button
      >{/if}
  </div>{/if}
