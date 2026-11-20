<script lang="ts">
  import { tick } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLTdAttributes } from 'svelte/elements';
  let {
    value = $bindable(''),
    variant = 'text',
    children,
    editable = false,
    label = 'Edit cell',
    oncommit,
    ...rest
  }: HTMLTdAttributes & {
    value?: string;
    variant?: 'text' | 'secondary' | 'numeric';
    children?: Snippet;
    editable?: boolean;
    label?: string;
    oncommit?: (value: string) => void;
  } = $props();
  let editing = $state(false),
    draft = $state(''),
    button = $state<HTMLButtonElement>(null!);
  async function start() {
    draft = value;
    editing = true;
  }
  function focus(input: HTMLInputElement) {
    input.focus();
    input.select();
  }
  async function finish(commit: boolean, restore = false) {
    if (!editing) return;
    editing = false;
    if (commit && draft !== value) {
      value = draft;
      oncommit?.(draft);
    }
    if (restore) {
      await tick();
      button?.focus();
    }
  }
</script>

<td
  {...rest}
  class={`mg2-table-cell ${rest.class ?? ''}`}
  data-variant={variant}
  data-editing={editing}
>
  {#if editing}<input
      aria-label={label}
      bind:value={draft}
      use:focus
      onblur={() => finish(true)}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          void finish(e.key === 'Enter', true);
        }
      }}
    />{:else if editable}<button
      type="button"
      class="mg2-cell-edit"
      aria-label={`${label}: ${value}`}
      bind:this={button}
      onclick={start}>{value}</button
    >{:else if children}{@render children()}{:else}{value}{/if}
</td>
