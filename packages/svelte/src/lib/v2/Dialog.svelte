<script lang="ts">
  import type { Snippet } from 'svelte';
  import BaseDialog from '../Dialog.svelte';
  const id = $props.id();
  let {
    open = $bindable(false),
    title,
    body,
    children,
    actions,
    canClose = true,
    onclose,
    initialFocus = 'button:not(:disabled):not([data-variant="danger"]), [data-mg2-initial-focus]',
  }: {
    open?: boolean;
    title: string;
    body?: string;
    children?: Snippet;
    actions?: Snippet<[() => void]>;
    canClose?: boolean;
    onclose?: () => void;
    initialFocus?: string;
  } = $props();
  function close() {
    open = false;
  }
</script>

<BaseDialog
  bind:open
  {title}
  {canClose}
  {onclose}
  {initialFocus}
  describedby={body ? `${id}-body` : undefined}
  class="mg2-dialog"
>
  {#if body}<p class="mg2-dialog-body" id={`${id}-body`}>{body}</p>{/if}
  {@render children?.()}
  {#if actions}<div class="mg2-overlay-actions mg2-dialog-actions">
      {@render actions(close)}
    </div>{/if}
</BaseDialog>
