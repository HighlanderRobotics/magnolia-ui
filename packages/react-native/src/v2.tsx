import React, { createContext, useContext, useState } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text as NativeText,
  TextInput,
  View,
} from 'react-native';
import type {
  PressableProps,
  StyleProp,
  TextInputProps,
  TextProps,
  ViewStyle,
} from 'react-native';
import { v2Tokens } from '@highlanderrobotics/magnolia-tokens/v2';
import type {
  V2Density,
  V2Theme,
} from '@highlanderrobotics/magnolia-tokens/v2';

type Theme = { mode: V2Theme; density: V2Density; fontFamily: string };
const Context = createContext<Theme>({
  mode: 'dark',
  density: 'comfortable',
  fontFamily: 'Roboto',
});
export function MagnoliaProvider({
  children,
  mode = 'dark',
  density = 'comfortable',
  fontFamily = 'Roboto',
}: PropsWithChildren<Partial<Theme>>) {
  return (
    <Context.Provider value={{ mode, density, fontFamily }}>
      {children}
    </Context.Provider>
  );
}
export function useMagnolia() {
  const theme = useContext(Context);
  return {
    ...theme,
    colors: v2Tokens.color[theme.mode],
    sizes: v2Tokens.density[theme.density],
  };
}
export function Text({ style, ...props }: TextProps) {
  const t = useMagnolia();
  return (
    <NativeText
      {...props}
      style={[
        {
          fontFamily: t.fontFamily,
          color: t.colors['color/fg/primary'],
          fontSize: t.sizes['type/body/size'],
          lineHeight: t.sizes['type/body/line'],
        },
        style,
      ]}
    />
  );
}
export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'large' | 'medium';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};
export function Button({
  children,
  icon,
  variant = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  style,
  onFocus,
  onBlur,
  onHoverIn,
  onHoverOut,
  ...rest
}: ButtonProps) {
  const t = useMagnolia();
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const c = t.colors,
    s = t.sizes;
  const ramp = (pressed: boolean) =>
    variant === 'primary'
      ? c[
          pressed
            ? 'color/bg/primary-press'
            : hover
              ? 'color/bg/primary-hover'
              : 'color/bg/accent-strong'
        ]
      : variant === 'danger'
        ? c[
            pressed
              ? 'color/bg/danger-press'
              : hover
                ? 'color/bg/danger-hover'
                : 'color/bg/danger-strong'
          ]
        : variant === 'tertiary'
          ? pressed
            ? c['color/bg/tertiary-press']
            : hover
              ? c['color/bg/tertiary-hover']
              : 'transparent'
          : c[
              pressed
                ? 'color/bg/control-press'
                : hover
                  ? 'color/bg/control-hover'
                  : 'color/bg/control'
            ];
  const foreground =
    variant === 'primary'
      ? c['color/fg/on-accent']
      : variant === 'danger'
        ? c['color/fg/on-danger']
        : c['color/fg/primary'];
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          padding: 2,
          borderWidth: 2,
          borderRadius: s['radius/control-ring'],
          borderColor: focus ? c['color/border/focus'] : 'transparent',
        },
        style,
      ]}
    >
      <Pressable
        {...rest}
        accessibilityRole="button"
        accessibilityState={{
          ...rest.accessibilityState,
          disabled: disabled || loading,
          busy: loading,
        }}
        disabled={disabled || loading}
        onFocus={(e) => {
          setFocus(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          onBlur?.(e);
        }}
        onHoverIn={(e) => {
          setHover(true);
          onHoverIn?.(e);
        }}
        onHoverOut={(e) => {
          setHover(false);
          onHoverOut?.(e);
        }}
        style={({ pressed }) => ({
          minHeight: Math.max(
            44,
            s[size === 'large' ? 'size/control' : 'size/control-sm'],
          ),
          paddingHorizontal: s['pad/control-x'],
          paddingVertical: 8,
          borderRadius: s['radius/control'],
          backgroundColor: ramp(pressed),
          opacity: disabled && !loading ? 0.4 : 1,
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: s['gap/button-icon'],
            opacity: loading ? 0 : 1,
          }}
        >
          {icon}
          <Text
            style={{
              fontSize:
                s[size === 'large' ? 'type/label/size' : 'type/label/sm/size'],
              lineHeight:
                s[size === 'large' ? 'type/label/line' : 'type/label/sm/line'],
              fontWeight: '500',
              color: foreground,
            }}
          >
            {children}
          </Text>
        </View>
        {loading && (
          <ActivityIndicator
            color={foreground}
            style={{ position: 'absolute' }}
          />
        )}
      </Pressable>
    </View>
  );
}
export type TextFieldProps = TextInputProps & {
  label: string;
  helper?: string;
  error?: string;
};
export function TextField({
  label,
  helper,
  error,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 4, opacity: rest.editable === false ? 0.4 : 1 }}>
      <Text
        style={{
          fontWeight: '500',
          fontSize: s['type/label/sm/size'],
          lineHeight: s['type/label/sm/line'],
        }}
      >
        {label}
      </Text>
      <TextInput
        {...rest}
        accessibilityLabel={rest.accessibilityLabel ?? label}
        accessibilityHint={[rest.accessibilityHint, error || helper]
          .filter(Boolean)
          .join('. ')}
        placeholderTextColor={c['color/fg/tertiary']}
        onFocus={(e) => {
          setFocus(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          onBlur?.(e);
        }}
        style={[
          {
            fontFamily: t.fontFamily,
            color: c['color/fg/primary'],
            backgroundColor: c['color/bg/field'],
            borderWidth: focus ? 2 : 1,
            borderColor: error
              ? c['color/border/danger']
              : focus
                ? c['color/border/focus']
                : c['color/border/default'],
            borderRadius: s['radius/control'],
            minHeight: Math.max(44, s['size/control']),
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: s['type/body/size'],
            lineHeight: s['type/body/line'],
          },
          style,
        ]}
      />
      {!!(error || helper) && (
        <Text
          accessibilityLiveRegion={error ? 'polite' : 'none'}
          style={{
            color: error ? c['color/fg/danger'] : c['color/fg/secondary'],
            fontSize: s['type/field-help/size'],
            lineHeight: s['type/field-help/line'],
          }}
        >
          {error ? `Error: ${error}` : helper}
        </Text>
      )}
    </View>
  );
}
export function Card({
  title,
  description,
  children,
  action,
  style,
}: PropsWithChildren<{
  title?: string;
  description?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}>) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  return (
    <View
      style={[
        {
          padding: s['pad/card'],
          borderWidth: 1,
          borderColor: c['color/border/subtle'],
          backgroundColor: c['color/bg/raised'],
          borderRadius: v2Tokens.scale['radius/lg'],
          gap: s['gap/stack'],
        },
        style,
      ]}
    >
      {(title || action) && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            {title && (
              <Text
                accessibilityRole="header"
                style={{
                  fontSize: s['type/title/sm/size'],
                  lineHeight: s['type/title/sm/line'],
                  fontWeight: '500',
                }}
              >
                {title}
              </Text>
            )}
            {description && (
              <Text
                style={{
                  fontSize: s['type/body/sm/size'],
                  lineHeight: s['type/body/sm/line'],
                  color: c['color/fg/secondary'],
                }}
              >
                {description}
              </Text>
            )}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}
export function Stat({
  label,
  value,
  unit,
  emphasis = false,
  size = 'large',
  loading = false,
}: {
  label: string;
  value?: string | number | null;
  unit?: string;
  emphasis?: boolean;
  size?: 'large' | 'medium';
  loading?: boolean;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${loading ? 'Loading' : value == null ? 'No data' : `${value}${unit ? ' ' + unit : ''}`}`}
      accessibilityState={{ busy: loading }}
      style={{ gap: 4 }}
    >
      <Text
        style={{
          color: c['color/fg/secondary'],
          fontSize: s['type/label/sm/size'],
          lineHeight: s['type/label/sm/line'],
        }}
      >
        {label}
      </Text>
      {loading ? (
        <View
          style={{
            height:
              s[
                size === 'large' ? 'type/metric/xl/line' : 'type/metric/md/line'
              ],
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              height: 24,
              width: 64,
              borderRadius: 4,
              backgroundColor: c['color/bg/skeleton'],
            }}
          />
        </View>
      ) : (
        <Text
          style={{
            fontSize:
              s[
                size === 'large' ? 'type/metric/xl/size' : 'type/metric/md/size'
              ],
            lineHeight:
              s[
                size === 'large' ? 'type/metric/xl/line' : 'type/metric/md/line'
              ],
            fontWeight: '500',
            fontVariant: ['tabular-nums'],
            color: emphasis ? c['color/fg/accent'] : c['color/fg/primary'],
          }}
        >
          {value ?? '—'}
          {unit && (
            <Text style={{ color: c['color/fg/secondary'] }}> {unit}</Text>
          )}
        </Text>
      )}
    </View>
  );
}
export function Tabs({
  label,
  value,
  onValueChange,
  items,
  children,
  segmented = false,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string; disabled?: boolean }[];
  children?: (value: string) => ReactNode;
  segmented?: boolean;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const selected =
    items.find((i) => i.value === value && !i.disabled)?.value ??
    items.find((i) => !i.disabled)?.value;
  return (
    <View>
      <ScrollView
        horizontal
        accessibilityRole="tablist"
        accessibilityLabel={label}
        contentContainerStyle={{
          gap: segmented ? 2 : 4,
          padding: segmented ? 3 : 4,
          backgroundColor: segmented ? c['color/bg/field'] : 'transparent',
          borderRadius: s['radius/control'],
        }}
      >
        {items.map((item) => (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{
              selected: selected === item.value,
              disabled: !!item.disabled,
            }}
            disabled={item.disabled}
            onPress={() => onValueChange(item.value)}
            style={({ pressed }) => ({
              minHeight: 44,
              justifyContent: 'center',
              paddingHorizontal: 12,
              borderRadius: s['radius/control-inner'],
              backgroundColor:
                selected === item.value
                  ? c[
                      segmented
                        ? 'color/bg/control-selected'
                        : 'color/bg/selected'
                    ]
                  : pressed
                    ? c['color/bg/ghost-pressed']
                    : 'transparent',
            })}
          >
            <Text
              style={{
                fontWeight: selected === item.value ? '500' : '400',
                color: item.disabled
                  ? c['color/fg/disabled']
                  : selected === item.value
                    ? c['color/fg/primary']
                    : c['color/fg/secondary'],
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {selected && children?.(selected)}
    </View>
  );
}
export function SegmentedControl(
  props: Omit<React.ComponentProps<typeof Tabs>, 'segmented'>,
) {
  return <Tabs {...props} segmented />;
}
