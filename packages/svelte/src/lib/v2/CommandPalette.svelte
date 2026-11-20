<script lang="ts">
  import { tick } from 'svelte';
  import {
    commandResults,
    type CommandData,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import type { GlyphName } from './glyphs.js';
  import BaseDialog from '../Dialog.svelte';
  import CommandItem from './CommandItem.svelte';
  import Glyph from './Glyph.svelte';
  import Kbd from './Kbd.svelte';
  const id = $props.id();
  let {
    open = $bindable(false),
    query = $bindable(''),
    items,
    label = 'Commands',
    placeholder = 'Search or jump to…',
    emptyMessage = 'No matching commands',
    loading = false,
    shortcut = true,
    canClose = true,
    onselect,
    onclose,
  }: {
    open?: boolean;
    query?: string;
    items: readonly (CommandData & { icon?: GlyphName })[];
    label?: string;
    placeholder?: string;
    emptyMessage?: string;
    loading?: boolean;
    shortcut?: boolean;
    canClose?: boolean;
    onselect?: (
      item: CommandData,
      options: { panel: boolean },
    ) => boolean | void;
    onclose?: () => void;
  } = $props();
  let activeId = $state<string | null>(null),
    input: HTMLInputElement;
  const results = $derived(loading ? [] : commandResults(items, query));
  const enabled = $derived(results.filter((item) => !item.disabled));
  const active = $derived(
    enabled.find((item) => item.id === activeId) ?? enabled[0],
  );
  $effect(() => {
    if (open) {
      query = '';
      activeId = null;
    }
  });
  $effect(() => {
    void query;
    activeId = null;
  });
  $effect(() => {
    const current = active;
    if (open && current)
      tick().then(() => {
        document
          .getElementById(`${id}-result-${encodeURIComponent(current.id)}`)
          ?.scrollIntoView({ block: 'nearest' });
      });
  });
  function choose(item: CommandData | undefined, panel = false) {
    if (!item || item.disabled || loading) return;
    if (onselect?.(item, { panel }) !== false) open = false;
  }
  function keydown(e: KeyboardEvent) {
    if (e.isComposing) return;
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      const index = enabled.findIndex((item) => item.id === active?.id);
      const next =
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? enabled.length - 1
            : (index + (e.key === 'ArrowDown' ? 1 : -1) + enabled.length) %
              enabled.length;
      activeId = enabled[next]?.id ?? null;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(active, e.metaKey || e.ctrlKey);
    }
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (
      shortcut &&
      !e.defaultPrevented &&
      !e.isComposing &&
      (e.metaKey || e.ctrlKey) &&
      !e.altKey &&
      e.key.toLowerCase() === 'k'
    ) {
      e.preventDefault();
      if (!open) open = true;
      else if (canClose) open = false;
    }
  }}
/>
<BaseDialog
  bind:open
  {canClose}
  {onclose}
  ariaLabel={label}
  initialFocus="[data-mg2-command-input]"
  class="mg2-command-palette"
>
  <div class="mg2-command-search">
    <Glyph name="command-search" />
    <input
      bind:this={input}
      bind:value={query}
      aria-label={label}
      {placeholder}
      role="combobox"
      aria-autocomplete="list"
      aria-expanded="true"
      aria-controls={`${id}-results`}
      aria-activedescendant={active
        ? `${id}-result-${encodeURIComponent(active.id)}`
        : undefined}
      data-mg2-command-input
      onkeydown={keydown}
      autocomplete="off"
    />
    <Kbd key="Esc" />
    <button
      type="button"
      class="mg2-command-mobile-close"
      aria-label="Close commands"
      onclick={() => (open = false)}>Close</button
    >
  </div>
  <div
    class="mg2-command-results"
    id={`${id}-results`}
    role="listbox"
    aria-label={`${label} results`}
    aria-busy={loading}
  >
    {#each results as item, i (item.id)}
      {#if item.group && (i === 0 || item.group !== results[i - 1].group)}<div
          role="presentation"
          class="mg2-command-group"
        >
          {item.group}
        </div>{/if}
      <CommandItem
        id={`${id}-result-${encodeURIComponent(item.id)}`}
        label={item.label}
        meta={item.meta}
        shortcut={item.shortcut}
        disabled={item.disabled}
        role="option"
        aria-selected={active?.id === item.id}
        tabindex={-1}
        active={active?.id === item.id}
        onpointermove={() => {
          if (!item.disabled) activeId = item.id;
        }}
        onmousedown={(e) => e.preventDefault()}
        onclick={(e) => {
          input.focus();
          choose(item, e.metaKey || e.ctrlKey);
        }}
        >{#snippet icon()}<Glyph
            name={item.icon ?? 'command-file'}
          />{/snippet}</CommandItem
      >
    {/each}
  </div>
  {#if !results.length}<p class="mg2-command-empty" role="status">
      {loading ? 'Searching…' : emptyMessage}
    </p>{/if}
  <footer class="mg2-command-footer" aria-hidden="true">
    <span
      ><span class="mg2-command-arrow"><Glyph name="command-up" /></span><span
        class="mg2-command-arrow"><Glyph name="command-down" /></span
      >Navigate</span
    >
    <span><Kbd key="Enter" />Open</span>
    <span><Kbd key="Enter" modifier />Open in panel</span>
  </footer>
</BaseDialog>
