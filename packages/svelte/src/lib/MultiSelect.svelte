<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';
  const uid = $props.id();
  let {
    value = $bindable<string[]>([]),
    items,
    label,
    errorMessage,
    id = uid,
    'aria-describedby': describedby,
    ...rest
  }: Omit<HTMLSelectAttributes, 'value' | 'multiple' | 'children'> & {
    value?: string[];
    label: string;
    errorMessage?: string;
    items: { value: string; label: string; disabled?: boolean }[];
  } = $props();
</script>

<div class="mg-field mg-multi-field">
  <label for={id}>{label}</label>
  <select
    {...rest}
    {id}
    multiple
    bind:value
    aria-invalid={!!errorMessage}
    aria-errormessage={errorMessage ? `${id}-error` : undefined}
    aria-describedby={[describedby, errorMessage ? `${id}-error` : null]
      .filter(Boolean)
      .join(' ') || undefined}
  >
    {#each items as item}<option value={item.value} disabled={item.disabled}
        >{item.label}</option
      >{/each}
  </select>
  {#if errorMessage}<span class="mg-error" id={`${id}-error`}
      >{errorMessage}</span
    >{/if}
</div>
