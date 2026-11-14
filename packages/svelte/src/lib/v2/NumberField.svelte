<script lang="ts">
  import { onMount } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  const uid = $props.id();
  let {
    value = $bindable<number | undefined>(undefined),
    label,
    unit,
    helper,
    error,
    id = uid,
    ...rest
  }: Omit<HTMLInputAttributes, 'type' | 'value'> & {
    value?: number;
    label: string;
    unit?: string;
    helper?: string;
    error?: string;
  } = $props();
  let input = $state<HTMLInputElement>();
  onMount(() => {
    const initial = value,
      form = input?.form;
    if (input)
      input.defaultValue = initial === undefined ? '' : String(initial);
    const reset = () => (value = initial);
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
</script>

<div class="mg2-field mg2-number-field" data-disabled={!!rest.disabled}>
  <label for={id}>{label}</label>
  <div class="mg2-number-control" data-error={!!error}>
    <input
      bind:this={input}
      {...rest}
      {id}
      type="number"
      inputmode="decimal"
      bind:value
      aria-invalid={!!error}
      aria-describedby={[
        rest['aria-describedby'],
        unit ? `${id}-unit` : null,
        error || helper ? `${id}-help` : null,
      ]
        .filter(Boolean)
        .join(' ') || undefined}
    />
    {#if unit}<span id={`${id}-unit`} class="mg2-number-unit">{unit}</span>{/if}
  </div>
  {#if error || helper}<span
      id={`${id}-help`}
      class="mg2-field-help"
      data-error={!!error}
      >{#if error}<Glyph name="error" />{/if}{error || helper}</span
    >{/if}
</div>
