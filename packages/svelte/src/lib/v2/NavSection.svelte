<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { label, ...rest }: HTMLAttributes<HTMLDivElement> & { label: string } =
    $props();
</script>

<div {...rest} class={`mg2-nav-section ${rest.class ?? ''}`}>{label}</div>
