<script lang="ts">
  import { onMount } from 'svelte';
  import Glyph from './Glyph.svelte';
  type Item = { value: string; label: string; disabled?: boolean };
  const id = $props.id();
  let {
    label,
    items,
    value = $bindable<string | null>(null),
    placeholder = 'Choose an option',
    disabled = false,
    required = false,
    name,
    error,
    helper,
  }: {
    label: string;
    items: Item[];
    value?: string | null;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    error?: string;
    helper?: string;
  } = $props();
  let root = $state<HTMLDivElement>(null!),
    button = $state<HTMLButtonElement>(null!),
    select = $state<HTMLSelectElement>(null!);
  let open = $state(false),
    active = $state(-1);
  let selected = $derived(items.find((i) => i.value === value));
  let invalid = $state(false);
  let message = $derived(
    error ?? (invalid ? 'Choose an available option.' : undefined),
  );
  $effect(() => {
    if (selected && !selected.disabled) invalid = false;
    select?.setCustomValidity(
      value !== null && (!selected || selected.disabled)
        ? 'Choose an available option.'
        : '',
    );
  });
  $effect(() => {
    if (disabled) open = false;
  });
  $effect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.contains(event.target as Node)) open = false;
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
    const form = select.form;
    const reset = () => {
      value = initial;
      open = false;
    };
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
  function choose(i: number) {
    const item = items[i];
    if (!item || item.disabled) return;
    value = item.value;
    open = false;
    button.focus();
  }
  function move(direction: number) {
    const enabled = items
      .map((x, i) => (x.disabled ? -1 : i))
      .filter((i) => i >= 0);
    const current = enabled.indexOf(active);
    active =
      (current < 0
        ? direction > 0
          ? enabled[0]
          : enabled.at(-1)
        : enabled[(current + direction + enabled.length) % enabled.length]) ??
      -1;
  }
  function keydown(event: KeyboardEvent) {
    if (event.isComposing) return;
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      open = true;
      move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      open = true;
      active =
        event.key === 'Home'
          ? items.findIndex((i) => !i.disabled)
          : (items
              .map((item, i) => (item.disabled ? -1 : i))
              .filter((i) => i >= 0)
              .at(-1) ?? -1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(active);
      else {
        open = true;
        active = items.findIndex((i) => i.value === value && !i.disabled);
        if (active < 0) move(1);
      }
    } else if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        event.stopPropagation();
        open = false;
      }
    } else if (event.key === 'Tab') open = false;
    else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const start = Math.max(
        active,
        items.findIndex((i) => i.value === value),
      );
      for (let offset = 1; offset <= items.length; offset++) {
        const i = (start + offset) % items.length;
        if (
          !items[i].disabled &&
          items[i].label
            .toLocaleLowerCase()
            .startsWith(event.key.toLocaleLowerCase())
        ) {
          event.preventDefault();
          if (open) active = i;
          else value = items[i].value;
          break;
        }
      }
    }
  }
</script>

<div
  class="mg2-field mg2-select"
  bind:this={root}
  data-disabled={disabled}
  onfocusout={(event) => {
    if (!root.contains(event.relatedTarget as Node)) open = false;
  }}
>
  <label id={`${id}-label`} for={`${id}-button`}>{label}</label>
  <button
    bind:this={button}
    type="button"
    id={`${id}-button`}
    role="combobox"
    aria-labelledby={`${id}-label ${id}-value`}
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-controls={open ? `${id}-list` : undefined}
    aria-activedescendant={open && active >= 0
      ? `${id}-option-${active}`
      : undefined}
    aria-invalid={!!message}
    aria-describedby={message || helper ? `${id}-help` : undefined}
    {disabled}
    class="mg2-select-button"
    data-placeholder={!selected}
    onkeydown={keydown}
    onclick={() => {
      open = !open;
      active = items.findIndex((i) => i.value === value && !i.disabled);
      if (active < 0) move(1);
    }}
  >
    <span id={`${id}-value`}>{selected?.label ?? placeholder}</span><span
      class="mg2-select-arrow"
      data-open={open}><Glyph name="chevron-down" /></span
    >
  </button>
  <select
    class="mg2-native-select"
    bind:this={select}
    {name}
    {disabled}
    {required}
    bind:value
    tabindex="-1"
    aria-hidden="true"
    oninvalid={(event) => {
      event.preventDefault();
      invalid = true;
      button.focus();
    }}
  >
    <option value={null} disabled>{placeholder}</option
    >{#each items as item}<option value={item.value} disabled={item.disabled}
        >{item.label}</option
      >{/each}
  </select>
  {#if open}<div
      role="listbox"
      aria-labelledby={`${id}-label`}
      id={`${id}-list`}
      class="mg2-listbox"
    >
      {#each items as item, i}<button
          type="button"
          role="option"
          tabindex="-1"
          id={`${id}-option-${i}`}
          aria-selected={value === item.value}
          disabled={item.disabled}
          data-active={active === i}
          onpointerdown={(event) => event.preventDefault()}
          onclick={() => choose(i)}
          >{item.label}{#if value === item.value}<Glyph
              name="option-check"
            />{/if}</button
        >{/each}
      {#if !items.length}<span class="mg2-field-help">No options</span>{/if}
    </div>{/if}
  {#if message || helper}<span
      class="mg2-field-help"
      data-error={!!message}
      id={`${id}-help`}
      >{#if message}<Glyph name="error" />{/if}{message || helper}</span
    >{/if}
</div>
