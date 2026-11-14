<script lang="ts">
  import {
    contextHue,
    type ContextHue,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import { glyphs } from './glyphs.js';
  let { contextId, hue }: { contextId: string; hue?: ContextHue } = $props();
  let color = $derived(hue ?? contextHue(contextId));
  const colors = {
    accent: 'var(--mg-v2-color-wash-accent)',
    teal: 'var(--mg-v2-color-wash-teal)',
    amber: 'var(--mg-v2-color-wash-amber)',
    green: 'var(--mg-v2-color-wash-green)',
    blue: 'var(--mg-v2-color-wash-blue)',
  };
</script>

<div
  class="mg2-wash"
  aria-hidden="true"
  data-hue={color}
  style={`--mg2-wash-image:url(${JSON.stringify(glyphs.wash.src)});--mg2-wash-color:${colors[color]};`}
></div>
