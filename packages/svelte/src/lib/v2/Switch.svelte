<script lang="ts">
  import { onMount } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  const uid = $props.id();
  let {
    checked = $bindable(false),
    label,
    id = uid,
    ...rest
  }: Omit<HTMLInputAttributes, 'type'> & { label: string } = $props();
  let input = $state<HTMLInputElement>();
  onMount(() => {
    const initial = checked,
      form = input?.form;
    if (input) input.defaultChecked = !!initial;
    const reset = () => (checked = initial);
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
</script>

<label class="mg2-choice mg2-switch" for={id} data-disabled={!!rest.disabled}>
  <input
    {...rest}
    {id}
    bind:this={input}
    type="checkbox"
    role="switch"
    bind:checked
  />
  <span class="mg2-switch-control" aria-hidden="true"
    ><Glyph name="switch-track" /><span class="mg2-switch-thumb"
      ><Glyph name="switch-thumb" /></span
    ></span
  >
  <span>{label}</span>
</label>
