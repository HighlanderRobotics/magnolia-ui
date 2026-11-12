<script lang="ts">
  import type { ButtonProps } from './types.js';
  let {
    children,
    variant = 'primary',
    element = 'button',
    type = 'button',
    disabled = false,
    loading = false,
    onclick,
    href,
    menuItem = false,
    class: className = '',
    ...rest
  }: ButtonProps = $props();
  function click(event: MouseEvent) {
    if (disabled || loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    onclick?.(event);
  }
</script>

{#if element === 'a'}
  <a
    {...rest}
    class="mg-button {variant} {className}"
    class:mg-menu-button={menuItem}
    role={menuItem ? 'menuitem' : 'link'}
    href={disabled || loading ? undefined : href}
    aria-disabled={disabled || loading}
    aria-busy={loading}
    tabindex={disabled || loading ? -1 : rest.tabindex}
    onclick={click}
    >{#if loading}<span aria-hidden="true">…</span
      >{/if}{@render children?.()}</a
  >
{:else}
  <button
    {...rest}
    class="mg-button {variant} {className}"
    class:mg-menu-button={menuItem}
    role={menuItem ? 'menuitem' : undefined}
    {type}
    disabled={disabled || loading}
    aria-disabled={disabled || loading}
    aria-busy={loading}
    onclick={click}
    >{#if loading}<span aria-hidden="true">…</span
      >{/if}{@render children?.()}</button
  >
{/if}
