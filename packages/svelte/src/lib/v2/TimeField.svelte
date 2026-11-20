<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import TemporalField from './TemporalField.svelte';
  let {
    value = $bindable<string | undefined>(undefined),
    ...rest
  }: Omit<ComponentProps<typeof TemporalField>, 'kind'> = $props();
</script>

<TemporalField {...rest} kind="time" bind:value />
