import React from 'react';
import type { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  View,
  useWindowDimensions,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Text, Glyph, Kbd, useMagnolia } from './v2.js';

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
  const t = useMagnolia(),
    viewport = useWindowDimensions(),
    anchor = React.useRef<View>(null),
    triggerRef = React.useRef<View>(null);
  const [open, setOpen] = React.useState(false),
    [frame, setFrame] = React.useState({ x: 8, y: 8, width: 0, height: 44 }),
    [size, setSize] = React.useState({ width: 0, height: 0 });
  function close() {
    setOpen(false);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
      const node = findNodeHandle(triggerRef.current);
      if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
    });
  }
  const hint = [
    label,
    shortcut ? `${modifier ? 'Command ' : ''}${shortcut}` : undefined,
  ]
    .filter(Boolean)
    .join(', ');
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
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setSize((old) =>
                old.width === width && old.height === height
                  ? old
                  : { width, height },
              );
            }}
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
