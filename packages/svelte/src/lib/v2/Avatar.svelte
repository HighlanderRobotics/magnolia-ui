<script lang="ts">
  import { initials } from '@highlanderrobotics/magnolia-tokens/v2';
  import Glyph from './Glyph.svelte';
  let {
    name,
    src,
    size = 32,
    content = 'initials',
    more = 0,
  }: {
    name: string;
    src?: string;
    size?: 24 | 28 | 32 | 40;
    content?: 'initials' | 'icon' | 'more';
    more?: number;
  } = $props();
  let failed = $state(false);
  $effect(() => {
    src;
    failed = false;
  });
</script>

<span
  class="mg2-avatar"
  role="img"
  aria-label={content === 'more' ? `${more} more people` : name}
  data-size={size}
  data-more={content === 'more'}
  style={`--mg2-avatar-size:${size}px`}
>
  {#if src && !failed}<img {src} alt="" onerror={() => (failed = true)} />
  {:else if content === 'icon'}<Glyph name={`avatar-user-${size}`} />
  {:else if content === 'more'}+{more}{:else}{initials(name)}{/if}
</span>
