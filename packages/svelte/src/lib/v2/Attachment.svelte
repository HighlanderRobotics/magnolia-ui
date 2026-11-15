<script lang="ts">
  import Glyph from './Glyph.svelte';
  import Button from './Button.svelte';
  import ProgressBar from './ProgressBar.svelte';
  let {
    name,
    detail,
    state = 'done',
    progress,
    src,
    error = 'Upload failed',
    onRemove,
    onRetry,
  }: {
    name: string;
    detail?: string;
    state?: 'uploading' | 'done' | 'failed' | 'image';
    progress?: number;
    src?: string;
    error?: string;
    onRemove: () => void;
    onRetry?: () => void;
  } = $props();
</script>

<div
  class="mg2-attachment"
  data-state={state}
  aria-busy={state === 'uploading'}
>
  <span class="mg2-attachment-thumb"
    >{#if src}<img {src} alt="" />{:else}<Glyph
        name={state === 'image' ? 'attachment-image' : 'attachment-file'}
      />{/if}</span
  >
  <div class="mg2-attachment-text">
    <div class="mg2-attachment-name-row">
      <span class="mg2-attachment-name" title={name}>{name}</span
      >{#if detail && state !== 'failed'}<span class="mg2-attachment-detail"
          >{detail}</span
        >{/if}
    </div>
    {#if state === 'uploading'}<ProgressBar
        label={`Uploading ${name}`}
        value={progress}
        tone="accent"
      />{:else if state === 'failed'}<span
        class="mg2-attachment-error"
        role="alert">{error}</span
      >{/if}
  </div>
  <div class="mg2-attachment-actions">
    {#if state === 'failed' && onRetry}<Button
        variant="tertiary"
        size="medium"
        onclick={onRetry}
        >{#snippet icon()}<Glyph
            name="attachment-retry"
          />{/snippet}Retry</Button
      >{/if}<button
      type="button"
      class="mg2-attachment-remove"
      aria-label={`Remove ${name}`}
      onclick={onRemove}><Glyph name="attachment-remove" /></button
    >
  </div>
</div>
