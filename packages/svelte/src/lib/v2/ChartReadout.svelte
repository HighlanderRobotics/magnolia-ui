<script lang="ts">
  import type { Snippet } from 'svelte';
  import { positionOverlay } from '../overlay-position.js';
  let {
    anchor,
    children,
    ondismiss,
  }: { anchor?: HTMLElement; children: Snippet; ondismiss: () => void } =
    $props();
  let panel = $state<HTMLDivElement>(null!);
  $effect(() => {
    if (!panel || !anchor) return;
    panel.showPopover();
    const position = positionOverlay(panel, anchor);
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        event.stopPropagation();
        ondismiss();
      }
    };
    document.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('keydown', escape, true);
      position.destroy();
      if (panel.isConnected) panel.hidePopover();
    };
  });
</script>

<div bind:this={panel} popover="manual" class="mg2-chart-readout">
  {@render children()}
</div>
