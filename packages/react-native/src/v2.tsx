import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  AccessibilityInfo,
  findNodeHandle,
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
import { nativeGlyphs, type NativeGlyphName } from './v2-glyphs.generated.js';
export { NumberField, Stepper, Link, SelectableCard } from './v2-numeric.js';
export { Steps, FileField, Attachment } from './v2-files.js';
export { DayCell, Calendar, DateField, TimeField } from './v2-temporal.js';
export { Combobox, MultiSelect } from './v2-combo.js';
export { Slider } from './v2-slider.js';
export {
  NavItem,
  NavRailItem,
  NavSection,
  Breadcrumb,
  TabBarItem,
  TabBar,
  TopBar,
} from './v2-navigation.js';
export {
  Badge,
  StatusIndicator,
  Trend,
  Avatar,
  AvatarGroup,
  Spinner,
  Skeleton,
  ProgressBar,
  ProgressRing,
  Divider,
  CardHeader,
  EmptyState,
  Banner,
  ListItem,
  AmbientWash,
} from './v2-display.js';
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
  children?: ReactNode;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'large' | 'medium';
  loading?: boolean;
  iconOnly?: boolean;
  style?: StyleProp<ViewStyle>;
};
export function Button({
  children,
  icon,
  variant = 'primary',
  size = 'large',
  loading = false,
  iconOnly = false,
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
          outlineWidth: focus ? 2 : 0,
          outlineOffset: 2,
          borderRadius: s['radius/control'],
          outlineColor: c['color/border/focus'],
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
          paddingHorizontal: iconOnly ? 0 : s['pad/control-x'],
          minWidth: iconOnly ? Math.max(44, s['size/control']) : undefined,
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
          {iconOnly ? (
            children
          ) : (
            <Text
              style={{
                fontSize:
                  s[
                    size === 'large' ? 'type/label/size' : 'type/label/sm/size'
                  ],
                lineHeight:
                  s[
                    size === 'large' ? 'type/label/line' : 'type/label/sm/line'
                  ],
                fontWeight: '500',
                color: foreground,
              }}
            >
              {children}
            </Text>
          )}
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

/** Raster derivatives preserve the original Figma silhouette; tint supplies semantic colors. */
export function Glyph({
  name,
  color,
  style,
}: {
  name: NativeGlyphName;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useMagnolia();
  const pairs: Partial<Record<NativeGlyphName, NativeGlyphName>> = {
    check: 'check-compact',
    modifier: 'modifier-compact',
    'chip-check': 'chip-check-compact',
    'radio-box': 'radio-box-compact',
    'radio-dot': 'radio-dot-compact',
    'switch-track': 'switch-track-compact',
    'switch-thumb': 'switch-thumb-compact',
  };
  const asset =
    nativeGlyphs[t.density === 'compact' ? (pairs[name] ?? name) : name];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={style}
    >
      <Image
        source={asset.source}
        resizeMode="stretch"
        style={{
          width:
            t.density === 'compact' && name === 'mixed'
              ? 10
              : t.density === 'compact' && name === 'ellipsis'
                ? 16
                : asset.width,
          height:
            t.density === 'compact' && name === 'mixed'
              ? 10
              : t.density === 'compact' && name === 'ellipsis'
                ? 16
                : asset.height,
          tintColor: color ?? t.colors['color/fg/primary'],
        }}
      />
    </View>
  );
}
type ChoiceProps = {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  error?: string;
  onCheckedChange?: (checked: boolean) => void;
};
function Choice({
  label,
  checked = false,
  disabled = false,
  error,
  onCheckedChange,
  kind,
  indeterminate = false,
}: {
  kind: 'checkbox' | 'radio' | 'switch';
  indeterminate?: boolean;
} & ChoiceProps) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const [hover, setHover] = useState(false),
    [focus, setFocus] = useState(false);
  const mark = checked || indeterminate;
  return (
    <View>
      <Pressable
        accessibilityRole={kind}
        accessibilityLabel={label}
        accessibilityHint={error}
        accessibilityState={{
          checked: indeterminate ? 'mixed' : checked,
          disabled,
        }}
        disabled={disabled}
        onPress={() => onCheckedChange?.(!checked)}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={({ pressed }) => ({
          minHeight: 44,
          flexDirection: 'row',
          alignItems: 'center',
          gap: s['gap/choice'],
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: s['radius/control'],
          opacity: disabled ? 0.4 : 1,
          backgroundColor: pressed
            ? c['color/bg/ghost-pressed']
            : hover
              ? c['color/bg/ghost-hover']
              : 'transparent',
        })}
      >
        {({ pressed }) => {
          const accent =
            c[
              pressed
                ? 'color/bg/primary-press'
                : hover
                  ? 'color/bg/primary-hover'
                  : 'color/bg/accent-strong'
            ];
          const stroke = error
            ? c['color/border/danger']
            : focus
              ? c['color/border/focus']
              : hover
                ? c['color/border/strong']
                : c['color/fg/disabled'];
          if (kind === 'switch')
            return (
              <>
                <View
                  style={{
                    width: s['size/switch-width'],
                    height: s['size/switch-height'],
                    borderRadius: 999,
                    outlineColor: c['color/border/focus'],
                    outlineWidth: focus ? 2 : 0,
                    outlineOffset: 2,
                  }}
                >
                  <Glyph
                    name="switch-track"
                    color={
                      checked
                        ? accent
                        : c[
                            hover
                              ? 'color/border/strong'
                              : 'color/border/default'
                          ]
                    }
                  />
                  <Glyph
                    name="switch-thumb"
                    color={c['color/bg/thumb']}
                    style={{
                      position: 'absolute',
                      top: 2,
                      start: checked
                        ? s['size/switch-width'] - s['size/switch-thumb'] - 2
                        : 2,
                    }}
                  />
                </View>
                <Text>{label}</Text>
              </>
            );
          return (
            <>
              <View
                style={{
                  width: s['size/checkbox'],
                  height: s['size/checkbox'],
                  borderRadius: kind === 'radio' ? 999 : 4,
                  borderWidth: mark && kind === 'radio' ? 0 : 1,
                  borderColor: mark ? accent : stroke,
                  backgroundColor:
                    mark && kind === 'checkbox' ? accent : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outlineColor: focus
                    ? c['color/border/focus']
                    : error
                      ? c['color/border/danger']
                      : 'transparent',
                  outlineWidth: focus || error ? 2 : 0,
                  outlineOffset: 2,
                }}
              >
                {mark &&
                  (kind === 'radio' ? (
                    <>
                      <Glyph name="radio-box" color={accent} />
                      <Glyph
                        name="radio-dot"
                        color={c['color/fg/choice-glyph']}
                        style={{ position: 'absolute' }}
                      />
                    </>
                  ) : (
                    <Glyph
                      name={indeterminate ? 'mixed' : 'check'}
                      color={c['color/fg/choice-glyph']}
                    />
                  ))}
              </View>
              <Text>{label}</Text>
            </>
          );
        }}
      </Pressable>
      {error && (
        <Text
          style={{
            color: c['color/fg/danger'],
            fontSize: s['type/field-help/size'],
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
export function Checkbox(props: ChoiceProps & { indeterminate?: boolean }) {
  return <Choice {...props} kind="checkbox" />;
}
export function Radio({
  value,
  onValueChange,
  ...props
}: Omit<ChoiceProps, 'onCheckedChange'> & {
  value: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <Choice
      {...props}
      kind="radio"
      onCheckedChange={() => onValueChange?.(value)}
    />
  );
}
export function Switch(props: ChoiceProps) {
  return <Choice {...props} kind="switch" />;
}
export function Chip({
  label,
  selected = false,
  disabled = false,
  onSelectedChange,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const foreground = selected
    ? t.mode === 'dark'
      ? v2Tokens.primitives['purple/200']
      : c['color/fg/accent']
    : c['color/fg/primary'];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={() => onSelectedChange?.(!selected)}
      style={({ pressed }) => ({
        alignSelf: 'flex-start',
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: s['gap/chip-glyph'],
        paddingHorizontal: s['pad/chip-x'],
        borderRadius: s['radius/chip'],
        borderWidth: 1,
        borderColor: c['color/border/edge'],
        opacity: disabled ? 0.4 : 1,
        backgroundColor: selected
          ? c[
              pressed
                ? 'color/bg/accent-subtle-pressed'
                : 'color/bg/accent-subtle'
            ]
          : c[pressed ? 'color/bg/chip-off-pressed' : 'color/bg/chip-off'],
      })}
    >
      {selected && <Glyph name="chip-check" color={foreground} />}
      <Text
        style={{
          fontSize: s['type/label/sm/size'],
          lineHeight: s['type/label/sm/line'],
          fontWeight: '500',
          color: foreground,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function IconButton({
  label,
  icon,
  variant = 'primary',
  ...rest
}: Omit<ButtonProps, 'children' | 'iconOnly'> & { label: string }) {
  const t = useMagnolia();
  const color =
    t.colors[
      variant === 'primary'
        ? 'color/fg/on-accent'
        : variant === 'danger'
          ? 'color/fg/on-danger'
          : 'color/fg/primary'
    ];
  return (
    <Button {...rest} variant={variant} accessibilityLabel={label} iconOnly>
      {icon ?? <Glyph name="ellipsis" color={color} />}
    </Button>
  );
}
export function Kbd({
  keyName,
  modifier = false,
  variant = 'cap',
  disabled = false,
}: {
  keyName: string;
  modifier?: boolean;
  variant?: 'cap' | 'field';
  disabled?: boolean;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  return (
    <View
      accessible
      accessibilityLabel={modifier ? `Command ${keyName}` : keyName}
      style={{
        alignSelf: 'flex-start',
        minHeight: s['size/kbd'],
        minWidth: s['size/kbd'],
        paddingHorizontal: s['pad/kbd-x'],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s['kbd/gap-letter'],
        borderWidth: variant === 'cap' ? 1 : 0,
        borderColor: v2Tokens.primitives['alpha/white-12'],
        borderRadius: 4,
        backgroundColor:
          c[
            variant === 'cap'
              ? 'color/bg/tertiary-hover'
              : 'color/bg/neutral-subtle'
          ],
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {modifier && (
        <View style={{ width: 10.5, height: s['size/kbd-glyph'] }}>
          <Glyph
            name="modifier"
            color={c['color/fg/secondary']}
            style={{ position: 'absolute', left: 0, top: -0.075 }}
          />
        </View>
      )}
      <Text
        style={{
          fontSize: s['type/kbd/size'],
          lineHeight: s['type/kbd/line'],
          fontWeight: '500',
          color: c['color/fg/secondary'],
        }}
      >
        {keyName}
      </Text>
    </View>
  );
}
export function SearchField({
  label,
  value = '',
  onChangeText,
  style,
  ...rest
}: TextInputProps & { label: string }) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const input = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={{
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: s['gap/inline'],
        paddingHorizontal: 12,
        borderWidth: focused ? 2 : 1,
        borderColor: c[focused ? 'color/border/focus' : 'color/border/default'],
        borderRadius: s['radius/control'],
        backgroundColor: c['color/bg/field'],
        opacity: rest.editable === false ? 0.4 : 1,
      }}
    >
      <Glyph name="search" color={c['color/fg/secondary']} />
      <TextInput
        {...rest}
        ref={input}
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={rest.accessibilityLabel ?? label}
        placeholderTextColor={c['color/fg/tertiary']}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
        style={[
          {
            flex: 1,
            minWidth: 0,
            fontFamily: t.fontFamily,
            fontSize: s['type/body/size'],
            lineHeight: s['type/body/line'],
            color: c['color/fg/primary'],
            paddingVertical: 8,
          },
          style,
        ]}
      />
      {!!value && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Clear ${label}`}
          disabled={rest.editable === false}
          hitSlop={14}
          onPress={() => {
            onChangeText?.('');
            input.current?.focus();
          }}
        >
          <Glyph name="clear" color={c['color/fg/secondary']} />
        </Pressable>
      )}
    </View>
  );
}
export function TextArea({
  characterLimit,
  value = '',
  error,
  helper,
  onContentSizeChange,
  ...rest
}: TextFieldProps & { characterLimit?: number }) {
  const t = useMagnolia();
  const [height, setHeight] = useState<number>(t.sizes['size/textarea-min']);
  const over = characterLimit !== undefined && value.length > characterLimit;
  return (
    <TextField
      {...rest}
      value={value}
      multiline
      error={error ?? (over ? `Up to ${characterLimit} characters` : undefined)}
      helper={
        helper ??
        (characterLimit !== undefined
          ? `${value.length} / ${characterLimit}`
          : undefined)
      }
      onContentSizeChange={(event) => {
        setHeight(
          Math.min(
            6 * t.sizes['type/body/line'] + 20,
            Math.max(
              t.sizes['size/textarea-min'],
              event.nativeEvent.contentSize.height,
            ),
          ),
        );
        onContentSizeChange?.(event);
      }}
      style={[
        {
          height,
          minHeight: Math.max(44, t.sizes['size/textarea-min']),
          textAlignVertical: 'top',
        },
        rest.style,
      ]}
    />
  );
}
type ChoiceItem = { label: string; value: string; disabled?: boolean };
export function Select({
  label,
  value,
  items,
  onValueChange,
  disabled = false,
  placeholder = 'Choose an option',
  error,
}: {
  label: string;
  value?: string | null;
  items: ChoiceItem[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const [open, setOpen] = useState(false);
  const trigger = useRef<View>(null);
  const selected = items.find((i) => i.value === value);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const close = () => {
    setOpen(false);
    const target = findNodeHandle(trigger.current);
    if (target != null) AccessibilityInfo.setAccessibilityFocus(target);
  };
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontSize: s['type/label/sm/size'], fontWeight: '500' }}>
        {label}
      </Text>
      <Pressable
        ref={trigger}
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        accessibilityHint={error}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={{
          minHeight: 44,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          borderWidth: 1,
          borderColor:
            c[error ? 'color/border/danger' : 'color/border/default'],
          borderRadius: s['radius/control'],
          backgroundColor: c['color/bg/field'],
        }}
      >
        <Text
          style={{
            color: c[selected ? 'color/fg/primary' : 'color/fg/tertiary'],
          }}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Glyph name="chevron-down" color={c['color/fg/secondary']} />
      </Pressable>
      {error && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: c['color/fg/danger'] }}
        >
          {error}
        </Text>
      )}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
        onDismiss={() => {
          const target = findNodeHandle(trigger.current);
          if (target != null) AccessibilityInfo.setAccessibilityFocus(target);
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: 24,
            backgroundColor: c['color/bg/scrim'],
          }}
        >
          <View
            style={{
              padding: 16,
              borderWidth: 1,
              borderColor: c['color/border/subtle'],
              borderRadius: 12,
              backgroundColor: c['color/bg/overlay'],
              maxHeight: '80%',
            }}
          >
            <Text accessibilityRole="header">{label}</Text>
            <ScrollView accessibilityRole="radiogroup">
              {items.map((item) => (
                <Pressable
                  key={item.value}
                  accessibilityRole="radio"
                  accessibilityLabel={item.label}
                  accessibilityState={{
                    checked: item.value === value,
                    disabled: !!item.disabled,
                  }}
                  disabled={item.disabled}
                  onPress={() => {
                    onValueChange(item.value);
                    close();
                  }}
                  style={({ pressed }) => ({
                    minHeight: 44,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 8,
                    borderRadius: s['radius/control-inner'],
                    backgroundColor: pressed
                      ? c['color/bg/ghost-pressed']
                      : item.value === value
                        ? c['color/bg/selected']
                        : 'transparent',
                  })}
                >
                  <Text
                    style={{
                      color:
                        c[
                          item.disabled
                            ? 'color/fg/disabled'
                            : 'color/fg/primary'
                        ],
                    }}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && <Glyph name="option-check" />}
                </Pressable>
              ))}
            </ScrollView>
            <Button variant="tertiary" onPress={close}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export {
  Table,
  TableHeaderCell,
  TableCell,
  TableRow,
  Pagination,
  PaginationPages,
  BulkActionBar,
} from './v2-data.js';

export {
  Sparkline,
  LegendItem,
  ChartTooltip,
  BarChart,
  Heatmap,
} from './v2-charts.js';

export { Distribution, Scatter, LineChart } from './v2-statistical-charts.js';

export {
  Accordion,
  Tooltip,
  Menu,
  MenuItem,
  MenuSeparator,
} from './v2-overlays.js';
