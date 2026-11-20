<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  let {
    shape = 'rising',
    tone = 'neutral',
    label,
    ...rest
  }: HTMLAttributes<HTMLSpanElement> & {
    shape?: 'rising' | 'falling' | 'volatile' | 'flat';
    tone?: 'neutral' | 'accent';
    label?: string;
  } = $props();
</script>

<span
  {...rest}
  class={`mg2-sparkline ${rest.class ?? ''}`}
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : true}
  data-tone={tone}><Glyph name={`spark-${shape}-${tone}`} /></span
>
