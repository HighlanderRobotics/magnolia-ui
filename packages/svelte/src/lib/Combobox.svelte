<script lang="ts">
  import { onMount } from 'svelte';
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
  }: {
    value?: string | null;
    items: Item[];
    label: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    errorMessage?: string;
  } = $props();
  let root = $state<HTMLDivElement>(null!);
  let input = $state<HTMLInputElement>(null!);
  let open = $state(false);
  let query = $state('');
  let active = $state(-1);
  let matches = $derived(
    items.filter((item) =>
      item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
    ),
  );
  $effect(() => {
    if (!open) query = items.find((item) => item.value === value)?.label ?? '';
  });
  $effect(() => {
    if (disabled) open = false;
  });
  $effect(() => {
    const valid = items.some((item) => item.value === value && !item.disabled);
    input?.setCustomValidity(
      (required || query.length > 0) && !valid
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
    const form = input.form;
    const reset = () => {
      value = initial;
      open = false;
    };
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
  function select(item: Item) {
    if (!item.disabled) {
      value = item.value;
      query = item.label;
      open = false;
      input.focus();
    }
  }
  function move(direction: number) {
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
  <input
    bind:this={input}
    {id}
    role="combobox"
    aria-autocomplete="list"
    aria-expanded={open}
    aria-controls={open ? `${id}-list` : undefined}
    aria-activedescendant={open && matches[active]
      ? `${id}-option-${active}`
      : undefined}
    aria-invalid={!!errorMessage}
    aria-errormessage={errorMessage ? `${id}-error` : undefined}
    aria-describedby={errorMessage ? `${id}-error` : undefined}
    {disabled}
    {required}
    {placeholder}
    value={query}
    autocomplete="off"
    oninput={(event) => {
      query = event.currentTarget.value;
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
  />
  <input type="hidden" {name} value={value ?? ''} {disabled} />
  {#if open}
    <div id={`${id}-list`} role="listbox" aria-label={label} class="mg-options">
      {#each matches as item, i}<button
          type="button"
          role="option"
          id={`${id}-option-${i}`}
          tabindex="-1"
          class:mg-option-active={i === active}
          aria-selected={value === item.value}
          disabled={item.disabled}
          onpointerdown={(e) => e.preventDefault()}
          onclick={() => select(item)}>{item.label}</button
        >{/each}
      {#if !matches.length}<div class="mg-empty" role="status">
          No results
        </div>{/if}
    </div>
  {/if}
  {#if errorMessage}<span class="mg-error" id={`${id}-error`}
      >{errorMessage}</span
    >{/if}
</div>
