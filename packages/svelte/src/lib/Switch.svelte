<script lang="ts">
  const uid = $props.id();
  import type { HTMLInputAttributes } from 'svelte/elements';
  let {
    value = $bindable(false),
    disabled = false,
    ariaLabel,
    label,
    name,
    id = uid,
    onchange,
    ...rest
  }: Omit<HTMLInputAttributes, 'value' | 'checked' | 'onchange' | 'type'> & {
    value?: boolean;
    ariaLabel?: string | null;
    label?: string;
    onchange?: (event: Event) => void;
  } = $props();
</script>

<label class="mg-check" for={id}>
  <input
    {...rest}
    {id}
    {name}
    type="checkbox"
    role="switch"
    bind:checked={value}
    {disabled}
    aria-label={ariaLabel ?? rest['aria-label'] ?? label}
    {onchange}
  />
  {#if label}<span>{label}</span>{/if}
</label>
