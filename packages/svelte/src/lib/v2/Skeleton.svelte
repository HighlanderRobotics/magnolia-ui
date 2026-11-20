<script lang="ts">
  let {
    shape = 'line',
    width,
    height,
  }: {
    shape?: 'line' | 'block' | 'circle';
    width?: number;
    height?: number;
  } = $props();
</script>

<span
  class="mg2-loading-skeleton"
  aria-hidden="true"
  data-shape={shape}
  style={`${width !== undefined ? `width:${Math.max(0, width)}px;` : ''}${height !== undefined ? `height:${Math.max(0, height)}px;` : ''}`}
></span>
