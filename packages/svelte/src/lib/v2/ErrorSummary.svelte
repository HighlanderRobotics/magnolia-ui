<script lang="ts">
  import { tick } from 'svelte';
  import Glyph from './Glyph.svelte';
  const id = $props.id();
  let {
    errors,
    title,
    autofocus = true,
    focusKey = 0,
    onfield,
  }: {
    errors: readonly { id: string; label: string; message: string }[];
    title?: string;
    autofocus?: boolean;
    focusKey?: number;
    onfield?: (
      error: { id: string; label: string; message: string },
      event: MouseEvent,
    ) => void;
  } = $props();
  let region = $state<HTMLDivElement>(null!);
  const hasErrors = $derived(errors.length > 0);
  export function focus() {
    region?.focus();
  }
  $effect(() => {
    void focusKey;
    if (!hasErrors || !autofocus) return;
    let active = true;
    tick().then(() => {
      if (active) focus();
    });
    return () => {
      active = false;
    };
  });
</script>

{#if hasErrors}<div
    bind:this={region}
    class="mg2-error-summary"
    role="alert"
    tabindex="-1"
    aria-labelledby={`${id}-title`}
  >
    <span class="mg2-error-summary-icon"><Glyph name="error-summary" /></span>
    <div class="mg2-error-summary-body">
      <h2 id={`${id}-title`}>
        {title ??
          `Fix ${errors.length} ${errors.length === 1 ? 'field' : 'fields'} to continue`}
      </h2>
      <ul>
        {#each errors as error (error.id)}<li>
            <a
              href={`#${encodeURIComponent(error.id)}`}
              onclick={(e) => {
                onfield?.(error, e);
                if (e.defaultPrevented) return;
                const field = document.getElementById(error.id);
                if (field) {
                  e.preventDefault();
                  field.focus();
                  field.scrollIntoView({ block: 'center' });
                }
              }}
              ><span><strong>{error.label}</strong> — {error.message}</span></a
            >
          </li>{/each}
      </ul>
    </div>
  </div>{/if}
