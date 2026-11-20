import React from 'react';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { v2Tokens } from '@highlanderrobotics/magnolia-tokens/v2';
import { Text, useMagnolia } from './v2.js';
export function NavRail({
  children,
  logo,
  brand = 'A',
  brandLabel = 'Application',
  label = 'Primary navigation',
  height = 600,
  style,
}: {
  children?: ReactNode;
  logo?: ReactNode;
  brand?: string;
  brandLabel?: string;
  label?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useMagnolia();
  return (
    <View
      accessibilityLabel={label}
      style={[
        {
          width: v2Tokens.scale['size/rail'],
          height: Number.isFinite(height) ? Math.max(1, height) : 600,
          borderRightWidth: 1,
          borderColor: t.colors['color/border/subtle'],
          backgroundColor: t.colors['color/bg/canvas'],
        },
        style,
      ]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingVertical: 12,
          gap: 4,
          alignItems: 'center',
        }}
      >
        {logo ?? (
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel={brandLabel}
            style={{
              minWidth: 32,
              minHeight: 32,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: t.colors['color/bg/accent-strong'],
            }}
          >
            <Text
              style={{
                fontSize: t.sizes['type/label/size'],
                lineHeight: t.sizes['type/label/line'],
                fontWeight: '500',
                color: t.colors['color/fg/on-accent'],
              }}
            >
              {brand}
            </Text>
          </View>
        )}
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ width: 1, height: 12 }}
        />
        {children}
      </ScrollView>
    </View>
  );
}
