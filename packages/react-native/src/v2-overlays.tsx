import React from 'react';
import type { ReactNode } from 'react';
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import type {
  PressableProps,
  StyleProp,
  ViewStyle,
  TextInput,
} from 'react-native';
import { sheetSwipe, v2Tokens } from '@highlanderrobotics/magnolia-tokens/v2';
import { ButtonIdleSurface } from './v2-button-surface.js';
import {
  Text,
  Glyph,
  Kbd,
  Divider,
  useMagnolia,
  IconButton,
  Stat,
} from './v2.js';

type NativeFocusTarget = View | TextInput;

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
    { anchor, triggerRef, viewport, left, top, measure, onLayout } =
      useAnchoredPopup(open);
  function close() {
    setOpen(false);
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
    focus = useOverlayFocus();
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
  const wasOpen = React.useRef(open);
  React.useEffect(() => {
    if (wasOpen.current && !open) focus.restoreFocus();
    wasOpen.current = open;
  }, [open, focus.restoreFocus]);
  const onLayout = React.useCallback(
    (event: import('react-native').LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setSize((old) =>
        old.width === width && old.height === height ? old : { width, height },
      );
    },
    [],
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
    triggerRef: focus.triggerRef,
    measure,
    onLayout,
    focusElement: focus.focusElement,
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
      accessibilityRole={
        rest.accessibilityRole ?? (checked === undefined ? 'menuitem' : 'radio')
      }
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

function useOverlayFocus() {
  const triggerRef = React.useRef<View>(null);
  const focusFrame = React.useRef<number | undefined>(undefined);
  React.useEffect(
    () => () => {
      if (focusFrame.current !== undefined)
        cancelAnimationFrame(focusFrame.current);
    },
    [],
  );
  const focusElement = React.useCallback(
    (target: () => NativeFocusTarget | null | undefined) => {
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
  return { triggerRef, focusElement, restoreFocus };
}

export function Popover({
  title,
  body,
  open,
  onOpenChange,
  trigger,
  children,
  actions,
  initialFocusRef,
}: {
  title: string;
  body?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: (
    props: Pick<
      PressableProps,
      'onPress' | 'accessibilityState' | 'accessibilityHint'
    > & { ref: React.Ref<View> },
  ) => ReactNode;
  children?: ReactNode;
  actions?: (close: () => void) => ReactNode;
  initialFocusRef?: React.RefObject<NativeFocusTarget | null>;
}) {
  const t = useMagnolia(),
    [internal, setInternal] = React.useState(false),
    visible = open ?? internal,
    popup = useAnchoredPopup(visible),
    heading = React.useRef<View>(null);
  function change(next: boolean) {
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
    if (next) popup.measure();
  }
  function close() {
    change(false);
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
        accessibilityHint: `Opens ${title}`,
        onPress: () => change(!visible),
      })}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={close}
        onShow={() =>
          popup.focusElement(() => initialFocusRef?.current ?? heading.current)
        }
      >
        <View accessibilityViewIsModal style={{ flex: 1 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Dismiss ${title}`}
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
              width: 320,
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
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 16, gap: 12 }}
            >
              <View
                ref={heading}
                accessible
                accessibilityRole="header"
                accessibilityLabel={title}
              >
                <Text
                  style={{
                    fontSize: t.sizes['type/title/sm/size'],
                    lineHeight: t.sizes['type/title/sm/line'],
                    fontWeight: '500',
                  }}
                >
                  {title}
                </Text>
              </View>
              {body && (
                <Text
                  style={{
                    fontSize: t.sizes['type/body/sm/size'],
                    lineHeight: t.sizes['type/body/sm/line'],
                    color: t.colors['color/fg/secondary'],
                  }}
                >
                  {body}
                </Text>
              )}
              {children}
              {actions && (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                  }}
                >
                  {actions(close)}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function Dialog({
  title,
  body,
  open,
  onOpenChange,
  trigger,
  children,
  actions,
  canClose = true,
  onClose,
  initialFocusRef,
  returnFocusRef,
}: {
  title: string;
  body?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: (
    props: Pick<
      PressableProps,
      'onPress' | 'accessibilityState' | 'accessibilityHint'
    > & { ref: React.Ref<View> },
  ) => ReactNode;
  children?: ReactNode;
  actions?: (close: () => void) => ReactNode;
  canClose?: boolean;
  onClose?: () => void;
  initialFocusRef?: React.RefObject<NativeFocusTarget | null>;
  returnFocusRef?: React.RefObject<NativeFocusTarget | null>;
}) {
  const t = useMagnolia(),
    [internal, setInternal] = React.useState(false),
    visible = open ?? internal,
    focus = useOverlayFocus(),
    heading = React.useRef<View>(null),
    wasVisible = React.useRef(false);
  function change(next: boolean) {
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  }
  function close() {
    change(false);
  }
  function dismiss() {
    if (canClose) close();
  }
  React.useEffect(() => {
    if (wasVisible.current && !visible) {
      onClose?.();
      focus.focusElement(
        () => returnFocusRef?.current ?? focus.triggerRef.current,
      );
    }
    wasVisible.current = visible;
  }, [visible, onClose, returnFocusRef, focus.focusElement]);
  return (
    <>
      {trigger?.({
        ref: focus.triggerRef,
        accessibilityState: { expanded: visible },
        accessibilityHint: `Opens ${title}`,
        onPress: () => change(true),
      })}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={dismiss}
        onShow={() =>
          focus.focusElement(() => initialFocusRef?.current ?? heading.current)
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          accessibilityViewIsModal
          style={{
            flex: 1,
            padding: 16,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: t.colors['color/bg/scrim'],
          }}
        >
          <Pressable
            disabled={!canClose}
            accessibilityRole="button"
            accessibilityLabel={`Dismiss ${title}`}
            onPress={dismiss}
            style={{ position: 'absolute', inset: 0 }}
          />
          <View
            onAccessibilityEscape={dismiss}
            style={{
              width: 440,
              maxWidth: '100%',
              maxHeight: '100%',
              flexShrink: 1,
              borderWidth: 1,
              borderColor: t.colors['color/border/subtle'],
              borderRadius: 16,
              backgroundColor: t.colors['color/bg/overlay'],
              boxShadow: '0 1px 2px #0003, 0 8px 20px #0000004d',
              overflow: 'hidden',
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 24, gap: 12 }}
            >
              <View
                ref={heading}
                accessible
                accessibilityRole="header"
                accessibilityLabel={title}
              >
                <Text
                  style={{
                    fontSize: t.sizes['type/title/md/size'],
                    lineHeight: t.sizes['type/title/md/line'],
                    fontWeight: '500',
                  }}
                >
                  {title}
                </Text>
              </View>
              {body && (
                <Text
                  style={{
                    fontSize: t.sizes['type/body/size'],
                    lineHeight: t.sizes['type/body/line'],
                    color: t.colors['color/fg/secondary'],
                  }}
                >
                  {body}
                </Text>
              )}
              {children}
              {actions && (
                <View
                  style={{
                    paddingTop: 12,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                  }}
                >
                  <ButtonIdleSurface.Provider value={{ danger: '#a8302e' }}>
                    {actions(close)}
                  </ButtonIdleSurface.Provider>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

type PanelTrigger = (
  props: Pick<
    PressableProps,
    'onPress' | 'accessibilityState' | 'accessibilityHint'
  > & { ref: React.Ref<View> },
) => ReactNode;
function usePanelDisclosure(
  open: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
  onClose: (() => void) | undefined,
  returnFocusRef: React.RefObject<NativeFocusTarget | null> | undefined,
) {
  const [internal, setInternal] = React.useState(false),
    visible = open ?? internal,
    focus = useOverlayFocus(),
    previous = React.useRef(false);
  function change(next: boolean) {
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  }
  function close() {
    change(false);
  }
  React.useEffect(() => {
    if (previous.current && !visible) {
      onClose?.();
      focus.focusElement(
        () => returnFocusRef?.current ?? focus.triggerRef.current,
      );
    }
    previous.current = visible;
  }, [visible, onClose, returnFocusRef, focus.focusElement]);
  return { visible, change, close, focus };
}
const ignoreMenuRegistration = () => {};

export function Sheet({
  title,
  subtitle,
  open,
  onOpenChange,
  trigger,
  children,
  canClose = true,
  bottomInset = 34,
  onClose,
  returnFocusRef,
}: {
  title: string;
  subtitle?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: PanelTrigger;
  children?: ReactNode;
  canClose?: boolean;
  bottomInset?: number;
  onClose?: () => void;
  returnFocusRef?: React.RefObject<NativeFocusTarget | null>;
}) {
  const t = useMagnolia(),
    panel = usePanelDisclosure(open, onOpenChange, onClose, returnFocusRef),
    heading = React.useRef<View>(null),
    [drag, setDrag] = React.useState(0),
    [highlighted, setHighlighted] = React.useState<string>();
  function dismiss() {
    if (canClose) panel.close();
  }
  const release = React.useRef<(dx: number, dy: number) => void>(() => {});
  release.current = (dx, dy) => {
    setDrag(0);
    if (canClose && sheetSwipe(dx, dy)) panel.close();
  };
  const responder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          g.numberActiveTouches === 1 && g.dy > 6 && g.dy > Math.abs(g.dx),
        onPanResponderMove: (_, g) => setDrag(Math.max(0, g.dy)),
        onPanResponderRelease: (_, g) => release.current(g.dx, g.dy),
        onPanResponderTerminate: () => setDrag(0),
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );
  React.useEffect(() => {
    if (!panel.visible) setDrag(0);
  }, [panel.visible]);
  return (
    <>
      {trigger?.({
        ref: panel.focus.triggerRef,
        accessibilityState: { expanded: panel.visible },
        accessibilityHint: `Opens ${title}`,
        onPress: () => panel.change(true),
      })}
      <Modal
        visible={panel.visible}
        transparent
        animationType="none"
        onRequestClose={dismiss}
        onShow={() => panel.focus.focusElement(() => heading.current)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          accessibilityViewIsModal
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            backgroundColor: t.colors['color/bg/scrim'],
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Dismiss ${title} sheet`}
            disabled={!canClose}
            onPress={dismiss}
            style={{ position: 'absolute', inset: 0 }}
          />
          <View
            onAccessibilityEscape={dismiss}
            style={{
              width: 390,
              maxWidth: '100%',
              maxHeight: '100%',
              flexShrink: 1,
              paddingBottom: Number.isFinite(bottomInset)
                ? Math.max(0, bottomInset)
                : 34,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              backgroundColor: t.colors['color/bg/overlay'],
              boxShadow: '0 1px 2px #0003, 0 8px 20px #0000004d',
              overflow: 'hidden',
              transform: [{ translateY: drag }],
            }}
          >
            <View {...responder.panHandlers}>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  paddingTop: 8,
                  paddingBottom: 4,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 3,
                    backgroundColor: t.colors['color/border/default'],
                  }}
                />
              </View>
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <View
                    ref={heading}
                    accessible
                    accessibilityRole="header"
                    accessibilityLabel={title}
                  >
                    <Text
                      style={{
                        fontSize: t.sizes['type/title/sm/size'],
                        lineHeight: t.sizes['type/title/sm/line'],
                        fontWeight: '500',
                      }}
                    >
                      {title}
                    </Text>
                  </View>
                  {subtitle && (
                    <Text
                      style={{
                        fontSize: t.sizes['type/body/sm/size'],
                        lineHeight: t.sizes['type/body/sm/line'],
                        color: t.colors['color/fg/secondary'],
                      }}
                    >
                      {subtitle}
                    </Text>
                  )}
                </View>
                <Tooltip
                  label={`Close ${title}`}
                  trigger={(props) => (
                    <IconButton
                      {...props}
                      label={`Close ${title}`}
                      variant="tertiary"
                      onPress={panel.close}
                      icon={
                        <Glyph
                          name="sheet-close"
                          color={t.colors['color/fg/primary']}
                        />
                      }
                    />
                  )}
                />
              </View>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={{ flexGrow: 0, flexShrink: 1 }}
              contentContainerStyle={{ paddingHorizontal: 8 }}
            >
              <ActionMenuContext.Provider
                value={{
                  close: panel.close,
                  highlighted,
                  setHighlighted,
                  register: ignoreMenuRegistration,
                }}
              >
                {children}
              </ActionMenuContext.Provider>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

export function SheetAction({
  style,
  ...props
}: Omit<
  React.ComponentProps<typeof MenuItem>,
  'checked' | 'accessibilityRole' | 'role'
>) {
  const t = useMagnolia();
  return (
    <MenuItem
      {...props}
      accessibilityRole="button"
      style={[
        { width: '100%', minHeight: Math.max(44, t.sizes['size/row']) },
        style,
      ]}
    />
  );
}
export function SheetSeparator() {
  return (
    <View style={{ height: 9, paddingHorizontal: 8, justifyContent: 'center' }}>
      <Divider />
    </View>
  );
}

export function Drawer({
  title,
  subtitle,
  open,
  onOpenChange,
  trigger,
  children,
  actions,
  metrics = [],
  details = [],
  height = 640,
  canClose = true,
  onClose,
  onOpenFull,
  returnFocusRef,
}: {
  title: string;
  subtitle?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: PanelTrigger;
  children?: ReactNode;
  actions?: (close: () => void) => ReactNode;
  metrics?: readonly {
    label: string;
    value?: string | number | null;
    unit?: string;
  }[];
  details?: readonly { label: string; value?: string | number | null }[];
  height?: number;
  canClose?: boolean;
  onClose?: () => void;
  onOpenFull?: PressableProps['onPress'];
  returnFocusRef?: React.RefObject<NativeFocusTarget | null>;
}) {
  const t = useMagnolia(),
    viewport = useWindowDimensions(),
    panel = usePanelDisclosure(open, onOpenChange, onClose, returnFocusRef),
    heading = React.useRef<View>(null);
  function dismiss() {
    if (canClose) panel.close();
  }
  return (
    <>
      {trigger?.({
        ref: panel.focus.triggerRef,
        accessibilityState: { expanded: panel.visible },
        accessibilityHint: `Opens ${title}`,
        onPress: () => panel.change(true),
      })}
      <Modal
        visible={panel.visible}
        transparent
        animationType="none"
        onRequestClose={dismiss}
        onShow={() => panel.focus.focusElement(() => heading.current)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          accessibilityViewIsModal
          style={{
            flex: 1,
            alignItems: 'flex-end',
            backgroundColor: t.colors['color/bg/scrim'],
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Dismiss ${title} drawer`}
            disabled={!canClose}
            onPress={dismiss}
            style={{ position: 'absolute', inset: 0 }}
          />
          <View
            onAccessibilityEscape={dismiss}
            style={{
              height: Math.min(
                Number.isFinite(height) ? Math.max(1, height) : 640,
                viewport.height,
              ),
              maxHeight: '100%',
              width: v2Tokens.scale['size/drawer'],
              maxWidth: '100%',
              borderStartWidth: 1,
              borderStartColor: t.colors['color/border/subtle'],
              backgroundColor: t.colors['color/bg/overlay'],
              boxShadow: '0 1px 2px #0003, 0 8px 20px #0000004d',
            }}
          >
            <View
              style={{
                padding: 16,
                gap: 8,
                borderBottomWidth: 1,
                borderBottomColor: t.colors['color/border/subtle'],
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <View
                  ref={heading}
                  accessible
                  accessibilityRole="header"
                  accessibilityLabel={title}
                >
                  <Text
                    style={{
                      fontSize: t.sizes['type/title/sm/size'],
                      lineHeight: t.sizes['type/title/sm/line'],
                      fontWeight: '500',
                    }}
                  >
                    {title}
                  </Text>
                </View>
                {subtitle && (
                  <Text
                    style={{
                      fontSize: t.sizes['type/body/sm/size'],
                      lineHeight: t.sizes['type/body/sm/line'],
                      color: t.colors['color/fg/secondary'],
                    }}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>
              {onOpenFull && (
                <Tooltip
                  label={`Open ${title} in full page`}
                  trigger={(props) => (
                    <IconButton
                      {...props}
                      label={`Open ${title} in full page`}
                      variant="tertiary"
                      onPress={(e) => {
                        onOpenFull(e);
                        if (!e?.defaultPrevented) panel.close();
                      }}
                      icon={
                        <Glyph
                          name="drawer-open"
                          color={t.colors['color/fg/primary']}
                        />
                      }
                    />
                  )}
                />
              )}
              <Tooltip
                label={`Close ${title}`}
                trigger={(props) => (
                  <IconButton
                    {...props}
                    label={`Close ${title}`}
                    variant="tertiary"
                    onPress={panel.close}
                    icon={
                      <Glyph
                        name="drawer-close"
                        color={t.colors['color/fg/primary']}
                      />
                    }
                  />
                )}
              />
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, gap: 16 }}
            >
              {!!metrics.length && (
                <View
                  style={{
                    flexDirection: 'row',
                    paddingBottom: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: t.colors['color/border/subtle'],
                  }}
                >
                  {metrics.map((metric, i) => (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        paddingStart: i ? 12 : 0,
                        paddingEnd: 12,
                        borderStartWidth: i ? 1 : 0,
                        borderStartColor: t.colors['color/border/subtle'],
                      }}
                    >
                      <Stat {...metric} size="medium" />
                    </View>
                  ))}
                </View>
              )}
              {details.map((detail, i) => (
                <View
                  key={i}
                  accessible
                  accessibilityLabel={`${detail.label}: ${detail.value ?? 'No data'}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: t.sizes['type/body/sm/size'],
                      lineHeight: t.sizes['type/body/sm/line'],
                      color: t.colors['color/fg/secondary'],
                    }}
                  >
                    {detail.label}
                  </Text>
                  <Text
                    style={{
                      flexShrink: 1,
                      textAlign: 'right',
                      fontSize: t.sizes['type/body/sm/size'],
                      lineHeight: t.sizes['type/body/sm/line'],
                    }}
                  >
                    {detail.value ?? '—'}
                  </Text>
                </View>
              ))}
              {children}
            </ScrollView>
            {actions && (
              <View
                style={{
                  padding: 16,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  borderTopWidth: 1,
                  borderTopColor: t.colors['color/border/subtle'],
                }}
              >
                {actions(panel.close)}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
