import React, { useRef, useState } from 'react';
import { Image, I18nManager, PanResponder, View } from 'react-native';
import { sliderValue } from '@highlanderrobotics/magnolia-tokens/v2';
import { Text, useMagnolia } from './v2.js';
import { nativeGlyphs } from './v2-glyphs.generated.js';
export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  formatValue = (value: number) => `${value}%`,
  onValueChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  onValueChange: (value: number) => void;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes,
    amount = sliderValue(value, min, max, step),
    percent = max > min ? (amount - min) / (max - min) : 0;
  const [width, setWidth] = useState(240),
    [pressed, setPressed] = useState(false),
    [focus, setFocus] = useState(false),
    [hover, setHover] = useState(false),
    latest = useRef({ width, disabled, min, max, step, onValueChange });
  latest.current = { width, disabled, min, max, step, onValueChange };
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled,
      onMoveShouldSetPanResponder: () => !latest.current.disabled,
      onPanResponderGrant: (event) => {
        setPressed(true);
        update(event.nativeEvent.locationX);
      },
      onPanResponderMove: (event) => update(event.nativeEvent.locationX),
      onPanResponderRelease: () => setPressed(false),
      onPanResponderTerminate: () => setPressed(false),
    }),
  ).current;
  function update(x: number) {
    const p = latest.current;
    if (p.disabled || p.width <= 0) return;
    p.onValueChange(
      sliderValue(
        p.min +
          Math.max(
            0,
            Math.min(1, I18nManager.isRTL ? 1 - x / p.width : x / p.width),
          ) *
            (p.max - p.min),
        p.min,
        p.max,
        p.step,
      ),
    );
  }
  const state = disabled
    ? 'disabled'
    : pressed
      ? 'pressed'
      : focus
        ? 'focus'
        : hover
          ? 'hover'
          : 'default';
  const art = nativeGlyphs[`slider-${state}-${t.mode}-${t.density}`];
  return (
    <View style={{ width: 240, maxWidth: '100%', gap: s['gap/slider'] }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Text
          style={{
            fontSize: s['type/label/sm/size'],
            lineHeight: s['type/label/sm/line'],
            fontWeight: '500',
            color: c[disabled ? 'color/fg/disabled' : 'color/fg/primary'],
          }}
        >
          {label}
        </Text>
        <Text
          accessibilityElementsHidden
          style={{
            fontSize: s['type/label/sm/size'],
            lineHeight: s['type/label/sm/line'],
            color: c[disabled ? 'color/fg/disabled' : 'color/fg/secondary'],
          }}
        >
          {formatValue(amount)}
        </Text>
      </View>
      <View
        {...responder.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        accessibilityValue={{
          min,
          max,
          now: amount,
          text: formatValue(amount),
        }}
        accessibilityActions={[
          { name: 'increment', label: 'Increase' },
          { name: 'decrement', label: 'Decrease' },
        ]}
        onAccessibilityAction={(event) => {
          if (disabled) return;
          const action = event.nativeEvent.actionName;
          if (action === 'increment' || action === 'decrement')
            onValueChange(
              sliderValue(
                amount + (action === 'increment' ? step : -step),
                min,
                max,
                step,
              ),
            );
        }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        style={{ width: '100%', height: 44, justifyContent: 'center' }}
      >
        <View
          pointerEvents="none"
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: c['color/bg/progress-track'],
          }}
        >
          <View
            style={{
              position: 'absolute',
              start: 0,
              top: 0,
              width: `${percent * 100}%`,
              height: 4,
              borderRadius: 2,
              backgroundColor:
                c[
                  disabled
                    ? 'color/bg/slider-disabled-accent'
                    : 'color/bg/accent-strong'
                ],
            }}
          />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left:
              (I18nManager.isRTL ? 1 - percent : percent) * width -
              art.geometry.logicalWidth / 2 +
              art.geometry.offsetX,
            top: (44 - art.geometry.logicalHeight) / 2 + art.geometry.offsetY,
            width: art.width,
            height: art.height,
          }}
        >
          <Image
            source={art.source}
            style={{ width: art.width, height: art.height }}
          />
        </View>
      </View>
    </View>
  );
}
