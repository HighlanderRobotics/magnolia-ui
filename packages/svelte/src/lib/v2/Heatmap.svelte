<script lang="ts">
  import {
    heatLevel,
    heatThresholds,
  } from '@highlanderrobotics/magnolia-tokens/v2';
  import type { HeatmapRow } from '@highlanderrobotics/magnolia-tokens/v2';
  import ChartFrame from './ChartFrame.svelte';
  import ChartTooltip from './ChartTooltip.svelte';
  const uid = $props.id();
  let {
    label,
    columns,
    rows,
    thresholds,
    formatValue = String,
    oninspect,
  }: {
    label: string;
    columns: string[];
    rows: HeatmapRow[];
    thresholds?: readonly number[];
    formatValue?: (value: number) => string;
    oninspect?: (row: number, column: number, value: number) => void;
  } = $props();
  let stops = $derived(heatThresholds(thresholds)),
    active = $state<{ row: number; column: number } | undefined>(),
    tooltip = $state(false),
    buttons = $state<(HTMLButtonElement | null)[]>([]);
  let activeValue = $derived(
    active ? rows[active.row]?.values[active.column] : null,
  );
  const valid = (r: number, c: number) =>
    heatLevel(rows[r]?.values[c], stops) !== undefined;
  function inspect(r: number, c: number, focus = false) {
    if (!valid(r, c)) return;
    active = { row: r, column: c };
    tooltip = true;
    if (focus) buttons[r * columns.length + c]?.focus();
    const key = `${r}:${c}:${rows[r].values[c]}`;
    if (key !== lastInspection) {
      lastInspection = key;
      oninspect?.(r, c, rows[r].values[c]!);
    }
  }
  function key(e: KeyboardEvent, r: number, c: number) {
    if (e.key === 'Escape') {
      tooltip = false;
      e.preventDefault();
      return;
    }
    let step = 0,
      index = r * columns.length + c,
      limit = rows.length * columns.length;
    if (e.key === 'Home' || e.key === 'End') {
      const start = e.ctrlKey ? 0 : r * columns.length,
        end = e.ctrlKey ? limit : (r + 1) * columns.length;
      const enabled = Array.from(
        { length: end - start },
        (_, i) => i + start,
      ).filter((i) =>
        valid(Math.floor(i / columns.length), i % columns.length),
      );
      index = e.key === 'Home' ? enabled[0] : enabled.at(-1)!;
    } else {
      step =
        e.key === 'ArrowRight'
          ? 1
          : e.key === 'ArrowLeft'
            ? -1
            : e.key === 'ArrowDown'
              ? columns.length
              : e.key === 'ArrowUp'
                ? -columns.length
                : 0;
      if (!step) return;
      do {
        index += step;
        if (
          index < 0 ||
          index >= limit ||
          (Math.abs(step) === 1 && Math.floor(index / columns.length) !== r)
        )
          return;
      } while (
        !valid(Math.floor(index / columns.length), index % columns.length)
      );
    }
    if (index !== undefined) {
      e.preventDefault();
      inspect(Math.floor(index / columns.length), index % columns.length, true);
    }
  }
  $effect(() => {
    if (active && !valid(active.row, active.column)) {
      active = undefined;
      tooltip = false;
    }
  });
  let tabStop = $state(-1);
  let lastInspection: string | undefined;
  $effect(() => {
    if (
      tabStop >= 0 &&
      !valid(Math.floor(tabStop / columns.length), tabStop % columns.length)
    )
      tabStop = -1;
  });
  let first = $derived.by(() => {
    for (let r = 0; r < rows.length; r++)
      for (let c = 0; c < columns.length; c++)
        if (valid(r, c)) return r * columns.length + c;
    return -1;
  });
</script>

<ChartFrame
  {label}
  columns={['Row', 'Column', 'Value']}
  rows={rows.flatMap((row) =>
    columns.map((column, c) => [
      row.label,
      column,
      heatLevel(row.values[c], stops) === undefined
        ? null
        : formatValue(row.values[c]!),
    ]),
  )}
>
  <div
    class="mg2-heatmap"
    role="group"
    aria-label={`${label} cells`}
    style={`--mg2-heat-columns:${columns.length};--mg2-heat-rows:${rows.length}`}
    onpointerleave={() => (tooltip = false)}
  >
    <span id={`${uid}-help`} class="mg2-sr-only"
      >Use arrow keys to inspect cells. Escape hides the readout.</span
    >
    {#each rows as row, r}<span
        class="mg2-chart-axis mg2-heat-row-label"
        style={`--mg2-heat-r:${r}`}
        aria-hidden="true">{row.label}</span
      >
      {#each columns as column, c}{@const level = heatLevel(
          row.values[c],
          stops,
        )}
        <button
          class="mg2-heat-cell"
          type="button"
          bind:this={buttons[r * columns.length + c]}
          style={`--mg2-heat-r:${r};--mg2-heat-c:${c}`}
          aria-label={`${row.label}, ${column}: ${level === undefined ? 'No data' : formatValue(row.values[c]!)}`}
          aria-describedby={tooltip && active?.row === r && active?.column === c
            ? `${uid}-tooltip`
            : `${uid}-help`}
          disabled={level === undefined}
          tabindex={r * columns.length + c === (tabStop < 0 ? first : tabStop)
            ? 0
            : -1}
          onfocus={() => {
            tabStop = r * columns.length + c;
            inspect(r, c);
          }}
          onpointerenter={() => inspect(r, c)}
          onclick={() => inspect(r, c)}
          onkeydown={(e) => key(e, r, c)}
          onblur={() => (tooltip = false)}
          ><span class="mg2-heat-fill" data-level={level} aria-hidden="true"
          ></span></button
        >
      {/each}
    {/each}
    {#each columns as column, c}{#if c % 2 === 0}<span
          aria-hidden="true"
          class="mg2-chart-axis mg2-heat-column-label"
          style={`--mg2-heat-c:${c}`}>{column}</span
        >{/if}{/each}
    <div
      class="mg2-heat-scale"
      role="img"
      aria-label={`Scale: ${stops.map(formatValue).join(', ')}`}
    >
      <span class="mg2-chart-axis" style="left:0;top:0">Fewer</span
      >{#each stops as stop, i}<span
          aria-hidden="true"
          class="mg2-heat-scale-step mg2-heat-fill"
          data-level={i + 1}
          style={`left:${41 + i * 32}px`}
        ></span>{#if i % 2 === 0}<span
            class="mg2-chart-axis"
            style={`left:${41 + i * 32}px;top:15px`}
            >{formatValue(stop)}{i === 6 ? '+' : ''}</span
          >{/if}{/each}<span class="mg2-chart-axis" style="left:271px;top:0"
        >More</span
      >
    </div>
    {#if first < 0}<span class="mg2-chart-empty">No data</span>{/if}
    {#if tooltip && active && activeValue !== null && activeValue !== undefined}<div
        class="mg2-heat-readout"
        style={`--mg2-heat-r:${active.row};--mg2-heat-c:${active.column}`}
      >
        <ChartTooltip
          id={`${uid}-tooltip`}
          title={`${rows[active.row].label} · ${columns[active.column]}`}
          items={[
            {
              label: 'Activity',
              value: formatValue(activeValue),
              series: 'other',
            },
          ]}
        />
      </div>{/if}
  </div>
</ChartFrame>
