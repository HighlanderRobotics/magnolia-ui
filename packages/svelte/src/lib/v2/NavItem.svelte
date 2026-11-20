<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Destination from './Destination.svelte';
  let props: Omit<ComponentProps<typeof Destination>, 'rail'> = $props();
</script>

<Destination {...props} />
