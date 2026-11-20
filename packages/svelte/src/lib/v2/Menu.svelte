<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import BaseMenu from '../Menu.svelte';
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
  let anchor = $state<HTMLSpanElement>(null!),
    initialFocus = $state<'first' | 'last'>('first');
</script>

<span class="mg2-menu-anchor" bind:this={anchor}>
  {@render trigger({
    'aria-haspopup': 'menu',
    'aria-controls': id,
    'aria-expanded': open,
    onclick: () => {
      initialFocus = 'first';
      open = !open;
    },
    onkeydown: (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        initialFocus = event.key === 'ArrowUp' ? 'last' : 'first';
        open = true;
      }
    },
  })}
  <BaseMenu
    bind:open
    {id}
    ariaLabel={label}
    popover={true}
    anchorElement={anchor}
    {initialFocus}
    class="mg2-menu"
  >
    {@render children?.()}
  </BaseMenu>
</span>
