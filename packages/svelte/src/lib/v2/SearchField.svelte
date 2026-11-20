<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  import Kbd from './Kbd.svelte';
  const uid = $props.id();
  let {
    value = $bindable(''),
    label,
    shortcut,
    id = uid,
    oninput,
    ...rest
  }: Omit<HTMLInputAttributes, 'value' | 'type'> & {
    label: string;
    value?: string;
    shortcut?: string;
  } = $props();
  let input = $state<HTMLInputElement>();
  let focused = $state(false);
</script>

<div class="mg2-search" data-disabled={!!rest.disabled}>
  <Glyph name="search" />
  <input
    {...rest}
    {id}
    bind:this={input}
    type="search"
    bind:value
    aria-label={label}
    {oninput}
    onfocus={(event) => {
      focused = true;
      rest.onfocus?.(event);
    }}
    onblur={(event) => {
      focused = false;
      rest.onblur?.(event);
    }}
  />
  {#if value}<button
      type="button"
      aria-label={`Clear ${label}`}
      disabled={rest.disabled}
      onpointerdown={(event) => event.preventDefault()}
      onclick={() => {
        value = '';
        if (input) {
          input.value = '';
          input.focus();
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }}><Glyph name="clear" /></button
    >
  {:else if shortcut && !focused}<Kbd
      key={shortcut}
      modifier
      variant="field"
    />{/if}
</div>
