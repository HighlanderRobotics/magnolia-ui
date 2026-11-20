<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { positionOverlay } from './overlay-position.js';
  const id = $props.id();
  let {
    text,
    trigger,
    delay = 400,
    focusDelay = delay,
    content,
    class: className = '',
  }: {
    text: string;
    trigger: Snippet<[HTMLButtonAttributes]>;
    delay?: number;
    focusDelay?: number;
    content?: Snippet;
    class?: string;
  } = $props();
  let wrapper = $state<HTMLSpanElement>(null!);
  let panel = $state<HTMLDivElement>(null!);
  let open = $state(false);
  let hovered = false;
  let focused = false;
  let timer: ReturnType<typeof setTimeout>;
  function show(wait = delay) {
    clearTimeout(timer);
    timer = setTimeout(() => (open = true), Math.max(0, wait));
  }
  function hide() {
    clearTimeout(timer);
    if (!hovered && !focused) open = false;
  }
  $effect(() => {
    if (!open || !panel) return;
    panel.showPopover();
    const position = positionOverlay(panel, wrapper);
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        open = false;
      }
    };
    document.addEventListener('keydown', escape, true);
    return () => {
      position.destroy();
      if (panel.isConnected) panel.hidePopover();
      document.removeEventListener('keydown', escape, true);
    };
  });
  onDestroy(() => clearTimeout(timer));
</script>

<span class="mg-overlay-anchor" bind:this={wrapper}>
  {@render trigger({
    'aria-describedby': open ? id : undefined,
    onpointerenter: () => {
      hovered = true;
      show();
    },
    onpointerleave: () => {
      hovered = false;
      clearTimeout(timer);
      timer = setTimeout(hide, 100);
    },
    onfocus: () => {
      focused = true;
      show(focusDelay);
    },
    onblur: () => {
      focused = false;
      hide();
    },
  })}
  <div
    bind:this={panel}
    {id}
    popover="manual"
    role="tooltip"
    class="mg-tooltip {className}"
    onpointerenter={() => {
      hovered = true;
      clearTimeout(timer);
    }}
    onpointerleave={() => {
      hovered = false;
      hide();
    }}
  >
    {#if content}{@render content()}{:else}{text}{/if}
  </div>
</span>
