<script lang="ts">
  const uid = $props.id();
  import type { HTMLSelectAttributes } from 'svelte/elements';
  let {
    value = $bindable(null),
    placeholder = '',
    errorMessage = null,
    ariaLabel = null,
    label,
    id = uid,
    items = [],
    'aria-describedby': describedby,
    ...rest
  }: Omit<HTMLSelectAttributes, 'value' | 'id'> & {
    value?: string | null;
    id?: string | null;
    ariaLabel?: string | null;
    label?: string;
    errorMessage?: string | null;
    items?: { label: string; value: string; disabled?: boolean | null }[];
  } = $props();
  let controlId = $derived(id ?? uid);
  let errorId = $derived(controlId + '-error');
</script>

<div class="mg-field">
  {#if label}<label for={controlId}>{label}</label>{/if}
  <select
    {...rest}
    id={controlId}
    bind:value
    aria-label={ariaLabel ?? rest['aria-label'] ?? undefined}
    aria-invalid={!!errorMessage}
    aria-errormessage={errorMessage ? errorId : undefined}
    aria-describedby={[describedby, errorMessage ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined}
  >
    {#if placeholder}<option value={null} disabled hidden>{placeholder}</option
      >{/if}
    {#each items as item}<option
        value={item.value}
        disabled={item.disabled ?? false}>{item.label}</option
      >{/each}
  </select>
  {#if errorMessage}<span class="mg-error" id={errorId}>{errorMessage}</span
    >{/if}
</div>
