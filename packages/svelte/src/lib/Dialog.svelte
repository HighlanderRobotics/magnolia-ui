<script lang="ts">
  const uid = $props.id();
  import type { Snippet } from 'svelte';
  import { lockScroll } from './dialog-lock.js';
  let {
    open = $bindable(false),
    canClose = true,
    title,
    ariaLabel,
    labelledby,
    describedby,
    children,
    onclose,
  }: {
    open?: boolean;
    canClose?: boolean;
    title?: string;
    ariaLabel?: string;
    labelledby?: string;
    describedby?: string;
    children?: Snippet;
    onclose?: () => void;
  } = $props();
  let dialog = $state<HTMLDialogElement>(null!);
  let pointerStartedOutside = false;
  function close() {
    if (canClose) {
      open = false;
    }
  }
  $effect(() => {
    if (!open || !dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = dialog;
    const unlock = lockScroll();
    node.showModal();
    return () => {
      node.close();
      unlock();
      onclose?.();
      if (previous?.isConnected) previous.focus();
    };
  });
  function outside(event: PointerEvent) {
    const rect = dialog.getBoundingClientRect();
    return (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    );
  }
  function keydown(event: KeyboardEvent) {
    if (
      event.key !== 'Tab' ||
      (event.target as Element).closest('dialog') !== dialog
    )
      return;
    const controls = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.getClientRects().length > 0 && el.tabIndex >= 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first) {
      event.preventDefault();
      dialog.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
</script>

{#if open}
  <dialog
    bind:this={dialog}
    class="mg-dialog"
    aria-label={ariaLabel}
    aria-labelledby={labelledby ?? (title ? uid : undefined)}
    aria-describedby={describedby}
    onkeydown={keydown}
    oncancel={(event) => {
      event.preventDefault();
      close();
    }}
    onclose={() => {
      if (!dialog.open && open) {
        open = false;
      }
    }}
    onpointerdown={(event) => {
      pointerStartedOutside = outside(event);
    }}
    onpointerup={(event) => {
      if (pointerStartedOutside && outside(event)) close();
      pointerStartedOutside = false;
    }}
  >
    {#if title}<h2 id={uid}>{title}</h2>{/if}
    {@render children?.()}
  </dialog>
{/if}
