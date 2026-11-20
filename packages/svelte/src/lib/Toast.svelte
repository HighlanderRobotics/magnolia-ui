<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';
  let {
    open = $bindable(false),
    variant = 'info',
    children,
    dismissLabel = 'Dismiss notification',
  }: {
    open?: boolean;
    variant?: 'info' | 'danger';
    children?: Snippet;
    dismissLabel?: string;
  } = $props();
  let region = $state<HTMLDivElement>(null!);
  let restoreTarget: HTMLElement | null = null;
  $effect(() => {
    if (open) restoreTarget = document.activeElement as HTMLElement;
  });
  function dismiss() {
    const restore = region.contains(document.activeElement);
    open = false;
    if (restore && restoreTarget?.isConnected) restoreTarget.focus();
  }
</script>

<div
  bind:this={region}
  class="mg-toast-region"
  role={variant === 'danger' ? 'alert' : 'status'}
  aria-atomic="true"
>
  {#if open}
    <div class="mg-alert mg-toast {variant}">
      <div>{@render children?.()}</div>
      <Button
        variant="text-only-secondary"
        aria-label={dismissLabel}
        onclick={dismiss}>Dismiss</Button
      >
    </div>
  {/if}
</div>
