<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    children,
    variant = 'info',
  }: { children?: Snippet; variant?: 'info' | 'danger' } = $props();
</script>

<div class="mg-alert" role={variant === 'danger' ? 'alert' : 'status'}>
  {@render children?.()}
</div>
