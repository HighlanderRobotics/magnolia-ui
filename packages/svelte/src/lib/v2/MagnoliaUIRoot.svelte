<script lang="ts">
  import type { Snippet } from 'svelte';
  import { MediaQuery } from 'svelte/reactivity';
  import { provideAppearance } from './appearance.js';
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
  const light = new MediaQuery('(prefers-color-scheme: light)', false);
  provideAppearance({
    get mode() {
      return theme === 'system' ? (light.current ? 'light' : 'dark') : theme;
    },
    get density() {
      return density;
    },
  });
</script>

<div
  class="mg-v2 {className}"
  data-magnolia-version="2"
  data-magnolia-theme={theme}
  data-density={density}
>
  {@render children?.()}
</div>
