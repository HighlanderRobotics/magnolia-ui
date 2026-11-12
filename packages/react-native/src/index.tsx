import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Switch as NativeSwitch,
  Text as NativeText,
  TextInput,
  View,
} from 'react-native';
import type {
  PressableProps,
  TextProps,
  TextInputProps,
  SwitchProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { tokens } from '@highlanderrobotics/magnolia-tokens';
import type { Density, ThemeMode } from '@highlanderrobotics/magnolia-tokens';
export type { Density, ThemeMode };
export type ColorSet = { default: string; hover: string; faded: string };
type Theme = {
  mode: ThemeMode;
  density: Density;
  fontFamily: string;
  iconFontFamily: string;
};
const Context = createContext<Theme>({
  mode: 'dark',
  density: 'comfortable',
  fontFamily: 'Heebo_400Regular',
  iconFontFamily: 'MaterialSymbols_500Rounded',
});
export function MagnoliaProvider({
  children,
  mode = 'dark',
  density = 'comfortable',
  fontFamily = 'Heebo_400Regular',
  iconFontFamily = 'MaterialSymbols_500Rounded',
}: PropsWithChildren<Partial<Theme>>) {
  return (
    <Context.Provider value={{ mode, density, fontFamily, iconFontFamily }}>
      {children}
    </Context.Provider>
  );
}
export function useMagnolia() {
  const theme = useContext(Context);
  return {
    ...theme,
    colors: tokens.themes[theme.mode],
    sizes: tokens.density[theme.density],
    frc: tokens.frc[theme.mode],
  };
}
export function Text({
  style,
  color,
  ...props
}: TextProps & { color?: string }) {
  const t = useMagnolia();
  return (
    <NativeText
      {...props}
      style={[
        {
          fontFamily: t.fontFamily,
          fontSize: tokens.typography.body,
          color: color ?? t.colors.onBackground,
        },
        style,
      ]}
    />
  );
}
export function BodyMedium(props: TextProps & { color?: string }) {
  const t = useMagnolia();
  return (
    <Text
      {...props}
      style={[
        { fontSize: tokens.typography.small, color: t.colors.muted },
        props.style,
      ]}
    />
  );
}
export function LabelSmall(props: TextProps & { color?: string }) {
  return (
    <Text
      {...props}
      style={[{ fontSize: tokens.typography.small }, props.style]}
    />
  );
}
export function TitleLarge(props: TextProps & { color?: string }) {
  return (
    <Text
      {...props}
      accessibilityRole="header"
      style={[{ fontSize: 40, fontWeight: '500' }, props.style]}
    />
  );
}
export function TitleMedium(props: TextProps & { color?: string }) {
  return (
    <Text
      {...props}
      accessibilityRole="header"
      style={[{ fontSize: 30, fontWeight: '500' }, props.style]}
    />
  );
}
export function Heading1Small(props: TextProps & { color?: string }) {
  return (
    <Text
      {...props}
      accessibilityRole="header"
      style={[{ fontSize: 20, lineHeight: 32, fontWeight: '500' }, props.style]}
    />
  );
}
export type ButtonProps = Omit<
  PressableProps,
  'children' | 'onPress' | 'style'
> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  filled?: boolean;
  density?: Density;
  onPress?: () => void | Promise<void>;
  loading?: boolean;
  loadingChildren?: ReactNode;
  flex?: number;
  borderRadius?: number;
  backgroundColorSet?: ColorSet;
  style?: PressableProps['style'];
  onError?: (error: unknown) => void;
};
export function Button({
  children,
  variant = 'secondary',
  filled = true,
  disabled = false,
  density,
  onPress,
  loading = false,
  loadingChildren,
  style,
  flex,
  borderRadius,
  backgroundColorSet,
  onError,
  ...rest
}: ButtonProps) {
  const t = useMagnolia();
  const sizes = tokens.density[density ?? t.density];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const inactive = disabled || loading || busy;
  const color =
    variant === 'primary'
      ? t.colors.primary
      : variant === 'danger'
        ? t.colors.danger
        : t.colors.secondary;
  const foreground =
    variant === 'primary'
      ? t.colors.onPrimary
      : variant === 'danger'
        ? t.colors.onDanger
        : t.colors.onSecondary;
  async function press() {
    if (inFlight.current || inactive) return;
    inFlight.current = true;
    setError(null);
    setBusy(true);
    try {
      await onPress?.();
    } catch (cause) {
      if (mounted.current) {
        setError(cause instanceof Error ? cause.message : String(cause));
        onError?.(cause);
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <View style={flex === undefined ? undefined : { flex }}>
      {error && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          color={t.colors.errorText}
        >
          {error}
        </Text>
      )}
      <Pressable
        {...rest}
        accessibilityRole="button"
        accessibilityState={{
          ...rest.accessibilityState,
          disabled: !!inactive,
          busy: busy || loading,
        }}
        disabled={inactive}
        onPress={press}
        style={(state) => [
          {
            minHeight: Math.max(48, sizes.target),
            minWidth: 48,
            paddingVertical: sizes.paddingY,
            paddingHorizontal: sizes.paddingX,
            borderRadius: borderRadius ?? sizes.radius,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: tokens.spacing.sm,
            backgroundColor: !filled
              ? 'transparent'
              : inactive
                ? (backgroundColorSet?.faded ?? t.colors.disabledSurface)
                : backgroundColorSet
                  ? state.pressed
                    ? backgroundColorSet.hover
                    : backgroundColorSet.default
                  : state.pressed
                    ? variant === 'primary'
                      ? t.colors.primaryHover
                      : variant === 'danger'
                        ? t.colors.dangerHover
                        : t.colors.secondaryHover
                    : color,
          },
          typeof style === 'function' ? style(state) : style,
        ]}
      >
        {(busy || loading) && (
          <ActivityIndicator color={filled ? foreground : color} />
        )}
        <Text
          style={{
            fontSize: sizes.fontSize,
            fontWeight: '500',
            color: inactive
              ? t.colors.disabledText
              : filled
                ? foreground
                : color,
          }}
        >
          {busy || loading ? (loadingChildren ?? children) : children}
        </Text>
      </Pressable>
    </View>
  );
}
export const TextField = forwardRef<
  TextInput,
  TextInputProps & {
    density?: Density;
    errorMessage?: string;
    error?: boolean;
    label?: string;
  }
>(({ density, errorMessage, error, label, style, ...props }, ref) => {
  const t = useMagnolia();
  const sizes = tokens.density[density ?? t.density];
  const [focused, setFocused] = useState(false);
  return (
    <View>
      {label && <Text>{label}</Text>}
      <TextInput
        {...props}
        ref={ref}
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityHint={
          [props.accessibilityHint, errorMessage].filter(Boolean).join('. ') ||
          undefined
        }
        placeholderTextColor={
          props.placeholderTextColor ?? t.colors.placeholder
        }
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[
          {
            minHeight: 48,
            fontFamily: t.fontFamily,
            fontSize: sizes.fontSize,
            color:
              props.editable === false
                ? t.colors.disabledText
                : t.colors.onBackground,
            backgroundColor:
              props.editable === false
                ? t.colors.disabledSurface
                : t.colors.surface,
            borderWidth: 2,
            borderColor:
              errorMessage || error
                ? t.colors.errorText
                : focused
                  ? t.colors.focus
                  : t.colors.outline,
            borderRadius: sizes.radius,
            paddingVertical: sizes.paddingY,
            paddingHorizontal: tokens.spacing.md,
          },
          style,
        ]}
      />
      {errorMessage && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          color={t.colors.errorText}
        >
          {errorMessage}
        </Text>
      )}
    </View>
  );
});
TextField.displayName = 'MagnoliaTextField';
export function Switch(props: SwitchProps) {
  const t = useMagnolia();
  return (
    <NativeSwitch
      {...props}
      accessibilityRole="switch"
      accessibilityState={{
        ...props.accessibilityState,
        checked: !!props.value,
        disabled: !!props.disabled,
      }}
      trackColor={{ false: t.colors.secondary, true: t.colors.primary }}
    />
  );
}
export function Checkbox({
  label,
  checked = false,
  disabled = false,
  onChange,
  style,
}: {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useMagnolia();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={[
        {
          minHeight: 48,
          minWidth: 48,
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.spacing.sm,
        },
        style,
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          width: 24,
          height: 24,
          borderWidth: 2,
          borderColor: t.colors.outline,
          borderRadius: tokens.radius.compact,
          backgroundColor: checked ? t.colors.primary : t.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && <Text color={t.colors.onPrimary}>✓</Text>}
      </View>
      <Text color={disabled ? t.colors.disabledText : t.colors.onBackground}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Icon({
  name,
  size = 24,
  color,
  label,
  renderIcon,
}: {
  name: string;
  size?: number;
  color?: string;
  label?: string;
  renderIcon?: (name: string, size: number, color: string) => ReactNode;
}) {
  const t = useMagnolia();
  const resolved = color ?? t.colors.onBackground;
  return (
    <View
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    >
      {renderIcon ? (
        renderIcon(name, size, resolved)
      ) : (
        <NativeText
          allowFontScaling={false}
          style={{
            fontFamily: t.iconFontFamily,
            fontSize: size,
            color: resolved,
          }}
        >
          {name}
        </NativeText>
      )}
    </View>
  );
}
export function Alert({
  children,
  variant = 'info',
}: PropsWithChildren<{ variant?: 'info' | 'danger' }>) {
  const t = useMagnolia();
  return (
    <View
      accessibilityRole={variant === 'danger' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={{
        padding: tokens.spacing.md,
        borderWidth: 1,
        borderColor: t.colors.outline,
        borderRadius: tokens.radius.control,
      }}
    >
      <Text
        color={
          variant === 'danger' ? t.colors.errorText : t.colors.onBackground
        }
      >
        {children}
      </Text>
    </View>
  );
}
