<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import spinnerDark from './assets/spinner-dark.svg';
  let {
    children,
    icon,
    variant = 'primary',
    size = 'large',
    loading = false,
    disabled = false,
    type = 'button',
    class: className = '',
    ...rest
  }: Omit<HTMLButtonAttributes, 'children'> & {
    children?: Snippet;
    icon?: Snippet;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
    size?: 'large' | 'medium';
    loading?: boolean;
  } = $props();
</script>

<button
  {...rest}
  {type}
  class="mg2-button {className}"
  data-variant={variant}
  data-size={size}
  data-icon={!!icon}
  disabled={disabled || loading}
  aria-busy={loading}
  data-loading={loading}
>
  <span class="mg2-button-content" class:mg2-hidden={loading}>
    {#if icon}<span class="mg2-button-icon" aria-hidden="true"
        >{@render icon()}</span
      >{/if}
    {@render children?.()}
  </span>
  {#if loading}<span
      class="mg2-spinner"
      aria-hidden="true"
      style={`--mg2-spinner: url(${JSON.stringify(spinnerDark)})`}
    ></span>{/if}
</button>
