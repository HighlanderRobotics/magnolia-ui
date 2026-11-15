<script lang="ts">
  import Glyph from './Glyph.svelte';
  let {
    label,
    query,
    selected = false,
  }: { label: string; query: string; selected?: boolean } = $props();
  let index = $derived(
    query ? label.toLowerCase().indexOf(query.toLowerCase()) : -1,
  );
</script>

<span class="mg2-combo-option-text"
  >{#if index >= 0}{label.slice(0, index)}<strong
      >{label.slice(index, index + query.length)}</strong
    >{label.slice(index + query.length)}{:else}{label}{/if}</span
>{#if selected}<Glyph name="combo-check" />{/if}
