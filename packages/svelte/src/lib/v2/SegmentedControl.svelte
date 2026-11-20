<script lang="ts">
  import type { Snippet } from 'svelte';
  import Tabs from '../Tabs.svelte';
  let {
    value = $bindable(''),
    label,
    items,
    children,
  }: {
    value?: string;
    label: string;
    items: { value: string; label: string; disabled?: boolean }[];
    children?: Snippet<[string]>;
  } = $props();
</script>

<div class="mg2-segmented"><Tabs bind:value {label} {items} {children} /></div>
