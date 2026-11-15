<script lang="ts">
  import { tick, untrack } from 'svelte';
  import {
    parseDate,
    dateObject,
    localDateISO,
    addDays,
    addMonths,
    formatDate,
    monthGrid,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import IconButton from './IconButton.svelte';
  import Glyph from './Glyph.svelte';
  import DayCell from './DayCell.svelte';
  const uid = $props.id();
  let {
    value = $bindable<string | undefined>(undefined),
    endValue = $bindable<string | undefined>(undefined),
    range = false,
    min,
    max,
    today = localDateISO(),
    month = $bindable<string | undefined>(undefined),
    label = 'Calendar',
    firstDay = 1,
    onselect,
  }: {
    value?: string;
    endValue?: string;
    range?: boolean;
    min?: string;
    max?: string;
    today?: string;
    month?: string;
    label?: string;
    firstDay?: number;
    onselect?: () => void;
  } = $props();
  let visible = $state(
      untrack(() => parseDate(month ?? '') ?? parseDate(value ?? '') ?? today),
    ),
    focused = $state(untrack(() => value ?? today)),
    root = $state<HTMLDivElement>();
  let start = $derived(((firstDay % 7) + 7) % 7),
    cells = $derived(monthGrid(visible, start)),
    weeks = $derived(
      Array.from({ length: cells.length / 7 }, (_, i) =>
        cells.slice(i * 7, i * 7 + 7),
      ),
    ),
    heading = $derived(
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(dateObject(visible)),
    );
  $effect(() => {
    if (month && parseDate(month)) visible = month;
  });
  $effect(() => {
    const next = parseDate(value ?? '');
    if (next) {
      focused = next;
      visible = next;
    }
  });
  const weekdayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  let focusDay = $derived(
    cells.includes(focused) && allowed(focused)
      ? focused
      : cells.find(
          (day) => day.slice(0, 7) === visible.slice(0, 7) && allowed(day),
        ),
  );
  function allowed(day: string) {
    return (!min || day >= min) && (!max || day <= max);
  }
  function choose(day: string) {
    if (!allowed(day)) return;
    focused = day;
    visible = day;
    month = day;
    if (range && (!value || endValue || day < value)) {
      value = day;
      endValue = undefined;
    } else if (range) {
      endValue = day;
      onselect?.();
    } else {
      value = day;
      onselect?.();
    }
  }
  async function move(day: string) {
    if (min && day < min) day = min;
    if (max && day > max) day = max;
    focused = day;
    visible = day;
    month = day;
    await tick();
    root?.querySelector<HTMLButtonElement>(`[data-date="${day}"]`)?.focus();
  }
  function keydown(event: KeyboardEvent, day: string) {
    let next: string | undefined;
    const rtl = getComputedStyle(root!).direction === 'rtl';
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(day, rtl ? 1 : -1);
        break;
      case 'ArrowRight':
        next = addDays(day, rtl ? -1 : 1);
        break;
      case 'ArrowUp':
        next = addDays(day, -7);
        break;
      case 'ArrowDown':
        next = addDays(day, 7);
        break;
      case 'Home':
        next = addDays(day, -((dateObject(day).getUTCDay() - start + 7) % 7));
        break;
      case 'End':
        next = addDays(
          day,
          6 - ((dateObject(day).getUTCDay() - start + 7) % 7),
        );
        break;
      case 'PageUp':
        next = addMonths(day, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(day, event.shiftKey ? 12 : 1);
        break;
    }
    if (next) {
      event.preventDefault();
      void move(next);
    }
  }
</script>

<div bind:this={root} class="mg2-calendar" role="group" aria-label={label}>
  <div class="mg2-calendar-header">
    <IconButton
      label="Previous month"
      variant="tertiary"
      onclick={() => {
        visible = addMonths(visible, -1);
        month = visible;
      }}>{#snippet icon()}<Glyph name="calendar-prev" />{/snippet}</IconButton
    ><span id={`${uid}-month`} aria-live="polite">{heading}</span><IconButton
      label="Next month"
      variant="tertiary"
      onclick={() => {
        visible = addMonths(visible, 1);
        month = visible;
      }}>{#snippet icon()}<Glyph name="calendar-next" />{/snippet}</IconButton
    >
  </div>
  <div role="grid" aria-labelledby={`${uid}-month`}>
    <div role="row" class="mg2-calendar-week mg2-calendar-weekdays">
      {#each Array.from({ length: 7 }, (_, i) => (start + i) % 7) as day}<span
          role="columnheader"
          aria-label={weekdayNames[day]}>{weekdayNames[day].slice(0, 2)}</span
        >{/each}
    </div>
    {#each weeks as week}<div role="row" class="mg2-calendar-week">
        {#each week as day}<div
            role="gridcell"
            aria-selected={day === value || (range && day === endValue)}
          >
            {#if day}<DayCell
                data-date={day}
                day={dateObject(day).getUTCDate()}
                label={formatDate(day)}
                selected={day === value || (range && day === endValue)}
                outside={day.slice(0, 7) !== visible.slice(0, 7)}
                today={day === today}
                inRange={range &&
                  !!value &&
                  !!endValue &&
                  day > value &&
                  day < endValue}
                edge={range && value && endValue
                  ? day === value
                    ? 'start'
                    : day === endValue
                      ? 'end'
                      : day > value && day < endValue
                        ? 'middle'
                        : 'single'
                  : 'single'}
                disabled={!allowed(day)}
                tabindex={day === focusDay ? 0 : -1}
                onclick={() => choose(day)}
                onfocus={() => (focused = day)}
                onkeydown={(event) => keydown(event, day)}
              />{/if}
          </div>{/each}
      </div>{/each}
  </div>
</div>
