<script lang="ts">
  import Glyph from './Glyph.svelte';
  let {
    key = 'K',
    modifier = false,
    variant = 'cap',
    disabled = false,
    showKey = true,
  }: {
    key?: string;
    modifier?: boolean | 'command' | 'shift' | 'enter';
    variant?: 'cap' | 'field';
    disabled?: boolean;
    showKey?: boolean;
  } = $props();
  const mark = $derived(modifier === true ? 'command' : modifier || undefined);
  const markLabel = $derived(mark ? mark[0].toUpperCase() + mark.slice(1) : '');
</script>

<kbd
  class="mg2-kbd"
  data-variant={variant}
  data-disabled={disabled}
  data-show-key={showKey}
  >{#if mark}<span class="mg2-sr-only">{markLabel}{showKey ? ' ' : ''}</span
    ><span class="mg2-kbd-modifier" data-modifier={mark}
      ><Glyph
        name={mark === 'command'
          ? 'modifier'
          : mark === 'shift'
            ? 'kbd-shift'
            : 'kbd-enter'}
      /></span
    >{/if}{showKey ? key : ''}</kbd
>
