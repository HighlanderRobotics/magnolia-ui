<script lang="ts">
  const uid = $props.id();
  import type { HTMLInputAttributes } from 'svelte/elements';
  let {
    checked = $bindable(false),
    label,
    id = uid,
    ...rest
  }: Omit<HTMLInputAttributes, 'type'> & { label: string } = $props();
</script>

<label class="mg-check" for={id}
  ><input {...rest} {id} type="checkbox" bind:checked />{label}</label
>
