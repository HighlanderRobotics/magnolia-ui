<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    open = $bindable(false),
    title,
    name,
    children,
    disabled = false,
    icon,
    class: className = '',
  }: {
    open?: boolean;
    title: string;
    name?: string;
    children?: Snippet;
    disabled?: boolean;
    icon?: Snippet;
    class?: string;
  } = $props();
</script>

<details
  bind:open
  {name}
  class="mg-accordion {className}"
  data-disabled={disabled}
>
  <summary
    aria-disabled={disabled || undefined}
    tabindex={disabled ? -1 : undefined}
    onclick={(event) => {
      if (disabled) event.preventDefault();
    }}
  >
    {#if icon}<span>{title}</span>{@render icon()}{:else}{title}{/if}
  </summary>
  <div class="mg-accordion-content">{@render children?.()}</div>
</details>
