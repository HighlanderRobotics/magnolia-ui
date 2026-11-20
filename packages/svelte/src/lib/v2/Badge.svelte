<script lang="ts">
  import type { Tone } from '@highlanderrobotics/magnolia-tokens/v2';
  import Glyph from './Glyph.svelte';
  let {
    label,
    tone = 'neutral',
    icon = false,
    quiet = false,
  }: { label: string; tone?: Tone; icon?: boolean; quiet?: boolean } = $props();
</script>

<span
  class="mg2-badge mg2-tone"
  data-tone={tone}
  data-quiet={quiet}
  data-icon={icon}
  >{#if icon}<span class="mg2-badge-icon"><Glyph name="badge-check" /></span
    >{/if}{label}</span
>
