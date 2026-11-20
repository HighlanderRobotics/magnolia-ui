<script lang="ts">
  import { onMount } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  const uid = $props.id();
  let {
    group = $bindable<string | null>(null),
    value,
    label,
    error,
    id = uid,
    onchange,
    ...rest
  }: Omit<HTMLInputAttributes, 'type' | 'value' | 'checked' | 'onchange'> & {
    group?: string | null;
    value: string;
    label: string;
    error?: string;
    onchange?: (event: Event) => void;
  } = $props();
  let input = $state<HTMLInputElement>();
  onMount(() => {
    const initial = group,
      form = input?.form;
    if (input) input.defaultChecked = initial === value;
    const reset = () => (group = initial);
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
</script>

<div class="mg2-choice-field">
  <label
    class="mg2-choice mg2-radio"
    for={id}
    data-disabled={!!rest.disabled}
    data-error={!!error}
  >
    <input
      bind:this={input}
      {...rest}
      {id}
      {value}
      type="radio"
      checked={group === value}
      aria-describedby={[rest['aria-describedby'], error ? `${id}-error` : null]
        .filter(Boolean)
        .join(' ') || undefined}
      onchange={(event) => {
        if (event.currentTarget.checked) group = value;
        onchange?.(event);
      }}
    />
    <span class="mg2-choice-box" aria-hidden="true"
      ><Glyph name="radio-box" /><Glyph name="radio-dot" /></span
    ><span>{label}</span>
  </label>
  {#if error}<span class="mg2-field-help" data-error="true" id={`${id}-error`}
      >{error}</span
    >{/if}
</div>
