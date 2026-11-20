<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { positionOverlay } from './overlay-position.js';
  const id = $props.id();
  let {
    open = $bindable(false),
    label,
    trigger,
    children,
  }: {
    open?: boolean;
    label: string;
    trigger: Snippet<[HTMLButtonAttributes]>;
    children?: Snippet;
  } = $props();
  let anchor = $state<HTMLSpanElement>(null!);
  let panel = $state<HTMLDivElement>(null!);
  let previous: HTMLElement | null = null;
  $effect(() => {
    if (!panel) return;
    if (open) {
      previous = document.activeElement as HTMLElement;
      panel.showPopover();
    } else panel.hidePopover();
  });
  $effect(() => {
    if (!open || !panel) return;
    const position = positionOverlay(panel, anchor);
    (
      panel.querySelector<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]',
      ) ?? panel
    ).focus();
    return () => position.destroy();
  });
</script>

<span class="mg-overlay-anchor" bind:this={anchor}>
  {@render trigger({
    'aria-expanded': open,
    'aria-haspopup': 'dialog',
    'aria-controls': id,
    onclick: () => (open = !open),
  })}
  <div
    bind:this={panel}
    {id}
    popover="auto"
    role="dialog"
    aria-label={label}
    tabindex="-1"
    class="mg-popover"
    ontoggle={(event) => {
      if (event.newState === 'closed') {
        const restore =
          panel.contains(document.activeElement) ||
          document.activeElement === document.body;
        open = false;
        if (restore) previous?.focus();
      }
    }}
  >
    {@render children?.()}
  </div>
</span>
