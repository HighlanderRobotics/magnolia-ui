<script lang="ts">
  import { getContext } from 'svelte';
  import Button from './Button.svelte';
  import { MENU, type MenuContext } from './menu-context.js';
  import type { ButtonProps } from './types.js';
  let { onclick, variant = 'secondary', ...rest }: ButtonProps = $props();
  const menu = getContext<MenuContext | undefined>(MENU);
</script>

<Button
  {...rest}
  {variant}
  menuItem
  onclick={(event) => {
    onclick?.(event);
    if (!event.defaultPrevented) menu?.close();
  }}
/>
