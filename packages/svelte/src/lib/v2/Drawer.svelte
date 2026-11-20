<script lang="ts">
  import type { Snippet } from 'svelte';
  import BaseDialog from '../Dialog.svelte';
  import Stat from './Stat.svelte';
  import IconButton from './IconButton.svelte';
  import Tooltip from './Tooltip.svelte';
  import Glyph from './Glyph.svelte';
  const id = $props.id();
  let {
    open = $bindable(false),
    title,
    subtitle,
    children,
    actions,
    metrics = [],
    details = [],
    height = 640,
    canClose = true,
    onclose,
    onopenfull,
  }: {
    open?: boolean;
    title: string;
    subtitle?: string;
    children?: Snippet;
    actions?: Snippet<[() => void]>;
    metrics?: readonly {
      label: string;
      value?: string | number | null;
      unit?: string;
    }[];
    details?: readonly { label: string; value?: string | number | null }[];
    height?: number;
    canClose?: boolean;
    onclose?: () => void;
    onopenfull?: (event: MouseEvent) => void;
  } = $props();
  function close() {
    open = false;
  }
</script>

<BaseDialog
  bind:open
  {canClose}
  {onclose}
  labelledby={`${id}-title`}
  describedby={subtitle ? `${id}-subtitle` : undefined}
  initialFocus="[data-mg2-drawer-title]"
  class="mg2-drawer"
  style={`height:${Number.isFinite(height) ? Math.max(1, height) : 640}px`}
>
  <header class="mg2-drawer-header">
    <div class="mg2-panel-titles">
      <h2 id={`${id}-title`} data-mg2-drawer-title tabindex="-1">{title}</h2>
      {#if subtitle}<p id={`${id}-subtitle`}>{subtitle}</p>{/if}
    </div>
    {#if onopenfull}<Tooltip label={`Open ${title} in full page`}
        >{#snippet trigger(attrs)}<IconButton
            {...attrs}
            label={`Open ${title} in full page`}
            variant="tertiary"
            onclick={(e) => {
              onopenfull?.(e);
              if (!e.defaultPrevented) close();
            }}
            >{#snippet icon()}<Glyph name="drawer-open" />{/snippet}</IconButton
          >{/snippet}</Tooltip
      >{/if}
    <Tooltip label={`Close ${title}`}>
      {#snippet trigger(attrs)}<IconButton
          {...attrs}
          label={`Close ${title}`}
          variant="tertiary"
          onclick={close}
          >{#snippet icon()}<Glyph name="drawer-close" />{/snippet}</IconButton
        >{/snippet}
    </Tooltip>
  </header>
  <div class="mg2-drawer-content">
    {#if metrics.length}<div class="mg2-drawer-stats">
        {#each metrics as metric}<div>
            <Stat {...metric} size="medium" />
          </div>{/each}
      </div>{/if}
    {#if details.length}<dl class="mg2-drawer-details">
        {#each details as detail}<div>
            <dt>{detail.label}</dt>
            <dd>
              {#if detail.value == null}<span aria-hidden="true">—</span><span
                  class="mg2-sr-only">No data</span
                >{:else}{detail.value}{/if}
            </dd>
          </div>{/each}
      </dl>{/if}
    {@render children?.()}
  </div>
  {#if actions}<footer class="mg2-drawer-footer">
      {@render actions(close)}
    </footer>{/if}
</BaseDialog>
