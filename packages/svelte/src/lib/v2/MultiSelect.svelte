<script lang="ts">
  import { onMount } from 'svelte';
  import Base from '../Combobox.svelte';
  import NativeSelect from '../MultiSelect.svelte';
  import Glyph from './Glyph.svelte';
  import Option from './ComboOption.svelte';
  let {
    label,
    items,
    value = $bindable<string[]>([]),
    placeholder = 'Add tag…',
    disabled = false,
    required = false,
    name,
    error,
    loading = false,
    onQueryChange,
  }: {
    label: string;
    items: { value: string; label: string; disabled?: boolean }[];
    value?: string[];
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    error?: string;
    loading?: boolean;
    onQueryChange?: (query: string) => void;
  } = $props();
  let root = $state<HTMLDivElement>();
  let selected = $derived(items.filter((item) => value.includes(item.value)));
  function toggle(id: string) {
    value = value.includes(id) ? value.filter((v) => v !== id) : [...value, id];
  }
  onMount(() => {
    const initial = [...value],
      select = root?.querySelector('select'),
      form = select?.form;
    if (select)
      for (const option of select.options)
        option.defaultSelected = initial.includes(option.value);
    const reset = () => (value = [...initial]);
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
</script>

<div
  bind:this={root}
  class="mg2-combo mg2-combo-multiple"
  data-disabled={disabled}
  data-error={!!error}
>
  <Base
    {label}
    {items}
    value={null}
    {placeholder}
    {disabled}
    {required}
    errorMessage={error}
    {loading}
    multiple
    selectedValues={value}
    showAllOnOpen
    {onQueryChange}
    onSelect={(item) => toggle(item.value)}
  >
    {#snippet controlPrefix()}{#each selected as item}<span
          class="mg2-combo-token"
          ><span>{item.label}</span><button
            type="button"
            aria-label={`Remove ${item.label}`}
            {disabled}
            onpointerdown={(event) => event.preventDefault()}
            onclick={() => toggle(item.value)}
            ><Glyph name="token-remove" /></button
          ></span
        >{/each}{/snippet}
    {#snippet trailing(open, toggleOpen)}<button
        type="button"
        class="mg2-combo-chevron"
        aria-label={`${open ? 'Close' : 'Open'} ${label}`}
        {disabled}
        tabindex="-1"
        onpointerdown={(event) => event.preventDefault()}
        onclick={toggleOpen}
        ><Glyph name={open ? 'combo-up' : 'combo-down'} /></button
      >{/snippet}
    {#snippet optionContent(item, query, isSelected)}<Option
        label={item.label}
        {query}
        selected={isSelected}
      />{/snippet}
    {#snippet statusContent(query, busy)}<Glyph
        name={busy ? 'combo-loading' : 'combo-empty'}
      /><span
        >{busy
          ? 'Searching…'
          : `No results${query ? ` for “${query}”` : ''}`}</span
      >{/snippet}
    {#snippet footer()}<div class="mg2-combo-footer">
        {selected.length} selected
      </div>{/snippet}
    {#snippet errorContent(message)}<Glyph name="error" />{message}{/snippet}
  </Base>
  <div class="mg2-native-multi">
    <NativeSelect
      {label}
      {items}
      bind:value
      {name}
      {disabled}
      aria-hidden="true"
      tabindex={-1}
    />
  </div>
</div>
