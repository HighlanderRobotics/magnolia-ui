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
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  ScrollView,
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
  const disabledBackground =
    backgroundColorSet?.faded ??
    (variant === 'primary'
      ? t.colors.primaryDisabled
      : variant === 'danger'
        ? t.colors.dangerDisabled
        : t.colors.secondaryDisabled);
  const disabledForeground =
    variant === 'primary'
      ? t.colors.onPrimaryDisabled
      : variant === 'danger'
        ? t.colors.onDangerDisabled
        : t.colors.onSecondaryDisabled;
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
                ? disabledBackground
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
            color: inactive ? disabledForeground : filled ? foreground : color,
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
            paddingHorizontal: sizes.fieldPaddingX,
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
          gap: t.sizes.selectionGap,
        },
        style,
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          width: t.sizes.selectionSize,
          height: t.sizes.selectionSize,
          borderWidth: 2,
          borderColor: t.colors.outline,
          borderRadius: t.sizes.selectionRadius,
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

/** Selectable filter pill; applications own which pills form an exclusive group. */
export function Pill({
  active = false,
  variant = 'primary',
  disabled = false,
  onChange,
  children,
  ...props
}: Omit<PressableProps, 'children'> & {
  active?: boolean;
  variant?: 'primary' | 'secondary';
  onChange?: (active: boolean) => void;
  children: ReactNode;
}) {
  const t = useMagnolia();
  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{
        ...props.accessibilityState,
        selected: active,
        disabled: !!disabled,
      }}
      onPress={(event) => {
        props.onPress?.(event);
        if (!event?.isDefaultPrevented()) onChange?.(!active);
      }}
      style={(state) => [
        {
          position: 'relative',
          minHeight: 48,
          minWidth: 48,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: tokens.controls.pillPaddingY,
          paddingHorizontal: tokens.controls.pillPaddingX,
          borderRadius: tokens.controls.pillRadius,
          backgroundColor: active
            ? variant === 'primary'
              ? t.colors.pillPrimaryActive
              : t.colors.pillSecondaryActive
            : 'transparent',
        },
        typeof props.style === 'function' ? props.style(state) : props.style,
      ]}
    >
      <Text
        style={{
          fontSize: tokens.controls.selectionFontSize,
          fontWeight: '500',
          color: disabled
            ? t.colors.disabledText
            : active
              ? variant === 'primary'
                ? t.colors.pillOnPrimaryActive
                : t.colors.pillOnSecondaryActive
              : t.colors.onBackground,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export type ChoiceItem = { value: string; label: string; disabled?: boolean };

/** Controlled single choice; group state belongs to the application. */
export function Radio({
  label,
  value,
  checked = false,
  disabled = false,
  onSelect,
}: {
  label: string;
  value: string;
  checked?: boolean;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}) {
  const t = useMagnolia();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onSelect?.(value)}
      style={{
        minHeight: 48,
        minWidth: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.sizes.selectionGap,
      }}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          width: t.sizes.selectionSize,
          height: t.sizes.selectionSize,
          borderRadius: t.sizes.selectionSize / 2,
          borderWidth: 2,
          borderColor: disabled
            ? t.colors.selectionDisabledBorder
            : checked
              ? t.colors.primary
              : t.colors.outline,
          backgroundColor: t.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && (
          <View
            style={{
              width: t.sizes.selectionSize / 2,
              height: t.sizes.selectionSize / 2,
              borderRadius: t.sizes.selectionSize / 4,
              backgroundColor: disabled
                ? t.colors.primaryDisabled
                : t.colors.primary,
            }}
          />
        )}
      </View>
      <Text
        color={
          disabled ? t.colors.selectionDisabledLabel : t.colors.onBackground
        }
        style={{ fontSize: tokens.controls.selectionFontSize, flexShrink: 1 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Native modal owns background isolation and Android's back-button behavior. */
export function Dialog({
  open,
  title,
  canClose = true,
  onClose,
  onDismiss,
  children,
}: PropsWithChildren<{
  open: boolean;
  title: string;
  canClose?: boolean;
  onClose: () => void;
  onDismiss?: () => void;
}>) {
  const t = useMagnolia();
  const heading = useRef<NativeText>(null);
  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={() => {
        if (canClose) onClose();
      }}
      onDismiss={onDismiss}
      onShow={() => {
        const handle = findNodeHandle(heading.current);
        if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: tokens.spacing.lg,
        }}
      >
        <Pressable
          testID="magnolia-dialog-backdrop"
          accessible={false}
          onPress={() => {
            if (canClose) onClose();
          }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: '#0008',
          }}
        />
        <View
          accessibilityViewIsModal
          importantForAccessibility="yes"
          style={{
            width: '100%',
            maxWidth: 600,
            maxHeight: '85%',
            padding: tokens.spacing.lg,
            backgroundColor: t.colors.surface,
            borderRadius: tokens.radius.dialog,
            gap: tokens.spacing.md,
          }}
        >
          <NativeText
            ref={heading}
            accessibilityRole="header"
            style={{
              fontFamily: t.fontFamily,
              fontSize: tokens.typography.title,
              color: t.colors.onBackground,
            }}
          >
            {title}
          </NativeText>
          <ScrollView
            style={{ flexShrink: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {canClose && (
            <Button
              variant="secondary"
              accessibilityLabel={`Close ${title}`}
              onPress={onClose}
            >
              Close
            </Button>
          )}
        </View>
      </View>
    </Modal>
  );
}

/** Platform choice sheet; selection stays controlled and disabled options stay visible. */
export function Select({
  label,
  value,
  items,
  onChange,
  disabled = false,
  placeholder = 'Choose an option',
  errorMessage,
}: {
  label: string;
  value?: string | null;
  items: ChoiceItem[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  errorMessage?: string;
}) {
  const t = useMagnolia();
  const [open, setOpen] = useState(false);
  const trigger = useRef<View>(null);
  const selected = items.find((item) => item.value === value);
  const restore = () => {
    const handle = findNodeHandle(trigger.current);
    if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
  };
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  return (
    <View style={{ gap: tokens.spacing.xs }}>
      <Text>{label}</Text>
      <Pressable
        ref={trigger}
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={{
          minHeight: 48,
          justifyContent: 'center',
          borderWidth: 2,
          borderRadius: t.sizes.radius,
          borderColor: errorMessage ? t.colors.errorText : t.colors.outline,
          backgroundColor: t.colors.surface,
          paddingHorizontal: t.sizes.fieldPaddingX,
          paddingVertical: t.sizes.paddingY,
        }}
      >
        <Text
          color={
            disabled
              ? t.colors.disabledText
              : selected
                ? t.colors.onBackground
                : t.colors.placeholder
          }
        >
          {selected?.label ?? placeholder}
        </Text>
      </Pressable>
      {errorMessage && (
        <Text accessibilityRole="alert" color={t.colors.errorText}>
          {errorMessage}
        </Text>
      )}
      <Dialog
        open={open && !disabled}
        title={label}
        onClose={() => setOpen(false)}
        onDismiss={restore}
      >
        {items.map((item) => (
          <Radio
            key={item.value}
            {...item}
            checked={value === item.value}
            onSelect={(next) => {
              onChange(next);
              setOpen(false);
            }}
          />
        ))}
      </Dialog>
    </View>
  );
}

/** Native action sheet rather than desktop menu keyboard semantics. */
export function Menu({
  open,
  onClose,
  onDismiss,
  label = 'Actions',
  items,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  label?: string;
  items: (ChoiceItem & { danger?: boolean })[];
  onSelect: (value: string) => void | Promise<void>;
}) {
  return (
    <Dialog {...{ open, onClose, onDismiss }} title={label}>
      <View style={{ gap: tokens.spacing.sm }}>
        {items.map((item) => (
          <Button
            key={item.value}
            disabled={item.disabled}
            variant={item.danger ? 'danger' : 'secondary'}
            onPress={async () => {
              await onSelect(item.value);
              onClose();
            }}
          >
            {item.label}
          </Button>
        ))}
      </View>
    </Dialog>
  );
}
