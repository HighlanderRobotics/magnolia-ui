<script lang="ts">
  import type { Snippet } from 'svelte';
  import '@highlanderrobotics/magnolia-tokens/css';
  import './styles.css';
  let {
    children,
    theme = 'system',
    density = 'comfortable',
    class: className = '',
  }: {
    children?: Snippet;
    theme?: 'system' | 'light' | 'dark';
    density?: 'comfortable' | 'compact';
    class?: string;
  } = $props();
</script>

<div
  class="mg-root {className}"
  data-magnolia-theme={theme}
  data-density={density}
>
  {@render children?.()}
</div>
