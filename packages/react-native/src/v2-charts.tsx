import React from 'react';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';
import type { ChartSeries } from '@highlanderrobotics/magnolia-tokens/v2';
import { Text, Glyph, useMagnolia } from './v2.js';

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
