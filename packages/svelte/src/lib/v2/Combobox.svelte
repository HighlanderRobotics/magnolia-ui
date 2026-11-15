<script lang="ts">
  import Base from '../Combobox.svelte';
  import Glyph from './Glyph.svelte';
  import Option from './ComboOption.svelte';
  let {
    label,
    items,
    value = $bindable<string | null>(null),
    placeholder = 'Search options',
    disabled = false,
    required = false,
    name,
    error,
    loading = false,
    itemNoun = 'options',
    onQueryChange,
  }: {
    label: string;
    items: { value: string; label: string; disabled?: boolean }[];
    value?: string | null;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    error?: string;
    loading?: boolean;
    itemNoun?: string;
    onQueryChange?: (query: string) => void;
  } = $props();
</script>

<div class="mg2-combo" data-disabled={disabled} data-error={!!error}>
  <Base
    {label}
    {items}
    bind:value
    {placeholder}
    {disabled}
    {required}
    {name}
    errorMessage={error}
    {loading}
    showAllOnOpen
    {onQueryChange}
  >
    {#snippet trailing(open, toggle)}<button
        type="button"
        class="mg2-combo-chevron"
        aria-label={`${open ? 'Close' : 'Open'} ${label}`}
        {disabled}
        tabindex="-1"
        onpointerdown={(event) => event.preventDefault()}
        onclick={toggle}
        ><Glyph name={open ? 'combo-up' : 'combo-down'} /></button
      >{/snippet}
    {#snippet optionContent(item, query, selected)}<Option
        label={item.label}
        {query}
        {selected}
      />{/snippet}
    {#snippet statusContent(query, busy)}<Glyph
        name={busy ? 'combo-loading' : 'combo-empty'}
      /><span
        >{busy
          ? 'Searching…'
          : `No results${query ? ` for “${query}”` : ''}`}</span
      >{/snippet}
    {#snippet footer(count)}<div class="mg2-combo-footer">
        {count} of {items.length}
        {itemNoun}
      </div>{/snippet}
    {#snippet errorContent(message)}<Glyph name="error" />{message}{/snippet}
  </Base>
</div>
