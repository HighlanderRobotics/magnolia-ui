<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  let {
    title,
    description,
    action,
    children,
    class: className = '',
    ...rest
  }: HTMLAttributes<HTMLElement> & {
    title?: string;
    description?: string;
    action?: Snippet;
    children?: Snippet;
  } = $props();
</script>

<section {...rest} class="mg2-card {className}">
  {#if title || action}<div class="mg2-card-header">
      <div>
        {#if title}<h3>{title}</h3>{/if}{#if description}<p>
            {description}
          </p>{/if}
      </div>
      {#if action}<div>{@render action()}</div>{/if}
    </div>{/if}
  {@render children?.()}
</section>
