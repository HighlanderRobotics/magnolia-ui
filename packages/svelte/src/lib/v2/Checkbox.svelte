<script lang="ts">
  import { onMount } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  const uid = $props.id();
  let {
    checked = $bindable(false),
    indeterminate = $bindable(false),
    label,
    error,
    id = uid,
    onchange,
    ...rest
  }: Omit<HTMLInputAttributes, 'type' | 'onchange'> & {
    label: string;
    indeterminate?: boolean;
    error?: string;
    onchange?: (event: Event) => void;
  } = $props();
  let input = $state<HTMLInputElement>();
  onMount(() => {
    const initial = checked,
      initialMixed = indeterminate,
      form = input?.form;
    if (input) input.defaultChecked = !!initial;
    const reset = () => {
      checked = initial;
      indeterminate = initialMixed;
    };
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
  $effect(() => {
    if (input) input.indeterminate = indeterminate;
  });
</script>

<div class="mg2-choice-field">
  <label
    class="mg2-choice"
    for={id}
    data-disabled={!!rest.disabled}
    data-error={!!error}
  >
    <input
      {...rest}
      {id}
      bind:this={input}
      type="checkbox"
      bind:checked
      aria-invalid={!!error}
      aria-describedby={[rest['aria-describedby'], error ? `${id}-error` : null]
        .filter(Boolean)
        .join(' ') || undefined}
      onchange={(event) => {
        indeterminate = false;
        onchange?.(event);
      }}
    />
    <span class="mg2-choice-box" aria-hidden="true"
      ><Glyph name={indeterminate ? 'mixed' : 'check'} /></span
    >
    <span>{label}</span>
  </label>
  {#if error}<span class="mg2-field-help" data-error="true" id={`${id}-error`}
      >{error}</span
    >{/if}
</div>
