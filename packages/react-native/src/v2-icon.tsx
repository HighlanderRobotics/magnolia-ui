import React from 'react';
import { Image, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { icons, type IconName } from './v2-icons.generated.js';
import { useMagnolia } from './v2.js';
export { iconNames } from './v2-icons.generated.js';
export type { IconName } from './v2-icons.generated.js';
export function Icon({
  name,
  size = 'default',
  label,
  color,
  style,
}: {
  name: IconName;
  size?: 'xs' | 'sm' | 'default';
  label?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useMagnolia();
  const sizes = { xs: [16, 14], sm: [20, 16], default: [24, 20] } as const;
  const asset = icons[name][sizes[size][t.density === 'compact' ? 1 : 0]];
  return (
    <View
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
      style={[{ width: asset.size, height: asset.size, flexShrink: 0 }, style]}
    >
      <Image
        accessible={false}
        source={asset.source}
        resizeMode="contain"
        style={{
          width: asset.size,
          height: asset.size,
          tintColor: color ?? t.colors['color/fg/primary'],
        }}
      />
    </View>
  );
}
