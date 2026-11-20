<script lang="ts">
  import type { Snippet } from 'svelte';
  const id = $props.id();
  let {
    value = $bindable(''),
    items,
    label,
    children,
  }: {
    value?: string;
    label: string;
    items: { value: string; label: string; disabled?: boolean }[];
    children?: Snippet<[string]>;
  } = $props();
  let selected = $derived(
    items.find((i) => i.value === value && !i.disabled)?.value ??
      items.find((i) => !i.disabled)?.value,
  );
  $effect(() => {
    if (selected !== undefined && value !== selected) value = selected;
  });
  function keydown(event: KeyboardEvent, index: number) {
    const enabled = items
      .map((item, i) => (item.disabled ? -1 : i))
      .filter((i) => i >= 0);
    const current = enabled.indexOf(index);
    const rtl =
      getComputedStyle(event.currentTarget as HTMLElement).direction === 'rtl';
    let next: number | undefined;
    if (event.key === 'Home') next = enabled[0];
    if (event.key === 'End') next = enabled.at(-1);
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const forward = (event.key === 'ArrowRight') !== rtl;
      next =
        enabled[
          (current + (forward ? 1 : -1) + enabled.length) % enabled.length
        ];
    }
    if (next !== undefined) {
      event.preventDefault();
      value = items[next].value;
      document.getElementById(`${id}-tab-${next}`)?.focus();
    }
  }
</script>

<div class="mg-tabs">
  <div role="tablist" aria-label={label} class="mg-tab-list">
    {#each items as item, i}
      <button
        type="button"
        class="mg-pill primary"
        role="tab"
        id={`${id}-tab-${i}`}
        aria-selected={selected === item.value}
        aria-controls={`${id}-panel-${i}`}
        disabled={item.disabled}
        tabindex={selected === item.value ? 0 : -1}
        onclick={() => (value = item.value)}
        onkeydown={(e) => keydown(e, i)}>{item.label}</button
      >
    {/each}
  </div>
  {#each items as item, i}
    <div
      role="tabpanel"
      id={`${id}-panel-${i}`}
      aria-labelledby={`${id}-tab-${i}`}
      hidden={selected !== item.value}
      tabindex="0"
    >
      {@render children?.(item.value)}
    </div>
  {/each}
</div>
