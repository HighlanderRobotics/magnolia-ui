import React from 'react';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text, Glyph, useMagnolia } from './v2.js';

export function Accordion({
  title,
  open = false,
  onOpenChange,
  disabled = false,
  children,
  style,
}: {
  title: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useMagnolia(),
    [focus, setFocus] = React.useState(false),
    [hover, setHover] = React.useState(false);
  const foreground =
      t.colors[disabled ? 'color/fg/disabled' : 'color/fg/primary'],
    secondary = t.colors[disabled ? 'color/fg/disabled' : 'color/fg/secondary'];
  return (
    <View
      style={[
        {
          width: 400,
          maxWidth: '100%',
          borderBottomWidth: 1,
          borderBottomColor: t.colors['color/border/subtle'],
        },
        style,
      ]}
    >
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: open, disabled }}
        onPress={() => onOpenChange?.(!open)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={({ pressed }) => ({
          minHeight: 48,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderRadius: 8,
          backgroundColor:
            !disabled && pressed
              ? t.colors['color/bg/ghost-pressed']
              : !disabled && hover
                ? t.colors['color/bg/ghost-hover']
                : 'transparent',
          outlineWidth: focus ? 2 : 0,
          outlineOffset: -2,
          outlineColor: t.colors['color/border/focus'],
        })}
      >
        <Text
          style={{
            flex: 1,
            minWidth: 0,
            color: foreground,
            fontSize: t.sizes['type/label/size'],
            lineHeight: t.sizes['type/label/line'],
            fontWeight: '500',
          }}
        >
          {title}
        </Text>
        <Glyph
          name={open ? 'accordion-up' : 'accordion-down'}
          color={secondary}
        />
      </Pressable>
      {open && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 16 }}>
          {typeof children === 'string' || typeof children === 'number' ? (
            <Text
              style={{
                color: t.colors['color/fg/secondary'],
                fontSize: t.sizes['type/body/size'],
                lineHeight: t.sizes['type/body/line'],
              }}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </View>
  );
}
