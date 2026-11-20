<script lang="ts">
  import { glyphs, type GlyphName } from './glyphs.js';
  let { name, class: className = '' }: { name: GlyphName; class?: string } =
    $props();
  const pairs: Partial<Record<GlyphName, GlyphName>> = {
    check: 'check-compact',
    modifier: 'modifier-compact',
    'chip-check': 'chip-check-compact',
    'radio-box': 'radio-box-compact',
    'radio-dot': 'radio-dot-compact',
    'switch-track': 'switch-track-compact',
    'switch-thumb': 'switch-thumb-compact',
  };
  let asset = $derived(glyphs[name]);
  let compact = $derived(glyphs[pairs[name] ?? name]);
</script>

<span
  aria-hidden="true"
  class="mg2-glyph {className}"
  data-glyph={name}
  style={`--mg2-glyph-image:url(${JSON.stringify(asset.src)});--mg2-glyph-width:${asset.width}px;--mg2-glyph-height:${asset.height}px;--mg2-glyph-compact-image:url(${JSON.stringify(compact.src)});--mg2-glyph-compact-width:${compact.width}px;--mg2-glyph-compact-height:${compact.height}px;`}
></span>
