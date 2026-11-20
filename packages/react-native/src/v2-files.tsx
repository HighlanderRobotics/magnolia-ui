import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { progressValue } from '@highlanderrobotics/magnolia-tokens/v2';
import { Button, Glyph, Text, useMagnolia } from './v2.js';

export function Steps({
  items,
  current = 0,
  label = 'Progress',
}: {
  items: string[];
  current?: number;
  label?: string;
}) {
  const t = useMagnolia(),
    s = t.sizes,
    c = t.colors,
    active = Math.max(
      0,
      Math.min(
        items.length - 1,
        Number.isFinite(current) ? Math.floor(current) : 0,
      ),
    );
  return (
    <ScrollView
      horizontal
      accessibilityLabel={label}
      contentContainerStyle={{ alignItems: 'center' }}
    >
      {items.map((item, i) => (
        <View
          key={`${i}-${item}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <View
            accessible
            accessibilityLabel={`${item}: ${i < active ? 'completed' : i === active ? 'current' : 'not started'}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <View
              style={{
                width: s['size/step-dot'],
                height: s['size/step-dot'],
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  c[
                    i < active
                      ? 'color/bg/step-done-dot'
                      : i === active
                        ? 'color/bg/accent-strong'
                        : 'color/bg/step-track'
                  ],
              }}
            >
              {i < active ? (
                <Glyph name="steps-check" color={c['color/fg/accent']} />
              ) : (
                <Text
                  style={{
                    fontSize: s['type/step/size'],
                    lineHeight: s['type/step/line'],
                    fontWeight: '500',
                    color:
                      c[
                        i === active
                          ? 'color/fg/on-accent'
                          : 'color/fg/tertiary'
                      ],
                  }}
                >
                  {i + 1}
                </Text>
              )}
            </View>
            <Text
              style={{
                fontSize: s['type/step-label/size'],
                lineHeight: s['type/step-label/line'],
                fontWeight: i === active ? '500' : '400',
                color:
                  c[
                    i === active
                      ? 'color/fg/primary'
                      : i < active
                        ? 'color/fg/secondary'
                        : 'color/fg/tertiary'
                  ],
              }}
            >
              {item}
            </Text>
          </View>
          {i < items.length - 1 && (
            <View
              style={{
                height: 2,
                width: s['size/step-line'],
                marginStart: s['gap/step-connector'] - 8,
                marginEnd: s['gap/step-circle'],
                borderRadius: 1,
                backgroundColor:
                  c[i < active ? 'color/bg/step-done' : 'color/bg/step-track'],
              }}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
}

export function FileField({
  label,
  caption = 'Choose photos',
  helper = 'JPG or PNG, up to 10 MB each',
  error,
  disabled = false,
  onBrowse,
}: {
  label: string;
  caption?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  onBrowse: () => void;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const [focus, setFocus] = useState(false),
    [hover, setHover] = useState(false);
  return (
    <View style={{ gap: 4, opacity: disabled ? 0.4 : 1 }}>
      <Text
        style={{
          fontSize: s['type/label/sm/size'],
          lineHeight: s['type/label/sm/line'],
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={[helper, error].filter(Boolean).join('. ')}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onBrowse}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{
          minHeight: 44,
          padding: s['pad/zone'],
          gap: s['gap/zone-icon'],
          alignItems: 'center',
          borderRadius: 12,
          borderWidth: 1,
          borderStyle: focus ? 'solid' : 'dashed',
          borderColor:
            c[
              error
                ? 'color/border/danger'
                : focus
                  ? 'color/border/accent'
                  : hover
                    ? 'color/border/field-hover'
                    : 'color/border/default'
            ],
          outlineWidth: focus ? 1 : 0,
          outlineColor:
            c[error ? 'color/border/danger' : 'color/border/accent'],
          backgroundColor: c['color/bg/field'],
        }}
      >
        <Glyph name="upload" color={c['color/fg/secondary']} />
        <Text
          style={{
            fontSize: s['type/zone-title/size'],
            lineHeight: s['type/zone-title/line'],
            color: c['color/fg/accent'],
            textDecorationLine: 'underline',
          }}
        >
          {caption}
        </Text>
        <Text
          style={{
            fontSize: s['type/helper/size'],
            lineHeight: s['type/helper/line'],
            color: c['color/fg/secondary'],
            textAlign: 'center',
          }}
        >
          {helper}
        </Text>
      </Pressable>
      {error && (
        <Text
          accessibilityRole="alert"
          style={{
            fontSize: s['type/field-help/size'],
            lineHeight: s['type/field-help/line'],
            color: c['color/fg/danger'],
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

export function Attachment({
  name,
  detail,
  state = 'done',
  progress,
  src,
  error = 'Upload failed',
  onRemove,
  onRetry,
}: {
  name: string;
  detail?: string;
  state?: 'uploading' | 'done' | 'failed' | 'image';
  progress?: number;
  src?: string;
  error?: string;
  onRemove: () => void;
  onRetry?: () => void;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes,
    amount = progressValue(progress);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: s['gap/group'],
        minHeight: s['size/attachment-row'],
        padding: s['pad/attachment'],
        borderWidth: 1,
        borderColor:
          c[
            state === 'failed' ? 'color/border/danger' : 'color/border/default'
          ],
        borderRadius: s['radius/control'],
        backgroundColor: c['color/bg/field'],
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: s['radius/control-inner'],
          backgroundColor: c['color/bg/track'],
          overflow: 'hidden',
        }}
      >
        {src ? (
          <Image source={{ uri: src }} style={{ width: 40, height: 40 }} />
        ) : (
          <Glyph
            name={state === 'image' ? 'attachment-image' : 'attachment-file'}
            color={c['color/fg/secondary']}
          />
        )}
      </View>
      <View
        style={{ flex: 1, minWidth: 0, gap: state === 'uploading' ? 6 : 0 }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: s['gap/group'],
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              minWidth: 0,
              fontWeight: '500',
              fontSize: s['type/label/sm/size'],
              lineHeight: s['type/label/sm/line'],
            }}
          >
            {name}
          </Text>
          {detail && state !== 'failed' && (
            <Text
              style={{
                fontSize: s['type/helper/size'],
                lineHeight: s['type/helper/line'],
                color: c['color/fg/secondary'],
              }}
            >
              {detail}
            </Text>
          )}
        </View>
        {state === 'uploading' && (
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Uploading ${name}`}
            accessibilityState={{ busy: amount === undefined }}
            accessibilityValue={
              amount === undefined
                ? { text: 'In progress' }
                : { min: 0, max: 100, now: amount }
            }
            style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: c['color/bg/progress-track'],
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 4,
                width: `${amount ?? 30}%`,
                marginStart: amount === undefined ? '35%' : 0,
                borderRadius: 2,
                backgroundColor: c['color/bg/accent-strong'],
              }}
            />
          </View>
        )}
        {state === 'failed' && (
          <Text
            accessibilityRole="alert"
            style={{
              fontSize: s['type/helper/size'],
              lineHeight: s['type/helper/line'],
              color: c['color/fg/danger'],
            }}
          >
            {error}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {state === 'failed' && onRetry && (
          <Button
            variant="tertiary"
            size="medium"
            icon={<Glyph name="attachment-retry" />}
            onPress={onRetry}
          >
            Retry
          </Button>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${name}`}
          onPress={onRemove}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Glyph name="attachment-remove" color={c['color/fg/secondary']} />
        </Pressable>
      </View>
    </View>
  );
}
