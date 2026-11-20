<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import { sheetSwipe } from '@highlanderrobotics/magnolia-tokens/v2';
  import BaseDialog from '../Dialog.svelte';
  import { MENU, type MenuContext } from '../menu-context.js';
  import IconButton from './IconButton.svelte';
  import Tooltip from './Tooltip.svelte';
  import Glyph from './Glyph.svelte';
  const id = $props.id();
  let {
    open = $bindable(false),
    title,
    subtitle,
    children,
    canClose = true,
    bottomInset = 34,
    onclose,
  }: {
    open?: boolean;
    title: string;
    subtitle?: string;
    children?: Snippet;
    canClose?: boolean;
    bottomInset?: number;
    onclose?: () => void;
  } = $props();
  let drag = $state(0),
    start: { id: number; x: number; y: number } | undefined;
  function close() {
    drag = 0;
    open = false;
  }
  setContext<MenuContext>(MENU, { close });
  function down(e: PointerEvent) {
    if (
      e.button !== 0 ||
      (e.target as Element).closest('button,a,input,select,textarea')
    )
      return;
    start = { id: e.pointerId, x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent) {
    if (start?.id === e.pointerId) drag = Math.max(0, e.clientY - start.y);
  }
  function up(e: PointerEvent) {
    if (start?.id !== e.pointerId) return;
    const dismiss =
      canClose && sheetSwipe(e.clientX - start.x, e.clientY - start.y);
    start = undefined;
    drag = 0;
    if (dismiss) close();
  }
  $effect(() => {
    if (!open) {
      drag = 0;
      start = undefined;
    }
  });
</script>

<BaseDialog
  bind:open
  {canClose}
  {onclose}
  labelledby={`${id}-title`}
  describedby={subtitle ? `${id}-subtitle` : undefined}
  initialFocus="[data-mg2-sheet-title]"
  class="mg2-sheet"
  style={`--mg2-sheet-drag:${drag}px;--mg2-sheet-bottom:${Number.isFinite(bottomInset) ? Math.max(0, bottomInset) : 34}px`}
>
  <div
    class="mg2-sheet-drag"
    role="group"
    aria-label={`${title} sheet header`}
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={() => {
      start = undefined;
      drag = 0;
    }}
  >
    <div class="mg2-sheet-grabber"><span></span></div>
    <header class="mg2-sheet-header">
      <div class="mg2-panel-titles">
        <h2 id={`${id}-title`} data-mg2-sheet-title tabindex="-1">{title}</h2>
        {#if subtitle}<p id={`${id}-subtitle`}>{subtitle}</p>{/if}
      </div>
      <Tooltip label={`Close ${title}`}>
        {#snippet trigger(attrs)}<IconButton
            {...attrs}
            label={`Close ${title}`}
            variant="tertiary"
            onclick={close}
            >{#snippet icon()}<Glyph name="sheet-close" />{/snippet}</IconButton
          >{/snippet}
      </Tooltip>
    </header>
  </div>
  <div class="mg2-sheet-content">{@render children?.()}</div>
</BaseDialog>
