<script lang="ts">
  import Glyph from './Glyph.svelte';
  let {
    key,
    modifier = false,
    variant = 'cap',
    disabled = false,
  }: {
    key: string;
    modifier?: boolean;
    variant?: 'cap' | 'field';
    disabled?: boolean;
  } = $props();
</script>

<kbd class="mg2-kbd" data-variant={variant} data-disabled={disabled}
  >{#if modifier}<span class="mg2-sr-only">Command </span><Glyph
      name="modifier"
    />{/if}{key}</kbd
>
