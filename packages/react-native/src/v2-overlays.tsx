import React from 'react';
import type { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Text, Glyph, Kbd, Divider, useMagnolia } from './v2.js';

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

/** Native hints describe the action; long press opens the matching visual callout. */
export function Tooltip({
  label,
  shortcut,
  modifier = false,
  trigger,
}: {
  label: string;
  shortcut?: string;
  modifier?: boolean;
  trigger: (
    props: Pick<PressableProps, 'onLongPress' | 'accessibilityHint'> & {
      ref: React.Ref<View>;
    },
  ) => ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const t = useMagnolia(),
    {
      anchor,
      triggerRef,
      viewport,
      left,
      top,
      measure,
      onLayout,
      restoreFocus,
    } = useAnchoredPopup(open);
  function close() {
    setOpen(false);
    restoreFocus();
  }
  const hint = [
    label,
    shortcut ? `${modifier ? 'Command ' : ''}${shortcut}` : undefined,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <View ref={anchor} collapsable={false} style={{ alignSelf: 'flex-start' }}>
      {trigger({
        ref: triggerRef,
        accessibilityHint: hint,
        onLongPress: () => {
          measure();
          setOpen(true);
        },
      })}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={close}
      >
        <View accessibilityViewIsModal style={{ flex: 1 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Dismiss ${label} tooltip`}
            onPress={close}
            style={{ position: 'absolute', inset: 0 }}
          />
          <View
            accessible
            accessibilityLabel={hint}
            onAccessibilityEscape={close}
            onLayout={onLayout}
            style={{
              position: 'absolute',
              left,
              top,
              maxWidth: viewport.width - 16,
              maxHeight: viewport.height - 16,
              paddingVertical: 6,
              paddingHorizontal: 8,
              borderWidth: 1,
              borderColor: t.colors['color/border/subtle'],
              borderRadius: 8,
              backgroundColor: t.colors['color/bg/overlay'],
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 1px 2px #0003, 0 8px 20px #0000004d',
            }}
          >
            <Text
              style={{
                flexShrink: 1,
                color: t.colors['color/fg/primary'],
                fontSize: t.sizes['type/label/sm/size'],
                lineHeight: t.sizes['type/label/sm/line'],
                fontWeight: '500',
              }}
            >
              {label}
            </Text>
            {shortcut && <Kbd keyName={shortcut} modifier={modifier} />}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/** Shared measurements keep native callouts outside clipping parents and within the window. */
function useAnchoredPopup(open: boolean) {
  const viewport = useWindowDimensions(),
    anchor = React.useRef<View>(null),
    triggerRef = React.useRef<View>(null);
  const [frame, setFrame] = React.useState({
      x: 8,
      y: 8,
      width: 0,
      height: 44,
    }),
    [size, setSize] = React.useState({ width: 0, height: 0 });
  const measure = React.useCallback(
    () =>
      anchor.current?.measureInWindow((x, y, width, height) =>
        setFrame({ x, y, width, height }),
      ),
    [],
  );
  React.useEffect(() => {
    if (open) measure();
  }, [open, viewport.width, viewport.height, measure]);
  const onLayout = React.useCallback(
    (event: import('react-native').LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setSize((old) =>
        old.width === width && old.height === height ? old : { width, height },
      );
    },
    [],
  );
  const focusFrame = React.useRef<number | undefined>(undefined);
  React.useEffect(
    () => () => {
      if (focusFrame.current !== undefined)
        cancelAnimationFrame(focusFrame.current);
    },
    [],
  );
  const focusElement = React.useCallback(
    (target: () => View | null | undefined) => {
      if (focusFrame.current !== undefined)
        cancelAnimationFrame(focusFrame.current);
      focusFrame.current = requestAnimationFrame(() => {
        focusFrame.current = undefined;
        const element = target();
        if (!element) return;
        element.focus();
        const node = findNodeHandle(element);
        if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
      });
    },
    [],
  );
  const restoreFocus = React.useCallback(
    () => focusElement(() => triggerRef.current),
    [focusElement],
  );
  const gap = 8,
    left = Math.max(gap, Math.min(frame.x, viewport.width - size.width - gap)),
    below = frame.y + frame.height + gap,
    top = Math.max(
      gap,
      Math.min(
        below + size.height <= viewport.height - gap
          ? below
          : frame.y - size.height - gap,
        viewport.height - size.height - gap,
      ),
    );
  return {
    viewport,
    anchor,
    triggerRef,
    measure,
    onLayout,
    restoreFocus,
    focusElement,
    left,
    top,
  };
}

const ActionMenuContext = React.createContext<{
  close: () => void;
  highlighted: string | undefined;
  setHighlighted: React.Dispatch<React.SetStateAction<string | undefined>>;
  register: (id: string, node: View | null) => void;
} | null>(null);

export function Menu({
  label,
  open,
  onOpenChange,
  trigger,
  children,
}: {
  label: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: (
    props: Pick<
      PressableProps,
      'onPress' | 'accessibilityState' | 'accessibilityHint'
    > & { ref: React.Ref<View> },
  ) => ReactNode;
  children?: ReactNode;
}) {
  const t = useMagnolia(),
    [internal, setInternal] = React.useState(false),
    [highlighted, setHighlighted] = React.useState<string>();
  const visible = open ?? internal,
    popup = useAnchoredPopup(visible),
    items = React.useRef(new Map<string, View>());
  const register = React.useCallback((id: string, node: View | null) => {
    if (node) items.current.set(id, node);
    else items.current.delete(id);
  }, []);
  function change(next: boolean) {
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
    if (next) popup.measure();
  }
  function close() {
    change(false);
    setHighlighted(undefined);
    popup.restoreFocus();
  }
  return (
    <View
      ref={popup.anchor}
      collapsable={false}
      style={{ alignSelf: 'flex-start' }}
    >
      {trigger({
        ref: popup.triggerRef,
        accessibilityState: { expanded: visible },
        accessibilityHint: `Opens ${label} menu`,
        onPress: () => change(!visible),
      })}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={close}
        onShow={() =>
          popup.focusElement(() => items.current.values().next().value)
        }
      >
        <View accessibilityViewIsModal style={{ flex: 1 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Dismiss ${label} menu`}
            onPress={close}
            style={{ position: 'absolute', inset: 0 }}
          />
          <View
            onLayout={popup.onLayout}
            onAccessibilityEscape={close}
            style={{
              position: 'absolute',
              left: popup.left,
              top: popup.top,
              width: 248,
              maxWidth: popup.viewport.width - 16,
              maxHeight: popup.viewport.height - 16,
              borderWidth: 1,
              borderColor: t.colors['color/border/subtle'],
              borderRadius: 12,
              backgroundColor: t.colors['color/bg/overlay'],
              boxShadow: '0 1px 2px #0003, 0 8px 20px #0000004d',
              overflow: 'hidden',
            }}
          >
            <ScrollView
              accessibilityLabel={label}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 4 }}
            >
              <ActionMenuContext.Provider
                value={{ close, highlighted, setHighlighted, register }}
              >
                {children ?? <Text>No actions</Text>}
              </ActionMenuContext.Provider>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function MenuItem({
  label,
  icon,
  shortcut,
  modifier = false,
  checked,
  tone = 'default',
  disabled = false,
  onPress,
  onFocus,
  onBlur,
  onHoverIn,
  onHoverOut,
  style,
  ...rest
}: Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  modifier?: boolean;
  checked?: boolean;
  tone?: 'default' | 'destructive';
  style?: StyleProp<ViewStyle>;
}) {
  const t = useMagnolia(),
    menu = React.useContext(ActionMenuContext),
    id = React.useId(),
    [local, setLocal] = React.useState(false),
    register = menu?.register;
  const item = React.useRef<View>(null),
    focused = React.useRef(false),
    hovered = React.useRef(false);
  const ref = React.useCallback(
    (node: View | null) => {
      item.current = node;
      register?.(id, disabled ? null : node);
    },
    [register, id, disabled],
  );
  const highlighted = menu ? menu.highlighted === id : local,
    foreground =
      t.colors[
        disabled
          ? 'color/fg/disabled'
          : tone === 'destructive'
            ? 'color/fg/danger'
            : 'color/fg/primary'
      ];
  function highlight() {
    if (menu) menu.setHighlighted(id);
    else setLocal(true);
  }
  function clear() {
    if (menu)
      menu.setHighlighted((current) => (current === id ? undefined : current));
    else setLocal(false);
  }
  return (
    <Pressable
      {...rest}
      ref={ref}
      disabled={disabled}
      accessibilityRole={checked === undefined ? 'menuitem' : 'radio'}
      accessibilityLabel={label}
      accessibilityHint={
        shortcut ? `${modifier ? 'Command ' : ''}${shortcut}` : undefined
      }
      accessibilityState={{
        ...rest.accessibilityState,
        disabled: !!disabled,
        checked,
      }}
      onFocus={(e) => {
        focused.current = true;
        highlight();
        onFocus?.(e);
      }}
      onBlur={(e) => {
        focused.current = false;
        if (!hovered.current) clear();
        onBlur?.(e);
      }}
      onHoverIn={(e) => {
        hovered.current = true;
        if (!disabled) {
          item.current?.focus();
          highlight();
        }
        onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        hovered.current = false;
        if (!focused.current) clear();
        onHoverOut?.(e);
      }}
      onPress={(e) => {
        onPress?.(e);
        if (!e?.defaultPrevented) menu?.close();
      }}
      style={({ pressed }) => [
        {
          width: 232,
          maxWidth: '100%',
          minHeight: Math.max(44, t.sizes['size/control-sm']),
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor:
            !disabled && (highlighted || pressed)
              ? t.colors[
                  tone === 'destructive'
                    ? 'color/bg/danger-subtle'
                    : 'color/bg/ghost-hover'
                ]
              : 'transparent',
        },
        style,
      ]}
    >
      {icon ?? <Glyph name="menu-pencil" color={foreground} />}
      <Text
        style={{
          flex: 1,
          minWidth: 0,
          color: foreground,
          fontSize: t.sizes['type/body/size'],
          lineHeight: t.sizes['type/body/line'],
          fontWeight: '400',
        }}
      >
        {label}
      </Text>
      {checked && <Glyph name="menu-check" color={foreground} />}
      {shortcut && (
        <Kbd keyName={shortcut} modifier={modifier} disabled={!!disabled} />
      )}
    </Pressable>
  );
}

export function MenuSeparator() {
  return (
    <View
      style={{
        height: 9,
        width: 240,
        maxWidth: '100%',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1, maxWidth: 224, marginStart: 8 }}>
        <Divider />
      </View>
    </View>
  );
}
