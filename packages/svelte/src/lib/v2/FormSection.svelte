<script lang="ts">
  import type { Snippet } from 'svelte';
  const id = $props.id();
  let {
    title,
    description,
    children,
  }: { title: string; description?: string; children?: Snippet } = $props();
</script>

<div
  role="group"
  aria-labelledby={`${id}-title`}
  aria-describedby={description ? `${id}-description` : undefined}
  class="mg2-form-section"
>
  <header>
    <h2 id={`${id}-title`}>{title}</h2>
    {#if description}<p id={`${id}-description`}>{description}</p>{/if}
  </header>
  <div class="mg2-form-fields">{@render children?.()}</div>
</div>
