<script lang="ts">
  import { onMount } from 'svelte';
  import { sliderValue } from '@highlanderrobotics/magnolia-tokens/v2';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { glyphs } from './glyphs.js';
  import { getAppearance } from './appearance.js';
  const uid = $props.id();
  let {
    label,
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    id = uid,
    formatValue = (value: number) => `${value}%`,
    oninput,
    ...rest
  }: Omit<
    HTMLInputAttributes,
    'type' | 'value' | 'min' | 'max' | 'step' | 'oninput'
  > & {
    label: string;
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    formatValue?: (value: number) => string;
    oninput?: (event: Event) => void;
  } = $props();
  let input = $state<HTMLInputElement>();
  const appearance = getAppearance();
  let pressed = $state(false),
    hover = $state(false),
    focus = $state(false);
  let interaction = $derived<
    'disabled' | 'pressed' | 'focus' | 'hover' | 'default'
  >(
    rest.disabled
      ? 'disabled'
      : pressed
        ? 'pressed'
        : focus
          ? 'focus'
          : hover
            ? 'hover'
            : 'default',
  );
  let art = $derived(
    glyphs[`slider-${interaction}-${appearance.mode}-${appearance.density}`],
  );
  let amount = $derived(sliderValue(value, min, max, step)),
    percent = $derived(max > min ? ((amount - min) / (max - min)) * 100 : 0);
  onMount(() => {
    const initial = value,
      form = input?.form;
    if (input)
      input.defaultValue = String(sliderValue(initial, min, max, step));
    const reset = () => (value = initial);
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
</script>

<div
  class="mg2-slider"
  data-disabled={!!rest.disabled}
  aria-disabled={!!rest.disabled}
>
  <div class="mg2-slider-head">
    <label for={id}>{label}</label><output for={id} aria-hidden="true"
      >{formatValue(amount)}</output
    >
  </div>
  <div class="mg2-slider-track" style={`--mg2-slider-percent:${percent}%;`}>
    <span aria-hidden="true"></span><img
      aria-hidden="true"
      alt=""
      src={art.src}
      width={art.width}
      height={art.height}
      style={`inset-inline-start:calc(${percent}% - ${art.geometry.logicalWidth / 2}px + ${art.geometry.offsetX}px);top:${12 - art.geometry.logicalHeight / 2 + art.geometry.offsetY}px;`}
    /><input
      {...rest}
      {id}
      bind:this={input}
      type="range"
      {min}
      {max}
      {step}
      value={amount}
      aria-valuetext={formatValue(amount)}
      onpointerdown={() => {
        if (!rest.disabled) pressed = true;
      }}
      onpointerenter={() => (hover = true)}
      onpointerleave={() => (hover = false)}
      onfocus={(event) =>
        (focus = event.currentTarget.matches(':focus-visible'))}
      onblur={() => (focus = false)}
      onkeydown={() => (focus = true)}
      oninput={(event) => {
        value = sliderValue(Number(event.currentTarget.value), min, max, step);
        oninput?.(event);
      }}
    />
  </div>
</div>
<svelte:window
  onpointerup={() => (pressed = false)}
  onpointercancel={() => (pressed = false)}
/>
