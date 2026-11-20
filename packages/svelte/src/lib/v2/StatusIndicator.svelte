<script lang="ts">
  import type { Tone } from '@highlanderrobotics/magnolia-tokens/v2';
  import Glyph from './Glyph.svelte';
  let { label, tone = 'neutral' }: { label: string; tone?: Tone } = $props();
</script>

<span class="mg2-status mg2-tone" data-tone={tone}
  ><span class="mg2-status-dot"><Glyph name="status-dot" /></span>{label}</span
>
