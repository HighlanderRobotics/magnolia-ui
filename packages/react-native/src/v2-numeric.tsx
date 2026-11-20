import React, { useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Text, Glyph, IconButton, useMagnolia } from './v2.js';

export function NumberField({
  label,
  unit,
  helper,
  error,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps & {
  ref?: React.Ref<TextInput>;
  label: string;
  unit?: string;
  helper?: string;
  error?: string;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 4, opacity: rest.editable === false ? 0.4 : 1 }}>
      <Text
        style={{
          fontSize: s['type/label/sm/size'],
          lineHeight: s['type/label/sm/line'],
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingHorizontal: 12,
          minHeight: Math.max(44, s['size/control']),
          borderWidth: 1,
          borderColor:
            c[
              error
                ? 'color/border/danger'
                : focus
                  ? 'color/border/accent'
                  : 'color/border/default'
            ],
          borderRadius: s['radius/control'],
          backgroundColor: c['color/bg/field'],
          outlineWidth: focus ? 2 : 0,
          outlineOffset: 2,
          outlineColor: c['color/border/focus'],
        }}
      >
        <TextInput
          {...rest}
          keyboardType="decimal-pad"
          accessibilityLabel={rest.accessibilityLabel ?? label}
          accessibilityHint={[rest.accessibilityHint, unit, error || helper]
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
              flex: 1,
              minWidth: 0,
              textAlign: 'right',
              fontFamily: t.fontFamily,
              fontSize: s['type/body/size'],
              lineHeight: s['type/body/line'],
              color: c['color/fg/primary'],
              fontVariant: ['tabular-nums'],
              paddingVertical: 8,
            },
            style,
          ]}
        />
        {unit && <Text style={{ color: c['color/fg/secondary'] }}>{unit}</Text>}
      </View>
      {!!(error || helper) && (
        <Text
          accessibilityLiveRegion={error ? 'polite' : 'none'}
          style={{
            fontSize: s['type/field-help/size'],
            lineHeight: s['type/field-help/line'],
            color: c[error ? 'color/fg/danger' : 'color/fg/secondary'],
          }}
        >
          {error ? `Error: ${error}` : helper}
        </Text>
      )}
    </View>
  );
}

export function Stepper({
  label,
  value,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  disabled = false,
  onValueChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onValueChange: (value: number) => void;
}) {
  const t = useMagnolia(),
    s = t.sizes;
  const amount = Math.max(
    min,
    Math.min(max, Number.isFinite(value) ? Math.round(value) : min),
  );
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: s['gap/group'],
      }}
    >
      <IconButton
        label={`Decrease ${label}`}
        variant="secondary"
        disabled={disabled || amount <= min}
        icon={<Glyph name="step-minus" />}
        onPress={() => onValueChange(Math.max(min, amount - 1))}
      />
      <Text
        accessibilityLabel={`${label}: ${amount}`}
        accessibilityLiveRegion="polite"
        style={{
          minWidth: 34,
          textAlign: 'center',
          fontWeight: '500',
          fontVariant: ['tabular-nums'],
          fontSize: s['type/step-value/size'],
          lineHeight: s['type/step-value/line'],
          opacity: disabled ? 0.4 : 1,
        }}
      >
        {amount}
      </Text>
      <IconButton
        label={`Increase ${label}`}
        variant="secondary"
        disabled={disabled || amount >= max}
        icon={<Glyph name="step-plus" />}
        onPress={() => onValueChange(Math.min(max, amount + 1))}
      />
    </View>
  );
}

export function Link({
  label,
  href,
  variant = 'inline',
  external = false,
  disabled = false,
  onPress,
}: {
  label: string;
  href: string;
  variant?: 'inline' | 'quiet';
  external?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const t = useMagnolia(),
    c = t.colors;
  const [focus, setFocus] = useState(false),
    [hover, setHover] = useState(false);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityHint={external ? 'Opens in browser' : undefined}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPress={
        onPress ??
        (() => {
          void Linking.openURL(href);
        })
      }
      style={{
        minHeight: 44,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        outlineWidth: focus ? 2 : 0,
        outlineOffset: 2,
        outlineColor: c['color/border/focus'],
        borderRadius: 4,
      }}
    >
      {({ pressed }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2.25 }}>
          <Text
            style={{
              color:
                c[
                  disabled
                    ? 'color/fg/disabled'
                    : variant === 'quiet'
                      ? pressed
                        ? 'color/fg/link-quiet-pressed'
                        : 'color/fg/primary'
                      : pressed || hover
                        ? 'color/fg/link-hover'
                        : 'color/fg/accent'
                ],
              textDecorationLine:
                !disabled && (variant === 'inline' || hover || focus || pressed)
                  ? 'underline'
                  : 'none',
            }}
          >
            {label}
          </Text>
          {external && variant === 'inline' && (
            <Glyph
              name="external"
              color={
                c[variant === 'inline' ? 'color/fg/accent' : 'color/fg/primary']
              }
            />
          )}
        </View>
      )}
    </Pressable>
  );
}

export function SelectableCard({
  title,
  value,
  selected,
  description,
  meta,
  disabled = false,
  onValueChange,
}: {
  title: string;
  value: string;
  selected: boolean;
  description?: string;
  meta?: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const [focus, setFocus] = useState(false),
    [hover, setHover] = useState(false);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityHint={[description, meta].filter(Boolean).join('. ')}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        width: 288,
        maxWidth: '100%',
        minHeight: 44,
        borderWidth: 1,
        borderRadius: s['radius/control-ring'],
        borderColor:
          c[
            selected
              ? 'color/border/accent'
              : hover
                ? 'color/border/choice-card-hover'
                : 'color/border/subtle'
          ],
        backgroundColor: c['color/bg/raised'],
        opacity: disabled ? 0.5 : 1,
        outlineWidth: focus ? 2 : 0,
        outlineOffset: 4,
        outlineColor: c['color/border/focus'],
        overflow: 'visible',
      }}
    >
      {({ pressed }) => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: s['gap/group'],
            paddingVertical: s['pad/choice-card-y'],
            paddingHorizontal: s['pad/choice-card-x'],
            borderRadius: s['radius/control-ring'],
            backgroundColor: selected
              ? c['color/tint/accent-10']
              : pressed
                ? c['color/bg/list-pressed']
                : hover
                  ? c['color/bg/list-hover']
                  : 'transparent',
          }}
        >
          {selected && (pressed || hover) && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: s['radius/control-ring'],
                backgroundColor:
                  c[pressed ? 'color/tint/accent-18' : 'color/tint/accent-10'],
              }}
            />
          )}
          <View style={{ width: 20, height: 22 }}>
            <Glyph
              name={selected ? 'card-selected' : 'card-unselected'}
              color={
                c[selected ? 'color/bg/accent-strong' : 'color/fg/tertiary']
              }
            />
            {selected && (
              <Glyph
                name="card-dot"
                color={c['color/fg/on-accent']}
                style={{ position: 'absolute', left: 7, top: 8 }}
              />
            )}
          </View>
          <View
            style={{ flex: 1, minWidth: 0, gap: s['gap/choice-card-text'] }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                gap: s['gap/group'],
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontWeight: '500',
                  fontSize: s['type/choice-title/size'],
                  lineHeight: s['type/choice-title/line'],
                }}
              >
                {title}
              </Text>
              {meta && (
                <Text
                  style={{
                    fontSize: s['type/choice-desc/size'],
                    lineHeight: s['type/choice-desc/line'],
                    color: c['color/fg/secondary'],
                  }}
                >
                  {meta}
                </Text>
              )}
            </View>
            {description && (
              <Text
                style={{
                  fontSize: s['type/choice-desc/size'],
                  lineHeight: s['type/choice-desc/line'],
                  color: c['color/fg/secondary'],
                }}
              >
                {description}
              </Text>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}
