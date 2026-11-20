import React from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import type { ViewProps } from 'react-native';
import {
  chartDomain,
  chartTicks,
  chartIndex,
  heatThresholds,
  heatLevel,
} from '@highlanderrobotics/magnolia-tokens/v2';
import type {
  ChartSeries,
  ChartDatum,
  ChartDomain,
  HeatmapRow,
} from '@highlanderrobotics/magnolia-tokens/v2';
import { Text, Glyph, Button, useMagnolia } from './v2.js';

export function Sparkline({
  shape = 'rising',
  tone = 'neutral',
  label,
  style,
  ...rest
}: ViewProps & {
  shape?: 'rising' | 'falling' | 'volatile' | 'flat';
  tone?: 'neutral' | 'accent';
  label?: string;
}) {
  const t = useMagnolia();
  return (
    <View
      {...rest}
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
      style={[{ width: 96, height: 24 }, style]}
    >
      <Glyph
        name={`spark-${shape}-${tone}`}
        color={
          t.colors[tone === 'accent' ? 'color/fg/accent' : 'color/fg/secondary']
        }
      />
    </View>
  );
}
export function ChartSwatch({ series = 1 }: { series?: ChartSeries }) {
  const t = useMagnolia();
  const color =
    t.colors[
      series === 'other'
        ? 'color/fg/tertiary'
        : (`color/chart/cat-${series}` as const)
    ];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }}
    />
  );
}
export function LegendItem({
  label,
  series = 1,
  style,
  ...rest
}: ViewProps & { label: string; series?: ChartSeries }) {
  const t = useMagnolia();
  return (
    <View
      {...rest}
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}
    >
      <ChartSwatch series={series} />
      <Text
        style={{
          color: t.colors['color/fg/secondary'],
          fontSize: t.sizes['type/body/sm/size'],
          lineHeight: t.sizes['type/body/sm/line'],
        }}
      >
        {label}
      </Text>
    </View>
  );
}
export function ChartTooltip({
  title,
  items,
  style,
  ...rest
}: ViewProps & {
  title: string;
  items: { label: string; value: string | number; series: ChartSeries }[];
}) {
  const t = useMagnolia();
  return (
    <View
      {...rest}
      style={[
        {
          width: 180,
          maxWidth: '100%',
          padding: 12,
          borderWidth: 1,
          borderColor: t.colors['color/border/subtle'],
          borderRadius: 8,
          backgroundColor: t.colors['color/bg/overlay'],
          gap: 8,
          boxShadow: '0 1px 2px #0003, 0 8px 20px #0000004d',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: t.sizes['type/label/sm/size'],
          lineHeight: t.sizes['type/label/sm/line'],
          fontWeight: '500',
          color: t.colors['color/fg/secondary'],
        }}
      >
        {title}
      </Text>
      {items.map((item, i) => (
        <View
          key={i}
          accessible
          accessibilityLabel={`${item.label}: ${item.value}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <ChartSwatch series={item.series} />
          <Text
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: t.sizes['type/body/sm/size'],
              lineHeight: t.sizes['type/body/sm/line'],
              color: t.colors['color/fg/secondary'],
            }}
          >
            {item.label}
          </Text>
          <Text
            style={{
              fontSize: t.sizes['type/label/sm/size'],
              lineHeight: t.sizes['type/label/sm/line'],
              fontWeight: '500',
              fontVariant: ['tabular-nums'],
            }}
          >
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ChartFrame({
  label,
  columns,
  rows,
  children,
  readout,
}: {
  label: string;
  columns: string[];
  rows: (string | number | null)[][];
  children: React.ReactNode;
  readout?: React.ReactNode;
}) {
  const [showData, setShowData] = React.useState(false);
  return (
    <View>
      <ScrollView horizontal accessibilityLabel={label}>
        {children}
      </ScrollView>
      {readout}
      <Button
        variant="tertiary"
        onPress={() => setShowData(!showData)}
        accessibilityState={{ expanded: showData }}
      >
        {showData ? 'Hide' : 'View'} {label} data
      </Button>
      {showData && (
        <View>
          {rows.map((row, i) => (
            <Text key={i} style={{ padding: 8 }}>
              {row
                .map((value, j) => `${columns[j]}: ${value ?? '—'}`)
                .join(', ')}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
export function ChartSurface({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  const { fontScale } = useWindowDimensions(),
    scale = Math.max(1, fontScale);
  return (
    <View style={{ width: width * scale, height: height * scale }}>
      <View
        style={{
          width,
          height,
          transform: [{ scale }],
          transformOrigin: 'top left',
        }}
      >
        {children}
      </View>
    </View>
  );
}

export function BarChart({
  data,
  label,
  domain,
  highlightIndex,
  onHighlightChange,
  formatValue = String,
}: {
  data: ChartDatum[];
  label: string;
  domain?: ChartDomain;
  highlightIndex?: number;
  onHighlightChange?: (index: number) => void;
  formatValue?: (value: number) => string;
}) {
  const t = useMagnolia(),
    [internal, setInternal] = React.useState<number | undefined>(undefined),
    [focus, setFocus] = React.useState(-1),
    values = data.map((d) => d.value),
    bounds = chartDomain(values, domain),
    ticks = chartTicks(bounds),
    selected = chartIndex(values, highlightIndex ?? internal),
    width = Math.max(560, 48 + data.length * 64),
    plotWidth = width - 48,
    slotWidth = plotWidth / Math.max(1, data.length);
  const y = (value: number) =>
    192 - ((value - bounds[0]) / (bounds[1] - bounds[0])) * 184;
  const renderY = (value: number) =>
    y(Math.max(bounds[0], Math.min(bounds[1], value)));
  const baseline = Math.max(bounds[0], Math.min(bounds[1], 0));
  const caption = {
    fontSize: t.sizes['type/caption/size'],
    lineHeight: t.sizes['type/caption/line'],
    color: t.colors['color/fg/secondary'],
  };
  return (
    <ChartFrame
      label={label}
      columns={['Period', 'Value']}
      rows={data.map((d) => [
        d.label,
        d.value !== null && Number.isFinite(d.value)
          ? formatValue(d.value)
          : null,
      ])}
    >
      <ChartSurface width={width} height={220}>
        {selected < 0 ? (
          <Text
            allowFontScaling={false}
            style={{ position: 'absolute', left: 40, top: 96 }}
          >
            No data
          </Text>
        ) : (
          <>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              pointerEvents="none"
            >
              {ticks.map((value) => (
                <React.Fragment key={value}>
                  <View
                    style={{
                      position: 'absolute',
                      left: 40,
                      top: y(value),
                      width: plotWidth,
                      height: 1,
                      backgroundColor: t.colors['color/chart/grid'],
                    }}
                  />
                  <Text
                    allowFontScaling={false}
                    style={[
                      caption,
                      {
                        position: 'absolute',
                        left: 6,
                        top: y(value) - 8,
                        width: 28,
                        textAlign: 'right',
                      },
                    ]}
                  >
                    {formatValue(value)}
                  </Text>
                </React.Fragment>
              ))}
            </View>
            {data.map((datum, i) => {
              const value = datum.value,
                valid = value !== null && Number.isFinite(value);
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={`${datum.label}: ${valid ? formatValue(value!) : 'No data'}`}
                  accessibilityState={{
                    selected: i === selected,
                    disabled: !valid,
                  }}
                  disabled={!valid}
                  onFocus={() => setFocus(i)}
                  onBlur={() => setFocus(-1)}
                  onPress={() => {
                    if (highlightIndex === undefined) setInternal(i);
                    onHighlightChange?.(i);
                  }}
                  style={{
                    position: 'absolute',
                    left: 40 + i * slotWidth,
                    top: 8,
                    width: slotWidth,
                    height: 184,
                    outlineWidth: focus === i ? 2 : 0,
                    outlineOffset: -2,
                    outlineColor: t.colors['color/border/focus'],
                  }}
                >
                  {valid && (
                    <View
                      pointerEvents="none"
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                    >
                      <View
                        style={{
                          position: 'absolute',
                          left: (slotWidth - 24) / 2,
                          top: Math.min(renderY(value!), y(baseline)) - 8,
                          width: 24,
                          height: Math.abs(y(baseline) - renderY(value!)),
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4,
                          backgroundColor:
                            t.colors[
                              i === selected
                                ? 'color/chart/cat-1'
                                : 'color/chart/other'
                            ],
                        }}
                      />
                      {i === selected && (
                        <Text
                          allowFontScaling={false}
                          style={{
                            position: 'absolute',
                            left: 0,
                            width: slotWidth,
                            textAlign: 'center',
                            top: Math.max(
                              -8,
                              Math.min(164, renderY(value!) - 28),
                            ),
                            backgroundColor:
                              value! < bounds[0] || value! > bounds[1]
                                ? t.colors['color/bg/base']
                                : 'transparent',
                            fontSize: t.sizes['type/label/sm/size'],
                            lineHeight: t.sizes['type/label/sm/line'],
                            fontWeight: '500',
                          }}
                        >
                          {formatValue(value!)}
                        </Text>
                      )}
                    </View>
                  )}
                  <Text
                    allowFontScaling={false}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={[
                      caption,
                      {
                        position: 'absolute',
                        top: 192,
                        left: 0,
                        width: slotWidth,
                        textAlign: 'center',
                      },
                    ]}
                  >
                    {datum.label}
                  </Text>
                </Pressable>
              );
            })}
          </>
        )}
      </ChartSurface>
    </ChartFrame>
  );
}

export function Heatmap({
  label,
  columns,
  rows,
  thresholds,
  formatValue = String,
  onInspect,
}: {
  label: string;
  columns: string[];
  rows: HeatmapRow[];
  thresholds?: readonly number[];
  formatValue?: (value: number) => string;
  onInspect?: (row: number, column: number, value: number) => void;
}) {
  const t = useMagnolia(),
    stops = heatThresholds(thresholds),
    [active, setActive] = React.useState<
      { row: number; column: number } | undefined
    >(),
    width = Math.max(560, 80 + columns.length * 48),
    height = Math.max(236, rows.length * 48 + 68);
  const [focused, setFocused] = React.useState<string | undefined>();
  const lastInspection = React.useRef<string | undefined>(undefined);
  const caption = {
    fontSize: t.sizes['type/caption/size'],
    lineHeight: t.sizes['type/caption/line'],
    color: t.colors['color/fg/secondary'],
  };
  const current = active ? rows[active.row]?.values[active.column] : null;
  const inspect = (r: number, c: number) => {
    const value = rows[r]?.values[c];
    if (heatLevel(value, stops) === undefined) return;
    setActive({ row: r, column: c });
    const key = `${r}:${c}:${value}`;
    if (key !== lastInspection.current) {
      lastInspection.current = key;
      onInspect?.(r, c, value!);
    }
  };
  return (
    <ChartFrame
      label={label}
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
      readout={
        active && heatLevel(current, stops) !== undefined ? (
          <ChartTooltip
            title={`${rows[active.row].label} · ${columns[active.column]}`}
            items={[
              {
                label: 'Activity',
                value: formatValue(current!),
                series: 'other',
              },
            ]}
          />
        ) : undefined
      }
    >
      <ChartSurface width={width} height={height}>
        {!rows.some((row) =>
          columns.some((_, c) => heatLevel(row.values[c], stops) !== undefined),
        ) && (
          <Text
            allowFontScaling={false}
            style={[caption, { position: 'absolute', left: 44, top: 96 }]}
          >
            No data
          </Text>
        )}
        {rows.map((row, r) => (
          <React.Fragment key={r}>
            <Text
              allowFontScaling={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                caption,
                { position: 'absolute', left: 0, top: 18 + r * 48, width: 40 },
              ]}
            >
              {row.label}
            </Text>
            {columns.map((column, c) => {
              const level = heatLevel(row.values[c], stops);
              return (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  accessibilityLabel={`${row.label}, ${column}: ${level === undefined ? 'No data' : formatValue(row.values[c]!)}`}
                  accessibilityState={{ disabled: level === undefined }}
                  disabled={level === undefined}
                  onPress={() => inspect(r, c)}
                  onFocus={() => {
                    setFocused(`${r}:${c}`);
                    inspect(r, c);
                  }}
                  onBlur={() => setFocused(undefined)}
                  onAccessibilityEscape={() => setActive(undefined)}
                  style={({ pressed }) => ({
                    position: 'absolute',
                    left: 44 + c * 48,
                    top: 4 + r * 48,
                    width: 44,
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    outlineWidth: pressed || focused === `${r}:${c}` ? 2 : 0,
                    outlineOffset: 0,
                    outlineColor: t.colors['color/border/focus'],
                  })}
                >
                  <View
                    pointerEvents="none"
                    style={{
                      width: 36,
                      height: 20,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: t.colors['color/border/subtle'],
                      backgroundColor:
                        level === undefined
                          ? 'transparent'
                          : t.colors[`color/chart/seq-${level}` as const],
                    }}
                  />
                </Pressable>
              );
            })}
          </React.Fragment>
        ))}
        {columns.map((column, c) =>
          c % 2 === 0 ? (
            <Text
              allowFontScaling={false}
              key={c}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                caption,
                {
                  position: 'absolute',
                  left: 52 + c * 48,
                  top: rows.length * 48 + 8,
                },
              ]}
            >
              {column}
            </Text>
          ) : null,
        )}
        <View
          accessible
          accessibilityLabel={`Scale: ${stops.map(formatValue).join(', ')}`}
          style={{
            position: 'absolute',
            left: 44,
            top: rows.length * 48 + 28,
            width: 299,
            height: 30,
          }}
        >
          <Text
            allowFontScaling={false}
            style={[caption, { position: 'absolute', left: 0, top: 0 }]}
          >
            Fewer
          </Text>
          {stops.map((stop, i) => (
            <React.Fragment key={i}>
              <View
                style={{
                  position: 'absolute',
                  left: 41 + i * 32,
                  top: 3,
                  width: 30,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor:
                    t.colors[
                      `color/chart/seq-${i + 1}` as keyof typeof t.colors
                    ],
                }}
              />
              {i % 2 === 0 && (
                <Text
                  allowFontScaling={false}
                  style={[
                    caption,
                    { position: 'absolute', left: 41 + i * 32, top: 15 },
                  ]}
                >
                  {formatValue(stop)}
                  {i === 6 ? '+' : ''}
                </Text>
              )}
            </React.Fragment>
          ))}
          <Text
            allowFontScaling={false}
            style={[caption, { position: 'absolute', left: 271, top: 0 }]}
          >
            More
          </Text>
        </View>
      </ChartSurface>
    </ChartFrame>
  );
}
