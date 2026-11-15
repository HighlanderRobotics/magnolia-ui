<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import {
    parseDate,
    formatDate,
    parseTime,
    formatTime,
    quarterHours,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import Popover from '../Popover.svelte';
  import Calendar from './Calendar.svelte';
  import Glyph from './Glyph.svelte';
  const uid = $props.id();
  let {
    kind,
    value = $bindable<string | undefined>(undefined),
    label,
    helper,
    error,
    min,
    max,
    id = uid,
    name,
    disabled = false,
    required = false,
    ...rest
  }: Omit<HTMLInputAttributes, 'type' | 'value' | 'min' | 'max'> & {
    kind: 'date' | 'time';
    value?: string;
    label: string;
    helper?: string;
    error?: string;
    min?: string;
    max?: string;
  } = $props();
  const parse = (text: string) =>
      kind === 'date' ? parseDate(text) : parseTime(text),
    format = (value: string | undefined) =>
      kind === 'date' ? formatDate(value) : formatTime(value);
  let text = $state(untrack(() => format(value))),
    focused = $state(false),
    open = $state(false),
    localError = $state(''),
    input = $state<HTMLInputElement>(),
    root = $state<HTMLDivElement>();
  let control = $state<HTMLDivElement>();
  let message = $derived(error || localError),
    options = $derived(
      quarterHours.filter(
        (time) => (!min || time >= min) && (!max || time <= max),
      ),
    );
  $effect(() => {
    if (!focused) text = format(value);
  });
  $effect(() => {
    input?.setCustomValidity(message || '');
  });
  $effect(() => {
    if (disabled) open = false;
  });
  onMount(() => {
    const initial = value,
      form = input?.form;
    if (input) input.defaultValue = format(initial);
    const reset = () => {
      value = initial;
      text = format(initial);
      localError = '';
      open = false;
    };
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
  function commit() {
    if (!text.trim()) {
      value = undefined;
      localError = required ? 'Enter a value.' : '';
      input?.setCustomValidity(error || localError);
      return;
    }
    const next = parse(text);
    localError = !next
      ? `Enter a valid ${kind}.`
      : min && next < min
        ? `Choose a ${kind} on or after ${min}.`
        : max && next > max
          ? `Choose a ${kind} on or before ${max}.`
          : '';
    if (!localError) {
      value = next;
      text = format(next);
    }
    input?.setCustomValidity(error || localError);
  }
  function choose(time: string) {
    value = time;
    text = format(time);
    localError = '';
    open = false;
    input?.focus();
  }
  function timeKey(event: KeyboardEvent, index: number) {
    let next = index;
    switch (event.key) {
      case 'ArrowDown':
        next = Math.min(index + 1, options.length - 1);
        break;
      case 'ArrowUp':
        next = Math.max(0, index - 1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = options.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    root
      ?.querySelector<HTMLButtonElement>(`[data-time="${options[next]}"]`)
      ?.focus();
  }
</script>

<div
  bind:this={root}
  class="mg2-field mg2-temporal-field"
  data-disabled={disabled}
>
  <label for={id}>{label}</label><input
    type="hidden"
    {name}
    value={value ?? ''}
    {disabled}
  />
  <div
    bind:this={control}
    class="mg2-temporal-control"
    data-error={!!message}
    data-open={open}
  >
    <input
      {...rest}
      {id}
      bind:this={input}
      bind:value={text}
      {disabled}
      {required}
      placeholder={rest.placeholder ??
        (kind === 'date' ? 'e.g. Oct 14, 2026' : 'e.g. 2:30 PM')}
      aria-invalid={!!message}
      aria-describedby={[
        rest['aria-describedby'],
        message || helper ? `${id}-help` : null,
      ]
        .filter(Boolean)
        .join(' ') || undefined}
      onfocus={() => (focused = true)}
      onblur={() => {
        commit();
        focused = false;
      }}
      oninput={() => {
        localError = '';
        input?.setCustomValidity('');
      }}
      onkeydown={(event) => {
        if (event.key === 'ArrowDown' && event.altKey) {
          event.preventDefault();
          commit();
          open = true;
        }
        if (event.key === 'Enter') {
          commit();
        }
      }}
    />
    <Popover
      anchorElement={control}
      bind:open
      label={`Choose ${label}`}
      initialFocus={kind === 'date'
        ? '[data-date][tabindex="0"]'
        : '[role="option"][tabindex="0"]'}
    >
      {#snippet trigger(attrs)}<button
          {...attrs}
          type="button"
          class="mg2-temporal-trigger"
          {disabled}
          aria-label={`Choose ${label}`}
          ><Glyph name={kind === 'date' ? 'calendar' : 'clock'} /></button
        >{/snippet}
      {#if kind === 'date'}<Calendar
          bind:value
          {min}
          {max}
          {label}
          onselect={() => {
            text = format(value);
            localError = '';
            open = false;
          }}
        />{:else}<div role="listbox" aria-label={label} class="mg2-time-list">
          {#each options as time, i}<button
              type="button"
              role="option"
              aria-selected={value === time}
              tabindex={value === time ||
              (!options.includes(value ?? '') && i === 0)
                ? 0
                : -1}
              data-time={time}
              onclick={() => choose(time)}
              onkeydown={(event) => timeKey(event, i)}
              >{formatTime(time)}</button
            >{/each}{#if !options.length}<span>No available times</span>{/if}
        </div>{/if}
    </Popover>
  </div>
  {#if message || helper}<span
      id={`${id}-help`}
      class="mg2-field-help"
      data-error={!!message}
      >{#if message}<Glyph name="error" />{/if}{message || helper}</span
    >{/if}
</div>
