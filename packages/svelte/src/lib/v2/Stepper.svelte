<script lang="ts">
  import { onMount } from 'svelte';
  import IconButton from './IconButton.svelte';
  import Glyph from './Glyph.svelte';
  let {
    label,
    value = $bindable(0),
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    disabled = false,
    name,
    onchange,
  }: {
    label: string;
    value?: number;
    min?: number;
    max?: number;
    disabled?: boolean;
    name?: string;
    onchange?: (value: number) => void;
  } = $props();
  let input = $state<HTMLInputElement>();
  let amount = $derived(
    Math.max(
      min,
      Math.min(max, Number.isFinite(value) ? Math.round(value) : min),
    ),
  );
  function change(next: number) {
    value = Math.max(min, Math.min(max, next));
    onchange?.(value);
  }
  onMount(() => {
    const initial = value,
      form = input?.form;
    const reset = () => (value = initial);
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
</script>

<div
  class="mg2-stepper"
  role="group"
  aria-label={label}
  data-disabled={disabled}
>
  <input bind:this={input} type="hidden" {name} value={amount} {disabled} />
  <IconButton
    label={`Decrease ${label}`}
    variant="secondary"
    disabled={disabled || amount <= min}
    onclick={() => change(amount - 1)}
    >{#snippet icon()}<Glyph name="step-minus" />{/snippet}</IconButton
  >
  <output aria-live="polite" aria-label={label}>{amount}</output>
  <IconButton
    label={`Increase ${label}`}
    variant="secondary"
    disabled={disabled || amount >= max}
    onclick={() => change(amount + 1)}
    >{#snippet icon()}<Glyph name="step-plus" />{/snippet}</IconButton
  >
</div>
