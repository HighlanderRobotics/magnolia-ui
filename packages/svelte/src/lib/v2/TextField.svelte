<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import errorIcon from './assets/error.svg';
  const uid = $props.id();
  let {
    value = $bindable(''),
    label,
    helper,
    error,
    id = uid,
    class: className = '',
    'aria-describedby': describedby,
    ...rest
  }: Omit<HTMLInputAttributes, 'value'> & {
    value?: string;
    label: string;
    helper?: string;
    error?: string;
  } = $props();
</script>

<div class="mg2-field {className}" data-disabled={!!rest.disabled}>
  <label for={id}>{label}</label>
  <input
    {...rest}
    {id}
    bind:value
    aria-invalid={!!error}
    aria-describedby={[describedby, error || helper ? `${id}-help` : null]
      .filter(Boolean)
      .join(' ') || undefined}
    aria-errormessage={error ? `${id}-help` : undefined}
  />
  {#if error || helper}
    <span id={`${id}-help`} class="mg2-field-help" data-error={!!error}>
      {#if error}<span
          class="mg2-error-icon"
          aria-hidden="true"
          style={`--mg2-error-icon: url(${JSON.stringify(errorIcon)})`}
        ></span>{/if}{error || helper}
    </span>
  {/if}
</div>
