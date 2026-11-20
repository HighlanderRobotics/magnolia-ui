<script lang="ts">
  import { glyphs } from './glyphs.js';
  import { getAppearance } from './appearance.js';
  let {
    kind,
  }: {
    kind:
      | 'scatter-highlight'
      | 'scatter-neutral'
      | `line-point-${1 | 2 | 3 | 4 | 5}`;
  } = $props();
  const appearance = getAppearance();
  let asset = $derived(glyphs[`${kind}-${appearance.mode}`]);
</script>

<img
  class="mg2-chart-marker"
  src={asset.src}
  width={asset.width}
  height={asset.height}
  alt=""
  aria-hidden="true"
/>
