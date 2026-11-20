<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import BasePopover from '../Popover.svelte';
  const id = $props.id();
  let {
    open = $bindable(false),
    title,
    body,
    trigger,
    children,
    actions,
    initialFocus,
  }: {
    open?: boolean;
    title: string;
    body?: string;
    trigger: Snippet<[HTMLButtonAttributes]>;
    children?: Snippet;
    actions?: Snippet<[() => void]>;
    initialFocus?: string;
  } = $props();
</script>

<BasePopover
  bind:open
  label={title}
  labelledby={`${id}-title`}
  describedby={body ? `${id}-body` : undefined}
  {trigger}
  {initialFocus}
  class="mg2-popover"
>
  <h2 id={`${id}-title`}>{title}</h2>
  {#if body}<p class="mg2-popover-body" id={`${id}-body`}>{body}</p>{/if}
  {@render children?.()}
  {#if actions}<div class="mg2-overlay-actions">
      {@render actions(() => (open = false))}
    </div>{/if}
</BasePopover>
