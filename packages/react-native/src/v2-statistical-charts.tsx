import React from 'react';
import { Pressable, View, PanResponder } from 'react-native';
import {
  chartDomain,
  chartTicks,
  validBoxPlot,
  validScatterPoint,
  nearestChartPoint,
  lineChartLayout,
  chartLineSegments,
} from '@highlanderrobotics/magnolia-tokens/v2';
import type {
  BoxPlotDatum,
  ChartDomain,
  ScatterPoint,
  LineSeries,
} from '@highlanderrobotics/magnolia-tokens/v2';
import { Text, Glyph, useMagnolia } from './v2.js';
import {
  ChartFrame,
  ChartSurface,
  ChartMarker,
  ChartTooltip,
} from './v2-charts.js';

export function Distribution({
  data,
  label,
  domain,
  highlightIndex,
  onHighlightChange,
  formatValue = String,
}: {
  data: readonly BoxPlotDatum[];
  label: string;
  domain?: ChartDomain;
  highlightIndex?: number;
  onHighlightChange?: (index: number) => void;
  formatValue?: (value: number) => string;
}) {
  const t = useMagnolia(),
    [internal, setInternal] = React.useState(0),
    [focused, setFocused] = React.useState(-1),
    enabled = data.flatMap((row, i) => (validBoxPlot(row) ? [i] : [])),
    bounds = chartDomain(
      data.flatMap((row) =>
        validBoxPlot(row) ? [row.min, row.max, ...(row.outliers ?? [])] : [],
      ),
      domain,
      4,
    ),
    ticks = chartTicks(bounds, 4),
    selected = enabled.includes(highlightIndex ?? internal)
      ? (highlightIndex ?? internal)
      : (enabled[0] ?? -1),
    height = Math.max(200, data.length * 48 + 48);
  const x = (value: number) =>
    96 +
    Math.max(0, Math.min(1, (value - bounds[0]) / (bounds[1] - bounds[0]))) *
      448;
  const caption = {
    fontSize: t.sizes['type/caption/size'],
    lineHeight: t.sizes['type/caption/line'],
    color: t.colors['color/fg/secondary'],
  };
  function describe(row: BoxPlotDatum) {
    return validBoxPlot(row)
      ? `${row.label}, minimum ${formatValue(row.min)}, Q1 ${formatValue(row.q1)}, median ${formatValue(row.median)}, Q3 ${formatValue(row.q3)}, maximum ${formatValue(row.max)}${row.outliers?.length ? `, outliers ${row.outliers.filter(Number.isFinite).map(formatValue).join(', ')}` : ''}`
      : `${row.label}: Invalid range`;
  }
  return (
    <ChartFrame
      label={label}
      columns={[
        'Project',
        'Minimum',
        'Q1',
        'Median',
        'Q3',
        'Maximum',
        'Outliers',
      ]}
      rows={data.map((row) => [
        row.label,
        ...[row.min, row.q1, row.median, row.q3, row.max].map((v) =>
          Number.isFinite(v) ? formatValue(v) : null,
        ),
        (row.outliers ?? [])
          .filter(Number.isFinite)
          .map(formatValue)
          .join(', '),
      ])}
    >
      <ChartSurface width={560} height={height}>
        {selected < 0 ? (
          <Text
            allowFontScaling={false}
            style={{ position: 'absolute', left: 96, top: 96 }}
          >
            No data
          </Text>
        ) : (
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
                    left: x(value),
                    top: 0,
                    width: 1,
                    height: height - 40,
                    backgroundColor: t.colors['color/chart/grid'],
                  }}
                />
                <Text
                  allowFontScaling={false}
                  style={[
                    caption,
                    {
                      position: 'absolute',
                      left: x(value) - 6,
                      top: height - 34,
                    },
                  ]}
                >
                  {formatValue(value)}
                </Text>
              </React.Fragment>
            ))}
          </View>
        )}
        {data.map((row, i) => {
          const highlighted = i === selected,
            color =
              t.colors[
                highlighted ? 'color/chart/cat-1' : 'color/fg/secondary'
              ];
          return (
            <Pressable
              key={i}
              disabled={!validBoxPlot(row)}
              accessibilityRole="button"
              accessibilityLabel={describe(row)}
              accessibilityState={{
                selected: highlighted,
                disabled: !validBoxPlot(row),
              }}
              onPress={() => {
                if (highlightIndex === undefined) setInternal(i);
                onHighlightChange?.(i);
              }}
              onFocus={() => setFocused(i)}
              onBlur={() => setFocused(-1)}
              style={{
                position: 'absolute',
                left: 0,
                top: i * 48,
                width: 560,
                height: 48,
                outlineWidth: focused === i ? 2 : 0,
                outlineOffset: -2,
                outlineColor: t.colors['color/border/focus'],
              }}
            >
              <View
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 11,
                    width: 90,
                    fontSize: t.sizes['type/body/sm/size'],
                    lineHeight: t.sizes['type/body/sm/line'],
                    color: t.colors['color/fg/secondary'],
                  }}
                >
                  {row.label}
                </Text>
                {validBoxPlot(row) && (
                  <>
                    <View
                      style={{
                        position: 'absolute',
                        left: x(row.min),
                        top: highlighted ? 19.5 : 20,
                        width: Math.max(0, x(row.max) - x(row.min)),
                        height: highlighted ? 2 : 1,
                        backgroundColor: color,
                      }}
                    />
                    {[row.min, row.max].map((cap, j) => (
                      <View
                        key={j}
                        style={{
                          position: 'absolute',
                          left: x(cap) - (highlighted ? 0.5 : 0),
                          top: 15,
                          width: highlighted ? 2 : 1,
                          height: 10,
                          backgroundColor: color,
                        }}
                      />
                    ))}
                    <View
                      style={{
                        position: 'absolute',
                        left: x(row.q1),
                        top: 10,
                        width: Math.max(0, x(row.q3) - x(row.q1)),
                        height: 20,
                        borderWidth: 1,
                        borderColor: color,
                        borderRadius: 3,
                        backgroundColor:
                          t.colors[
                            highlighted
                              ? 'color/bg/accent-subtle'
                              : 'color/bg/neutral-subtle'
                          ],
                      }}
                    />
                    <View
                      style={{
                        position: 'absolute',
                        left: x(row.median) - 1,
                        top: 10,
                        width: 2,
                        height: 20,
                        backgroundColor: t.colors['color/fg/primary'],
                      }}
                    />
                    {(row.outliers ?? [])
                      .filter(Number.isFinite)
                      .map((value, j) => (
                        <View
                          key={j}
                          style={{
                            position: 'absolute',
                            left: x(value) - 3,
                            top: 17,
                            width: 6,
                            height: 6,
                          }}
                        >
                          <Glyph
                            name={
                              highlighted
                                ? 'distribution-outlier-accent'
                                : 'distribution-outlier-neutral'
                            }
                            color={color}
                          />
                        </View>
                      ))}
                  </>
                )}
              </View>
            </Pressable>
          );
        })}
      </ChartSurface>
    </ChartFrame>
  );
}

export function Scatter({
  points,
  label,
  xLabel = 'X',
  yLabel = 'Y',
  xDomain,
  yDomain,
  formatX = String,
  formatY = String,
  onInspect,
}: {
  points: readonly ScatterPoint[];
  label: string;
  xLabel?: string;
  yLabel?: string;
  xDomain?: ChartDomain;
  yDomain?: ChartDomain;
  formatX?: (value: number) => string;
  formatY?: (value: number) => string;
  onInspect?: (index: number, point: ScatterPoint) => void;
}) {
  const t = useMagnolia(),
    valid = points.flatMap((p, i) => (validScatterPoint(p) ? [i] : [])),
    xb = chartDomain(
      valid.map((i) => points[i].x),
      xDomain,
      4,
    ),
    yb = chartDomain(
      valid.map((i) => points[i].y),
      yDomain,
      4,
    ),
    xt = chartTicks(xb, 4),
    yt = chartTicks(yb, 4),
    visible = valid.filter(
      (i) =>
        points[i].x >= xb[0] &&
        points[i].x <= xb[1] &&
        points[i].y >= yb[0] &&
        points[i].y <= yb[1],
    );
  const x = (value: number) => 44 + ((value - xb[0]) / (xb[1] - xb[0])) * 500,
    y = (value: number) => 204 - ((value - yb[0]) / (yb[1] - yb[0])) * 196;
  const [active, setActive] = React.useState(-1),
    [focus, setFocus] = React.useState(false),
    last = React.useRef<string | undefined>(undefined),
    current = visible.includes(active) ? points[active] : undefined;
  const caption = {
    fontSize: t.sizes['type/caption/size'],
    lineHeight: t.sizes['type/caption/line'],
    color: t.colors['color/fg/secondary'],
  };
  function describe(index: number) {
    const p = points[index];
    return `${p.label}, ${xLabel}: ${formatX(p.x)}, ${yLabel}: ${formatY(p.y)}, ${p.highlighted ? 'highlighted' : 'context'}`;
  }
  function inspect(index: number) {
    if (!visible.includes(index)) return;
    setActive(index);
    const p = points[index],
      key = `${index}:${p.label}:${p.x}:${p.y}`;
    if (key !== last.current) {
      last.current = key;
      onInspect?.(index, p);
    }
  }
  const live = React.useRef<(px: number, py: number) => void>(() => {});
  live.current = (px, py) => {
    const nearest = nearestChartPoint(
      visible.map((i) => ({ x: x(points[i].x) - 44, y: y(points[i].y) - 8 })),
      px,
      py,
    );
    if (nearest >= 0) inspect(visible[nearest]);
  };
  const responder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) =>
          live.current(e.nativeEvent.locationX, e.nativeEvent.locationY),
        onPanResponderMove: (e) =>
          live.current(e.nativeEvent.locationX, e.nativeEvent.locationY),
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );
  return (
    <ChartFrame
      label={label}
      columns={['Observation', xLabel, yLabel, 'Group']}
      rows={points.map((p) => [
        p.label,
        Number.isFinite(p.x) ? formatX(p.x) : null,
        Number.isFinite(p.y) ? formatY(p.y) : null,
        p.highlighted ? 'Highlighted' : 'Context',
      ])}
      readout={
        current ? (
          <ChartTooltip
            title={current.label}
            items={[
              {
                label: xLabel,
                value: formatX(current.x),
                series: current.highlighted ? 1 : 'other',
              },
              {
                label: yLabel,
                value: formatY(current.y),
                series: current.highlighted ? 1 : 'other',
              },
            ]}
          />
        ) : undefined
      }
    >
      <ChartSurface width={560} height={240}>
        {!visible.length ? (
          <Text
            allowFontScaling={false}
            style={{ position: 'absolute', left: 44, top: 96 }}
          >
            {valid.length ? 'No data in this range' : 'No data'}
          </Text>
        ) : (
          <>
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {yt.map((value) => (
                <React.Fragment key={value}>
                  <View
                    style={{
                      position: 'absolute',
                      left: 44,
                      top: y(value),
                      width: 500,
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
                        left: 10,
                        top: y(value) - 8,
                        width: 28,
                        textAlign: 'right',
                      },
                    ]}
                  >
                    {formatY(value)}
                  </Text>
                </React.Fragment>
              ))}
              {xt.map((value) => (
                <Text
                  allowFontScaling={false}
                  key={value}
                  style={[
                    caption,
                    { position: 'absolute', left: x(value) - 8, top: 212 },
                  ]}
                >
                  {formatX(value)}
                </Text>
              ))}
              <Text
                allowFontScaling={false}
                style={[caption, { position: 'absolute', right: 16, top: 226 }]}
              >
                {xLabel === 'X' ? '' : xLabel}
              </Text>
              {visible.map((index) => {
                const p = points[index];
                return (
                  <View
                    key={index}
                    style={{
                      position: 'absolute',
                      left: x(p.x) - 6.5,
                      top: y(p.y) - 6.5,
                      width: 13,
                      height: 13,
                      zIndex: p.highlighted ? 2 : 1,
                    }}
                  >
                    <ChartMarker
                      kind={
                        p.highlighted ? 'scatter-highlight' : 'scatter-neutral'
                      }
                    />
                  </View>
                );
              })}
            </View>
            <View
              {...responder.panHandlers}
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel={`Inspect ${label}`}
              accessibilityHint="Adjust or drag to inspect observations"
              accessibilityValue={{
                min: 1,
                max: visible.length,
                now: Math.max(0, visible.indexOf(active)) + 1,
                text: describe(visible.includes(active) ? active : visible[0]),
              }}
              accessibilityActions={[
                { name: 'increment' },
                { name: 'decrement' },
              ]}
              onAccessibilityAction={(e) => {
                const at = Math.max(0, visible.indexOf(active)),
                  next =
                    e.nativeEvent.actionName === 'increment'
                      ? visible[Math.min(visible.length - 1, at + 1)]
                      : e.nativeEvent.actionName === 'decrement'
                        ? visible[Math.max(0, at - 1)]
                        : undefined;
                if (next !== undefined) inspect(next);
              }}
              onFocus={() => {
                setFocus(true);
                if (!current) inspect(visible[0]);
              }}
              onBlur={() => setFocus(false)}
              onAccessibilityEscape={() => setActive(-1)}
              style={{
                position: 'absolute',
                left: 44,
                top: 8,
                width: 500,
                height: 196,
                zIndex: 3,
                outlineWidth: focus ? 2 : 0,
                outlineOffset: 0,
                outlineColor: t.colors['color/border/focus'],
              }}
            />
          </>
        )}
      </ChartSurface>
    </ChartFrame>
  );
}

export function LineChart({
  labels,
  series,
  label,
  domain,
  activeIndex,
  onActiveIndexChange,
  formatValue = String,
  onInspect,
}: {
  labels: readonly string[];
  series: readonly LineSeries[];
  label: string;
  domain?: ChartDomain;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  formatValue?: (value: number) => string;
  onInspect?: (index: number) => void;
}) {
  const t = useMagnolia(),
    layout = lineChartLayout(labels, series, domain),
    supported = series.length <= 5;
  const [internal, setInternal] = React.useState<number | undefined>(undefined),
    [readout, setReadout] = React.useState(false),
    [focused, setFocused] = React.useState(false),
    last = React.useRef('');
  const requested = activeIndex ?? internal,
    selected = layout.enabled.includes(requested ?? -1)
      ? requested!
      : (layout.enabled.at(-1) ?? -1);
  const caption = {
    fontSize: t.sizes['type/caption/size'],
    lineHeight: t.sizes['type/caption/line'],
    color: t.colors['color/fg/secondary'],
  };
  function describe(index: number) {
    return `${labels[index]}, ${series.map((s) => `${s.label}: ${typeof s.values[index] === 'number' && Number.isFinite(s.values[index]) ? formatValue(s.values[index]!) : 'No data'}`).join(', ')}`;
  }
  function inspect(index: number) {
    if (!layout.enabled.includes(index)) return;
    if (activeIndex === undefined) setInternal(index);
    setReadout(true);
    const key = describe(index);
    if (last.current !== key) {
      last.current = key;
      onActiveIndexChange?.(index);
      onInspect?.(index);
    }
  }
  const live = React.useRef<(px: number) => void>(() => {});
  live.current = (px) => {
    const nearest = nearestChartPoint(
      layout.enabled.map((i) => ({ x: layout.x(i) - 40, y: 0 })),
      px,
      0,
    );
    if (nearest >= 0) inspect(layout.enabled[nearest]);
  };
  const responder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => live.current(e.nativeEvent.locationX),
        onPanResponderMove: (e) => live.current(e.nativeEvent.locationX),
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );
  function stroke(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    key: string | number,
    thickness = 2,
  ) {
    const length = Math.hypot(x2 - x1, y2 - y1);
    return (
      <View
        key={key}
        style={{
          position: 'absolute',
          left: (x1 + x2) / 2 - length / 2,
          top: (y1 + y2) / 2 - thickness / 2,
          width: length,
          height: thickness,
          backgroundColor: color,
          transform: [{ rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` }],
        }}
      />
    );
  }
  return (
    <ChartFrame
      label={label}
      columns={['Period', ...series.map((s) => s.label)]}
      rows={labels.map((period, i) => [
        period,
        ...series.map((s) =>
          typeof s.values[i] === 'number' && Number.isFinite(s.values[i])
            ? formatValue(s.values[i]!)
            : null,
        ),
      ])}
      readout={
        readout && selected >= 0 && supported ? (
          <ChartTooltip
            title={labels[selected]}
            items={series.map((s, i) => ({
              label: s.label,
              value:
                typeof s.values[selected] === 'number' &&
                Number.isFinite(s.values[selected])
                  ? formatValue(s.values[selected]!)
                  : '—',
              series: layout.paths[i].series,
            }))}
          />
        ) : undefined
      }
    >
      <ChartSurface width={layout.width} height={240}>
        {!supported || !layout.enabled.length ? (
          <Text
            allowFontScaling={false}
            style={{ position: 'absolute', left: 40, top: 96 }}
          >
            {supported
              ? 'No data'
              : 'LineChart supports up to five series. View all values in the data table.'}
          </Text>
        ) : (
          <>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              pointerEvents="none"
            >
              {chartTicks(layout.bounds).map((value) => (
                <React.Fragment key={value}>
                  <View
                    style={{
                      position: 'absolute',
                      left: 40,
                      top: layout.y(value),
                      width: layout.plotWidth,
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
                        top: layout.y(value) - 8,
                        width: 28,
                        textAlign: 'right',
                      },
                    ]}
                  >
                    {formatValue(value)}
                  </Text>
                </React.Fragment>
              ))}
              {labels.map((period, i) => (
                <Text
                  key={i}
                  allowFontScaling={false}
                  style={[
                    caption,
                    { position: 'absolute', left: layout.x(i) - 8, top: 220 },
                  ]}
                >
                  {period}
                </Text>
              ))}
              {layout.paths.map((path, i) => (
                <React.Fragment key={i}>
                  {path.runs.flatMap((run, ri) =>
                    run.length > 1
                      ? chartLineSegments(run, path.dash, [
                          40,
                          8,
                          40 + layout.plotWidth,
                          212,
                        ]).map((s, si) =>
                          stroke(
                            s.x1,
                            s.y1,
                            s.x2,
                            s.y2,
                            t.colors[`color/chart/cat-${path.series}`],
                            `${ri}:${si}`,
                          ),
                        )
                      : run[0].y >= 8 && run[0].y <= 212
                        ? [
                            <View
                              key={ri}
                              style={{
                                position: 'absolute',
                                left: run[0].x - 2,
                                top: run[0].y - 2,
                                width: 4,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor:
                                  t.colors[`color/chart/cat-${path.series}`],
                              }}
                            />,
                          ]
                        : [],
                  )}
                </React.Fragment>
              ))}
              {layout.ends.map((end) => (
                <React.Fragment key={end.index}>
                  {(Math.abs(
                    end.point.y + (series[end.index].labelOffsetY ?? 0) - end.y,
                  ) > 0.1 ||
                    end.point.x < 40 + layout.plotWidth) &&
                    chartLineSegments([
                      end.point,
                      { x: layout.plotWidth + 44, y: end.y },
                      { x: layout.plotWidth + 48, y: end.y },
                    ]).map((s, i) =>
                      stroke(
                        s.x1,
                        s.y1,
                        s.x2,
                        s.y2,
                        t.colors[
                          `color/chart/cat-${layout.paths[end.index].series}`
                        ],
                        i,
                        1,
                      ),
                    )}
                  <View
                    style={{
                      position: 'absolute',
                      left: layout.plotWidth + 48,
                      top: end.y,
                      width: 12,
                      height: 2,
                      backgroundColor:
                        t.colors[
                          `color/chart/cat-${layout.paths[end.index].series}`
                        ],
                    }}
                  />
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={{
                      position: 'absolute',
                      left: layout.plotWidth + 64,
                      top: end.y - 8,
                      width: 72,
                      fontSize: t.sizes['type/label/sm/size'],
                      lineHeight: t.sizes['type/label/sm/line'],
                      fontWeight: '500',
                    }}
                  >
                    {series[end.index].label}
                  </Text>
                </React.Fragment>
              ))}
              {selected >= 0 && (
                <>
                  <View
                    style={{
                      position: 'absolute',
                      left: layout.x(selected),
                      top: 8,
                      width: 1,
                      height: 204,
                      backgroundColor: t.colors['color/border/default'],
                    }}
                  />
                  {series.map((s, i) => {
                    const value = s.values[selected];
                    return typeof value === 'number' &&
                      Number.isFinite(value) &&
                      value >= layout.bounds[0] &&
                      value <= layout.bounds[1] ? (
                      <View
                        key={i}
                        style={{
                          position: 'absolute',
                          left: layout.x(selected) - 6,
                          top: layout.y(value) - 6,
                          width: 12,
                          height: 12,
                        }}
                      >
                        <ChartMarker
                          kind={`line-point-${layout.paths[i].series}`}
                        />
                      </View>
                    ) : null;
                  })}
                </>
              )}
            </View>
            <View
              {...responder.panHandlers}
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel={`Inspect ${label}`}
              accessibilityHint="Adjust or drag to inspect periods"
              accessibilityValue={{
                min: 1,
                max: layout.enabled.length,
                now: layout.enabled.indexOf(selected) + 1,
                text: describe(selected),
              }}
              accessibilityActions={[
                { name: 'increment' },
                { name: 'decrement' },
              ]}
              onAccessibilityAction={(e) => {
                const at = layout.enabled.indexOf(selected),
                  next =
                    e.nativeEvent.actionName === 'increment'
                      ? layout.enabled[
                          Math.min(layout.enabled.length - 1, at + 1)
                        ]
                      : e.nativeEvent.actionName === 'decrement'
                        ? layout.enabled[Math.max(0, at - 1)]
                        : undefined;
                if (next !== undefined) inspect(next);
              }}
              onFocus={() => {
                setFocused(true);
                inspect(selected);
              }}
              onBlur={() => setFocused(false)}
              onAccessibilityEscape={() => setReadout(false)}
              style={{
                position: 'absolute',
                left: 40,
                top: 8,
                width: layout.plotWidth,
                height: 204,
                outlineWidth: focused ? 2 : 0,
                outlineColor: t.colors['color/border/focus'],
              }}
            />
          </>
        )}
      </ChartSurface>
    </ChartFrame>
  );
}
