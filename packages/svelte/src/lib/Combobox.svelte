<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  const id = $props.id();
  type Item = { value: string; label: string; disabled?: boolean };
  let {
    value = $bindable<string | null>(null),
    items,
    label,
    placeholder = 'Search options',
    disabled = false,
    required = false,
    name,
    errorMessage,
    loading = false,
    multiple = false,
    selectedValues = [],
    showAllOnOpen = false,
    onSelect,
    onQueryChange,
    controlPrefix,
    trailing,
    optionContent,
    statusContent,
    footer,
    errorContent,
  }: {
    value?: string | null;
    items: Item[];
    label: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    errorMessage?: string;
    loading?: boolean;
    multiple?: boolean;
    selectedValues?: string[];
    showAllOnOpen?: boolean;
    onSelect?: (item: Item) => void;
    onQueryChange?: (query: string) => void;
    controlPrefix?: Snippet;
    trailing?: Snippet<[boolean, () => void]>;
    optionContent?: Snippet<[Item, string, boolean]>;
    statusContent?: Snippet<[string, boolean]>;
    footer?: Snippet<[number]>;
    errorContent?: Snippet<[string]>;
  } = $props();
  let root = $state<HTMLDivElement>(null!);
  let input = $state<HTMLInputElement>(null!);
  let open = $state(false);
  let query = $state(
    untrack(() => items.find((item) => item.value === value)?.label ?? ''),
  );
  let filtering = $state(false);
  let search = $derived(showAllOnOpen && !filtering ? '' : query);
  let active = $state(-1);
  let matches = $derived(
    items.filter((item) =>
      item.label.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    ),
  );
  $effect(() => {
    if (!open) {
      query = items.find((item) => item.value === value)?.label ?? '';
      filtering = false;
    }
  });
  $effect(() => {
    if (disabled) open = false;
  });
  $effect(() => {
    const valid = items.some(
      (item) =>
        (multiple
          ? selectedValues.includes(item.value)
          : item.value === value) && !item.disabled,
    );
    input?.setCustomValidity(
      (required || (!multiple && query.length > 0)) && !valid
        ? 'Choose an available option.'
        : '',
    );
  });
  $effect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!root.contains(e.target as Node)) open = false;
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  });
  $effect(() => {
    if (open && active >= 0)
      document
        .getElementById(`${id}-option-${active}`)
        ?.scrollIntoView({ block: 'nearest' });
  });
  onMount(() => {
    const initial = value;
    input.defaultValue =
      items.find((item) => item.value === initial)?.label ?? '';
    const form = input.form;
    const reset = () => {
      value = initial;
      open = false;
    };
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
  function select(item: Item) {
    if (!item.disabled && !loading) {
      value = multiple ? null : item.value;
      query = multiple ? '' : item.label;
      if (multiple) {
        filtering = false;
        onQueryChange?.('');
      }
      open = multiple;
      onSelect?.(item);
      input.focus();
    }
  }
  function move(direction: number) {
    if (loading) {
      active = -1;
      return;
    }
    const enabled = matches
      .map((item, i) => (item.disabled ? -1 : i))
      .filter((i) => i >= 0);
    const index = enabled.indexOf(active);
    active =
      (index < 0
        ? direction > 0
          ? enabled[0]
          : enabled.at(-1)
        : enabled[(index + direction + enabled.length) % enabled.length]) ?? -1;
  }
  function keydown(event: KeyboardEvent) {
    if (event.isComposing) return;
    if (
      loading &&
      ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter'].includes(event.key)
    ) {
      event.preventDefault();
      open = true;
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open = true;
      move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (open && (event.key === 'Home' || event.key === 'End')) {
      event.preventDefault();
      const enabled = matches
        .map((item, i) => (item.disabled ? -1 : i))
        .filter((i) => i >= 0);
      active = (event.key === 'Home' ? enabled[0] : enabled.at(-1)) ?? -1;
    } else if (open && event.key === 'Enter') {
      event.preventDefault();
      if (matches[active]) select(matches[active]);
    } else if (open && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      open = false;
    } else if (event.key === 'Tab') open = false;
  }
</script>

<div class="mg-combobox mg-field" bind:this={root}>
  <label for={id}>{label}</label>
  {#snippet control()}<input
      bind:this={input}
      {id}
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={open}
      aria-busy={loading || undefined}
      aria-controls={open ? `${id}-list` : undefined}
      aria-activedescendant={open && !loading && matches[active]
        ? `${id}-option-${active}`
        : undefined}
      aria-invalid={!!errorMessage}
      aria-errormessage={errorMessage ? `${id}-error` : undefined}
      aria-describedby={errorMessage ? `${id}-error` : undefined}
      {disabled}
      required={required && !(multiple && selectedValues.length)}
      {placeholder}
      value={query}
      autocomplete="off"
      oninput={(event) => {
        query = event.currentTarget.value;
        filtering = true;
        onQueryChange?.(query);
        value = null;
        active = -1;
        open = true;
      }}
      onclick={() => {
        if (!disabled) {
          open = !open;
          active = -1;
        }
      }}
      onblur={() => (open = false)}
      onkeydown={keydown}
    />{/snippet}
  {#if controlPrefix || trailing}<div class="mg-combobox-control">
      {@render controlPrefix?.()}{@render control()}{@render trailing?.(
        open,
        () => {
          if (!disabled) {
            open = !open;
            active = -1;
            input.focus();
          }
        },
      )}
    </div>{:else}{@render control()}{/if}
  <input type="hidden" {name} value={value ?? ''} {disabled} />
  {#if open}
    <div class="mg-options">
      <div
        id={`${id}-list`}
        role="listbox"
        aria-label={label}
        aria-multiselectable={multiple || undefined}
      >
        {#if !loading}{#each matches as item, i}<button
              type="button"
              role="option"
              id={`${id}-option-${i}`}
              tabindex="-1"
              class:mg-option-active={i === active}
              aria-selected={multiple
                ? selectedValues.includes(item.value)
                : value === item.value}
              disabled={item.disabled}
              onpointerdown={(e) => e.preventDefault()}
              onclick={() => select(item)}
              >{#if optionContent}{@render optionContent(
                  item,
                  search,
                  multiple
                    ? selectedValues.includes(item.value)
                    : value === item.value,
                )}{:else}{item.label}{/if}</button
            >{/each}
        {/if}
      </div>
      {#if loading || !matches.length}<div class="mg-empty" role="status">
          {#if statusContent}{@render statusContent(
              query,
              loading,
            )}{:else}{loading ? 'Searching…' : 'No results'}{/if}
        </div>{/if}
      {#if !loading && matches.length}{@render footer?.(matches.length)}{/if}
    </div>
  {/if}
  {#if errorMessage}<span class="mg-error" id={`${id}-error`}
      >{#if errorContent}{@render errorContent(
          errorMessage,
        )}{:else}{errorMessage}{/if}</span
    >{/if}
</div>
