<script lang="ts">
  import Glyph from './Glyph.svelte';
  let {
    items,
    current = 0,
    label = 'Progress',
  }: { items: string[]; current?: number; label?: string } = $props();
  let active = $derived(
    Math.max(
      0,
      Math.min(
        items.length - 1,
        Number.isFinite(current) ? Math.floor(current) : 0,
      ),
    ),
  );
</script>

<ol class="mg2-steps" aria-label={label}>
  {#each items as item, i}<li
      aria-current={i === active ? 'step' : undefined}
      data-state={i < active ? 'done' : i === active ? 'current' : 'future'}
    >
      <span class="mg2-step-dot" aria-hidden="true"
        >{#if i < active}<Glyph name="steps-check" />{:else}{i + 1}{/if}</span
      ><span class="mg2-step-label">{item}</span><span class="mg2-sr-only"
        >{i < active
          ? ': completed'
          : i === active
            ? ': current'
            : ': not started'}</span
      >{#if i < items.length - 1}<span
          class="mg2-step-connector"
          aria-hidden="true"
        ></span>{/if}
    </li>{/each}
</ol>
