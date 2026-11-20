import React from 'react';
import { AccessibilityInfo, AppState, Platform, View } from 'react-native';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import { Button, Glyph, Text, useMagnolia } from './v2.js';

export function Toast({
  open,
  message,
  tone = 'neutral',
  actionLabel,
  duration = 5000,
  onOpenChange,
  onAction,
  onDismiss,
  style,
}: {
  open: boolean;
  message: string;
  tone?: 'neutral' | 'success' | 'danger';
  actionLabel?: string;
  duration?: number;
  onOpenChange?: (open: boolean) => void;
  onAction?: (event: GestureResponderEvent) => void;
  onDismiss?: (reason: 'timeout' | 'action' | 'dismiss') => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useMagnolia();
  const paused = React.useRef(new Set<string>(['reader-check']));
  const sync = React.useRef(() => {});
  const latest = React.useRef({ onOpenChange, onDismiss });
  latest.current = { onOpenChange, onDismiss };
  function dismiss(reason: 'timeout' | 'action' | 'dismiss') {
    latest.current.onOpenChange?.(false);
    latest.current.onDismiss?.(reason);
  }
  function pause(reason: string, value: boolean) {
    if (value) paused.current.add(reason);
    else paused.current.delete(reason);
    sync.current();
  }
  React.useEffect(() => {
    let mounted = true;
    const reader = (enabled: boolean) => {
      if (!mounted) return;
      paused.current.delete('reader-check');
      pause('reader', enabled);
    };
    AccessibilityInfo.isScreenReaderEnabled().then(reader, () => reader(false));
    const screen = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      reader,
    );
    pause('background', AppState.currentState !== 'active');
    const state = AppState.addEventListener('change', (state) =>
      pause('background', state !== 'active'),
    );
    return () => {
      mounted = false;
      screen.remove();
      state.remove();
    };
  }, []);
  React.useEffect(() => {
    if (!open) {
      for (const reason of ['focus', 'hover', 'touch'])
        paused.current.delete(reason);
      return;
    }
    if (Platform.OS === 'ios')
      AccessibilityInfo.announceForAccessibility(message);
    let remaining = Number.isFinite(duration) ? Math.max(0, duration) : 5000;
    let timer: ReturnType<typeof setTimeout> | undefined,
      started = 0;
    const stop = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        remaining = Math.max(0, remaining - (Date.now() - started));
        timer = undefined;
      }
    };
    sync.current = () => {
      stop();
      if (tone === 'danger' || duration === 0 || paused.current.size) return;
      started = Date.now();
      timer = setTimeout(() => dismiss('timeout'), remaining);
    };
    sync.current();
    return () => {
      stop();
      sync.current = () => {};
    };
  }, [open, message, tone, duration]);
  if (!open) return null;
  return (
    <View
      onPointerEnter={() => pause('hover', true)}
      onPointerLeave={() => pause('hover', false)}
      onTouchStart={() => pause('touch', true)}
      onTouchEnd={() => pause('touch', false)}
      onTouchCancel={() => pause('touch', false)}
      onAccessibilityEscape={() => dismiss('dismiss')}
      style={[
        {
          width: 360,
          maxWidth: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: t.colors['color/border/subtle'],
          borderRadius: 12,
          backgroundColor: t.colors['color/bg/overlay'],
          boxShadow: '0px 1px 2px #0003, 0px 8px 20px #0000004d',
        },
        style,
      ]}
    >
      <Glyph
        name={tone === 'neutral' ? 'toast-info' : `toast-${tone}`}
        color={
          t.colors[
            tone === 'neutral'
              ? 'color/fg/secondary'
              : tone === 'success'
                ? 'color/fg/success'
                : 'color/fg/danger'
          ]
        }
      />
      <Text
        accessibilityRole={tone === 'danger' ? 'alert' : undefined}
        accessibilityLiveRegion={tone === 'danger' ? 'assertive' : 'polite'}
        style={{ flex: 1 }}
      >
        {message}
      </Text>
      {(actionLabel || tone === 'danger') && (
        <Button
          variant="tertiary"
          onFocus={() => pause('focus', true)}
          onBlur={() => pause('focus', false)}
          onPress={(e) => {
            if (actionLabel) onAction?.(e);
            if (!e?.defaultPrevented)
              dismiss(actionLabel ? 'action' : 'dismiss');
          }}
        >
          {actionLabel ?? 'Dismiss'}
        </Button>
      )}
    </View>
  );
}
