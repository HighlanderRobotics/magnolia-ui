<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  let {
    active = $bindable(false),
    variant = 'primary',
    disabled = false,
    children,
    onclick,
    ...rest
  }: Omit<HTMLButtonAttributes, 'children' | 'onclick'> & {
    active?: boolean;
    variant?: 'primary' | 'secondary';
    children?: Snippet;
    onclick?: (event: MouseEvent) => void;
  } = $props();
</script>

<button
  {...rest}
  type="button"
  class="mg-pill {variant} {rest.class ?? ''}"
  {disabled}
  aria-pressed={active}
  onclick={(event) => {
    onclick?.(event);
    if (!event.defaultPrevented) active = !active;
  }}>{@render children?.()}</button
>
