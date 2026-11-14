<script lang="ts">
  import type { Snippet } from 'svelte';
  import '@highlanderrobotics/magnolia-tokens/v2/css';
  import './styles.css';
  let {
    children,
    theme = 'dark',
    density = 'comfortable',
    class: className = '',
  }: {
    children?: Snippet;
    theme?: 'dark' | 'light' | 'system';
    density?: 'comfortable' | 'compact';
    class?: string;
  } = $props();
</script>

<div
  class="mg-v2 {className}"
  data-magnolia-version="2"
  data-magnolia-theme={theme}
  data-density={density}
>
  {@render children?.()}
</div>
