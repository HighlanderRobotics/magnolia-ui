<script lang="ts">
  const uid = $props.id();
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import { positionOverlay } from './overlay-position.js';
  import { MENU, type MenuContext } from './menu-context.js';
  let {
    open = $bindable(false),
    anchor = 'left',
    children,
    ariaLabel = 'Actions',
    id = uid,
    popover = false,
    anchorElement,
    initialFocus = 'first',
    class: className = '',
  }: {
    open?: boolean;
    anchor?: 'left' | 'right';
    children?: Snippet;
    ariaLabel?: string;
    id?: string;
    popover?: boolean;
    anchorElement?: HTMLElement;
    initialFocus?: 'first' | 'last';
    class?: string;
  } = $props();
  let panel = $state<HTMLDivElement>(null!);
  let trigger: HTMLElement | null = null;
  let search = '';
  let searchTime = 0;
  function close(restore = true) {
    open = false;
    if (restore) trigger?.focus();
  }
  setContext<MenuContext>(MENU, { close: () => close() });
  const items = () =>
    Array.from(
      panel.querySelectorAll<HTMLElement>(
        '[role^="menuitem"]:not(:disabled):not([aria-disabled="true"])',
      ),
    );
  $effect(() => {
    if (!open || !panel) return;
    const node = panel;
    trigger =
      anchorElement?.querySelector<HTMLElement>(
        'button:not(:disabled),a[href],[tabindex="0"]',
      ) ??
      (document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : null);
    if (popover) panel.showPopover();
    const position =
      popover && anchorElement
        ? positionOverlay(panel, anchorElement)
        : undefined;
    search = '';
    searchTime = 0;
    const all = items();
    (initialFocus === 'last' ? all.at(-1) : all[0])?.focus();
    if (!all.length) panel.focus();
    function outside(event: PointerEvent) {
      if (
        !panel.contains(event.target as Node) &&
        !trigger?.contains(event.target as Node)
      )
        close(false);
    }
    function focusout(event: FocusEvent) {
      if (
        !panel.contains(event.target as Node) &&
        !trigger?.contains(event.target as Node)
      )
        close(false);
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', focusout);
    return () => {
      position?.destroy();
      if (popover && node.isConnected) node.hidePopover();
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', focusout);
    };
  });
  function keydown(event: KeyboardEvent) {
    const all = items();
    const index = all.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key === 'Tab') {
      close();
      return;
    }
    let target: HTMLElement | undefined;
    if (event.key === 'ArrowDown') target = all[(index + 1) % all.length];
    else if (event.key === 'ArrowUp')
      target = all[(index - 1 + all.length) % all.length];
    else if (event.key === 'Home') target = all[0];
    else if (event.key === 'End') target = all.at(-1);
    else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      event.key !== ' '
    ) {
      const now = Date.now();
      search = now - searchTime > 500 ? event.key : search + event.key;
      searchTime = now;
      target = [...all.slice(index + 1), ...all.slice(0, index + 1)].find(
        (el) =>
          el.textContent?.trim().toLowerCase().startsWith(search.toLowerCase()),
      );
    }
    if (target) {
      event.preventDefault();
      target.focus();
    }
  }
</script>

{#if open}
  <div
    bind:this={panel}
    {id}
    class="mg-menu {anchor} {className}"
    popover={popover ? 'manual' : undefined}
    role="menu"
    aria-label={ariaLabel}
    tabindex="-1"
    onkeydown={keydown}
  >
    {@render children?.()}
  </div>
{/if}
