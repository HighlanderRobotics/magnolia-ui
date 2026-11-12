<script lang="ts">
  const uid = $props.id();
  import type { HTMLInputAttributes } from 'svelte/elements';
  let {
    value = $bindable(''),
    placeholder = '',
    errorMessage = null,
    ariaLabel = null,
    label,
    id = uid,
    type = 'text',
    'aria-describedby': describedby,
    ...rest
  }: Omit<HTMLInputAttributes, 'value' | 'id'> & {
    value?: string;
    id?: string | null;
    ariaLabel?: string | null;
    label?: string;
    errorMessage?: string | null;
  } = $props();
  let controlId = $derived(id ?? uid);
  let errorId = $derived(controlId + '-error');
</script>

<div class="mg-field">
  {#if label}<label for={controlId}>{label}</label>{/if}
  <input
    {...rest}
    {...{ type }}
    id={controlId}
    bind:value
    aria-label={ariaLabel ?? rest['aria-label'] ?? undefined}
    aria-invalid={!!errorMessage}
    aria-errormessage={errorMessage ? errorId : undefined}
    aria-describedby={[describedby, errorMessage ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined}
    {placeholder}
  />
  {#if errorMessage}<span class="mg-error" id={errorId}>{errorMessage}</span
    >{/if}
</div>
