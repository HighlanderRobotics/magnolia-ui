<script lang="ts">
  import { onMount } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  const uid = $props.id();
  let {
    group = $bindable<string | null>(null),
    value,
    title,
    description,
    meta,
    id = uid,
    onchange,
    ...rest
  }: Omit<
    HTMLInputAttributes,
    'type' | 'value' | 'checked' | 'onchange' | 'title'
  > & {
    group?: string | null;
    value: string;
    title: string;
    description?: string;
    meta?: string;
    onchange?: (event: Event) => void;
  } = $props();
  let input = $state<HTMLInputElement>();
  onMount(() => {
    const initial = group,
      form = input?.form;
    if (input) input.defaultChecked = initial === value;
    const reset = () => (group = initial);
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
</script>

<label
  class="mg2-selectable-card"
  for={id}
  data-selected={group === value}
  data-disabled={!!rest.disabled}
>
  <input
    {...rest}
    bind:this={input}
    {id}
    {value}
    type="radio"
    checked={group === value}
    aria-labelledby={`${id}-title`}
    aria-describedby={[
      rest['aria-describedby'],
      description ? `${id}-description` : null,
      meta ? `${id}-meta` : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined}
    onchange={(event) => {
      if (event.currentTarget.checked) group = value;
      onchange?.(event);
    }}
  />
  <span class="mg2-card-indicator" aria-hidden="true"
    ><Glyph
      name={group === value ? 'card-selected' : 'card-unselected'}
    />{#if group === value}<Glyph name="card-dot" />{/if}</span
  >
  <span class="mg2-selectable-text"
    ><span class="mg2-selectable-title-row"
      ><span id={`${id}-title`} class="mg2-selectable-title">{title}</span
      >{#if meta}<span id={`${id}-meta`} class="mg2-selectable-meta"
          >{meta}</span
        >{/if}</span
    >{#if description}<span
        id={`${id}-description`}
        class="mg2-selectable-description">{description}</span
      >{/if}</span
  >
</label>
