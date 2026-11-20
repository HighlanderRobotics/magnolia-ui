import React from 'react';
import { Pressable, View } from 'react-native';
import {
  chartDomain,
  chartTicks,
  validBoxPlot,
} from '@highlanderrobotics/magnolia-tokens/v2';
import type {
  BoxPlotDatum,
  ChartDomain,
} from '@highlanderrobotics/magnolia-tokens/v2';
import { Text, Glyph, useMagnolia } from './v2.js';
import { ChartFrame, ChartSurface } from './v2-charts.js';

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
