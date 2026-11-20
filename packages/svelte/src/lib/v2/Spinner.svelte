<script lang="ts">
  import Glyph from './Glyph.svelte';
  let {
    size = 'small',
    label = 'Loading',
  }: { size?: 'small' | 'medium' | 'large'; label?: string } = $props();
</script>

<span class="mg2-loading-spinner" role="status"
  ><span class="mg2-sr-only">{label}</span><Glyph
    name={`spinner-${size}`}
  /></span
>
