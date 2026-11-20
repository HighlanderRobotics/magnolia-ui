<script lang="ts">
  import Glyph from './Glyph.svelte';
  let {
    value,
    sentiment = 'neutral',
    sentimentWord = true,
    unit = '%',
  }: {
    value: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
    sentimentWord?: boolean;
    unit?: string;
  } = $props();
  let valid = $derived(Number.isFinite(value));
  let direction = $derived<'flat' | 'up' | 'down'>(
    !valid || value === 0 ? 'flat' : value > 0 ? 'up' : 'down',
  );
  let word = $derived(
    direction === 'flat'
      ? ''
      : sentiment === 'positive'
        ? 'better'
        : sentiment === 'negative'
          ? 'worse'
          : '',
  );
</script>

<span
  class="mg2-trend"
  data-sentiment={direction === 'flat' ? 'neutral' : sentiment}
>
  <span class="mg2-trend-icon" data-flat={direction === 'flat'}
    ><Glyph name={`trend-${direction}`} /></span
  >
  <span
    >{valid
      ? `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}${unit}`
      : '—'}</span
  >
  {#if word}<span class:mg2-sr-only={!sentimentWord}>{word}</span>{/if}
</span>
