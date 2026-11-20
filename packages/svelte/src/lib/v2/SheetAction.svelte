<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import MenuItem from './MenuItem.svelte';
  let {
    class: className = '',
    ...rest
  }: Omit<
    ComponentProps<typeof MenuItem>,
    'role' | 'tabindex' | 'checked'
  > = $props();
</script>

<MenuItem
  {...rest}
  role="button"
  tabindex={0}
  class={`mg2-sheet-action ${className}`}
/>
