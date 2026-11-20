<script lang="ts">
  import Button from './Button.svelte';
  import Glyph from './Glyph.svelte';
  let {
    open = $bindable(false),
    message,
    tone = 'neutral',
    actionLabel,
    duration = 5000,
    onaction,
    ondismiss,
  }: {
    open?: boolean;
    message: string;
    tone?: 'neutral' | 'success' | 'danger';
    actionLabel?: string;
    duration?: number;
    onaction?: (event: MouseEvent) => void;
    ondismiss?: (reason: 'timeout' | 'action' | 'dismiss') => void;
  } = $props();
  let region: HTMLDivElement;
  let hovered = false,
    focused = false;
  let syncTimer = () => {};
  let returnFocus: HTMLElement | null = null;
  function dismiss(reason: 'timeout' | 'action' | 'dismiss') {
    if (!open) return;
    const restore = region?.contains(document.activeElement);
    open = false;
    if (restore && returnFocus?.isConnected) returnFocus.focus();
    ondismiss?.(reason);
  }
  $effect(() => {
    const currentMessage = message,
      currentTone = tone,
      timeout = duration;
    if (!open) {
      hovered = false;
      focused = false;
      return;
    }
    void currentMessage;
    if (!region?.contains(document.activeElement))
      returnFocus = document.activeElement as HTMLElement | null;
    let remaining = Number.isFinite(timeout) ? Math.max(0, timeout) : 5000;
    let timer: ReturnType<typeof setTimeout> | undefined,
      started = 0;
    function stop() {
      if (timer !== undefined) {
        clearTimeout(timer);
        remaining = Math.max(0, remaining - (Date.now() - started));
        timer = undefined;
      }
    }
    syncTimer = () => {
      stop();
      if (
        currentTone === 'danger' ||
        timeout === 0 ||
        hovered ||
        focused ||
        document.hidden
      )
        return;
      started = Date.now();
      timer = setTimeout(() => dismiss('timeout'), remaining);
    };
    syncTimer();
    return () => {
      stop();
      syncTimer = () => {};
    };
  });
</script>

<svelte:document onvisibilitychange={() => syncTimer()} />
<svelte:window
  onkeydown={(e) => {
    if (
      open &&
      e.key === 'Escape' &&
      region?.contains(document.activeElement)
    ) {
      e.preventDefault();
      dismiss('dismiss');
    }
  }}
/>
<div
  bind:this={region}
  class="mg2-toast-region"
  role={tone === 'danger' ? 'alert' : 'status'}
  aria-atomic="true"
  onpointerenter={() => {
    hovered = true;
    syncTimer();
  }}
  onpointerleave={() => {
    hovered = false;
    syncTimer();
  }}
  onfocusin={() => {
    focused = true;
    syncTimer();
  }}
  onfocusout={(e) => {
    focused =
      e.relatedTarget instanceof Node && region.contains(e.relatedTarget);
    syncTimer();
  }}
>
  {#if open}<div class="mg2-toast" data-tone={tone}>
      <Glyph name={tone === 'neutral' ? 'toast-info' : `toast-${tone}`} />
      <p>{message}</p>
      {#if actionLabel || tone === 'danger'}<Button
          variant="tertiary"
          onclick={(e) => {
            if (actionLabel) onaction?.(e);
            if (!e.defaultPrevented)
              dismiss(actionLabel ? 'action' : 'dismiss');
          }}>{actionLabel ?? 'Dismiss'}</Button
        >{/if}
    </div>{/if}
</div>
