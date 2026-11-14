import React, { useEffect, useRef, useState } from 'react';
import type { ReactNode, PropsWithChildren } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Pressable,
  View,
} from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import {
  contextHue,
  initials,
  progressValue,
  v2Tokens,
} from '@highlanderrobotics/magnolia-tokens/v2';
import type { Tone, ContextHue } from '@highlanderrobotics/magnolia-tokens/v2';
import { useMagnolia, Text, Glyph, Button } from './v2.js';
import { nativeGlyphs } from './v2-glyphs.generated.js';

function toneColors(
  colors: ReturnType<typeof useMagnolia>['colors'],
  tone: Tone,
) {
  if (tone === 'neutral')
    return {
      fg: colors['color/fg/badge-neutral'],
      bg: colors['color/bg/track'],
      subtle: colors['color/bg/base'],
      border: colors['color/border/subtle'],
      mark: colors['color/fg/tertiary'],
    };
  if (tone === 'accent')
    return {
      fg: colors['color/fg/accent'],
      bg: colors['color/tint/accent'],
      subtle: colors['color/bg/accent-subtle'],
      border: colors['color/border/accent'],
      mark: colors['color/bg/accent-strong'],
    };
  return {
    fg: colors[`color/fg/${tone}`],
    bg: colors[`color/tint/${tone}`],
    subtle: colors[`color/bg/${tone}-subtle`],
    border: colors[`color/border/banner-${tone}`],
    mark: colors[`color/mark/${tone}`],
  };
}
export function Badge({
  label,
  tone = 'neutral',
  icon = false,
  quiet = false,
}: {
  label: string;
  tone?: Tone;
  icon?: boolean;
  quiet?: boolean;
}) {
  const t = useMagnolia(),
    s = t.sizes,
    c = toneColors(t.colors, tone);
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        minHeight: quiet ? 18 : s['size/badge'],
        paddingHorizontal: quiet ? 6 : s['pad/badge-x'],
        borderWidth: quiet ? 0 : 1,
        borderColor: t.colors['color/border/edge'],
        borderRadius: 4,
        backgroundColor: c.bg,
      }}
    >
      {icon && (
        <View style={{ width: 9.75, height: 12 }}>
          <Glyph
            name="badge-check"
            color={c.fg}
            style={{ position: 'absolute', start: -1.125 }}
          />
        </View>
      )}
      <Text
        style={{
          fontSize: quiet ? 11 : s['type/caption/size'],
          lineHeight: quiet ? 12 : s['type/caption/line'],
          fontWeight: quiet ? '400' : '500',
          color: c.fg,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
export function StatusIndicator({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: Tone;
}) {
  const t = useMagnolia(),
    c = toneColors(t.colors, tone);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.sizes['gap/status'],
      }}
    >
      <Glyph name="status-dot" color={c.mark} />
      <Text
        style={{
          fontSize: t.sizes['type/status/size'],
          lineHeight: t.sizes['type/status/line'],
          color: t.colors['color/fg/secondary'],
        }}
      >
        {label}
      </Text>
    </View>
  );
}
export function Trend({
  value,
  sentiment = 'neutral',
  sentimentWord = true,
  unit = '%',
}: {
  value: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentWord?: boolean;
  unit?: string;
}) {
  const t = useMagnolia(),
    valid = Number.isFinite(value),
    direction = !valid || value === 0 ? 'flat' : value > 0 ? 'up' : 'down';
  const word =
    direction === 'flat'
      ? ''
      : sentiment === 'positive'
        ? 'better'
        : sentiment === 'negative'
          ? 'worse'
          : '';
  const color =
    t.colors[
      direction === 'flat' || sentiment === 'neutral'
        ? 'color/fg/secondary'
        : sentiment === 'positive'
          ? 'color/fg/success'
          : 'color/fg/danger'
    ];
  const text = valid
    ? `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}${unit}`
    : 'No data';
  return (
    <View
      accessible
      accessibilityLabel={[text, word].filter(Boolean).join(' ')}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
    >
      <View
        style={{
          width: 16,
          height: 16,
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: direction === 'flat' ? 0 : 1.56,
        }}
      >
        <Glyph name={`trend-${direction}`} color={color} />
      </View>
      <Text
        style={{
          fontSize: t.sizes['type/label/sm/size'],
          lineHeight: t.sizes['type/label/sm/line'],
          fontWeight: '500',
          color,
        }}
      >
        {text}
        {sentimentWord && word ? ' ' + word : ''}
      </Text>
    </View>
  );
}
export type AvatarProps = {
  name: string;
  src?: string;
  size?: 24 | 28 | 32 | 40;
  content?: 'initials' | 'icon' | 'more';
  more?: number;
  textStyle?: StyleProp<TextStyle>;
};
export function Avatar({
  name,
  src,
  size = 32,
  content = 'initials',
  more = 0,
  textStyle,
}: AvatarProps) {
  const t = useMagnolia(),
    [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={content === 'more' ? `${more} more people` : name}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: t.colors['color/border/edge'],
        backgroundColor: t.colors['color/bg/avatar'],
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {src && !failed ? (
        <Image
          source={{ uri: src }}
          onError={() => setFailed(true)}
          resizeMode="cover"
          style={{ width: size, height: size }}
        />
      ) : content === 'icon' ? (
        <Glyph name={`avatar-user-${size}`} />
      ) : (
        <Text
          style={[
            {
              fontSize:
                size === 40 ? 15 : size === 32 ? 12 : size === 28 ? 11 : 10,
              lineHeight: size === 40 ? 18 : 14,
              fontWeight: '500',
              color:
                t.colors[
                  content === 'more' ? 'color/fg/secondary' : 'color/fg/primary'
                ],
            },
            textStyle,
          ]}
        >
          {content === 'more' ? `+${more}` : initials(name)}
        </Text>
      )}
    </View>
  );
}
export function AvatarGroup({
  people,
  max = 3,
  label = 'People',
}: {
  people: { name: string; src?: string }[];
  max?: number;
  label?: string;
}) {
  const t = useMagnolia(),
    visible = people.slice(0, Math.max(0, Math.floor(max)));
  return (
    <View
      accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'center' }}
    >
      {visible.map((person, i) => (
        <View
          key={`${person.name}-${i}`}
          style={{
            marginEnd: -6,
            zIndex: visible.length + 1 - i,
            borderRadius: 18,
            outlineWidth: 1.5,
            outlineColor: t.colors['color/bg/base'],
          }}
        >
          <Avatar
            {...person}
            textStyle={{
              fontSize: t.sizes['type/label/sm/size'],
              lineHeight: t.sizes['type/label/sm/line'],
            }}
          />
        </View>
      ))}
      {people.length > visible.length && (
        <View
          style={{
            outlineWidth: 1.5,
            borderRadius: 18,
            outlineColor: t.colors['color/bg/base'],
          }}
        >
          <Avatar
            name=""
            content="more"
            more={people.length - visible.length}
          />
        </View>
      )}
    </View>
  );
}
function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let live = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (live) setReduced(value);
    });
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduced,
    );
    return () => {
      live = false;
      listener.remove();
    };
  }, []);
  return reduced;
}
export function Spinner({
  size = 'small',
  label = 'Loading',
}: {
  size?: 'small' | 'medium' | 'large';
  label?: string;
}) {
  const t = useMagnolia(),
    reduced = useReducedMotion(),
    rotation = useRef(new Animated.Value(0)).current;
  const asset = nativeGlyphs[`spinner-${size}`];
  useEffect(() => {
    if (reduced) {
      rotation.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation, reduced]);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
    >
      <Animated.Image
        source={asset.source}
        style={{
          width: asset.width,
          height: asset.height,
          tintColor: t.colors['color/fg/secondary'],
          transform: [
            {
              rotate: rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }}
      />
    </View>
  );
}
export function Skeleton({
  shape = 'line',
  width,
  height,
}: {
  shape?: 'line' | 'block' | 'circle';
  width?: number;
  height?: number;
}) {
  const t = useMagnolia(),
    circle = shape === 'circle';
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: width ?? (circle ? t.sizes['size/skeleton-avatar'] : 160),
        height:
          height ??
          (circle
            ? t.sizes['size/skeleton-avatar']
            : shape === 'block'
              ? 64
              : t.sizes['size/skeleton-line']),
        borderRadius: circle ? 999 : 4,
        backgroundColor: t.colors['color/bg/skeleton'],
      }}
    />
  );
}
export function ProgressBar({
  value,
  label,
  tone = 'neutral',
}: {
  value?: number;
  label: string;
  tone?: 'neutral' | 'accent';
}) {
  const t = useMagnolia(),
    amount = progressValue(value);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={
        amount === undefined
          ? { text: 'In progress' }
          : { min: 0, max: 100, now: amount }
      }
      accessibilityState={{ busy: amount === undefined }}
      style={{
        width: 160,
        maxWidth: '100%',
        height: 4,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: t.colors['color/bg/progress-track'],
      }}
    >
      <View
        style={{
          width: `${amount ?? 30}%`,
          marginStart: amount === undefined ? '35%' : 0,
          height: 4,
          borderRadius: 999,
          backgroundColor:
            t.colors[
              tone === 'accent' ? 'color/bg/accent-strong' : 'color/fg/tertiary'
            ],
        }}
      />
    </View>
  );
}
export function ProgressRing({
  value,
  label,
  size = 'small',
  tone = 'neutral',
}: {
  value?: number;
  label: string;
  size?: 'small' | 'large';
  tone?: 'neutral' | 'accent';
}) {
  const t = useMagnolia(),
    amount = progressValue(value),
    width = size === 'large' ? 96 : 24,
    stroke = size === 'large' ? 8 : 3,
    r = (width - stroke) / 2,
    half = width / 2;
  // The original opaque full-ring silhouette lets the semantic track token own
  // alpha exactly once in dark mode and remain opaque in light mode.
  const asset =
    nativeGlyphs[size === 'large' ? 'ring-fill-large' : 'ring-fill-small'];
  const track = t.colors['color/bg/progress-track'];
  const fill =
      t.colors[
        tone === 'accent' ? 'color/bg/accent-strong' : 'color/fg/tertiary'
      ],
    angle = (amount ?? 25) * 3.6;
  const image = (color: string, isFill = false) => (
    <Image
      source={
        isFill
          ? nativeGlyphs[
              size === 'large' ? 'ring-fill-large' : 'ring-fill-small'
            ].source
          : asset.source
      }
      resizeMode="stretch"
      style={{ width, height: width, tintColor: color }}
    />
  );
  const slice = (left: boolean, rotation: number) => (
    <View
      style={{
        position: 'absolute',
        left: left ? 0 : half,
        width: half,
        height: width,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: left ? 0 : -half,
          width,
          height: width,
          transform: [{ rotate: `${rotation}deg` }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: half,
            width: half,
            height: width,
            overflow: 'hidden',
          }}
        >
          <View style={{ position: 'absolute', left: -half }}>
            {image(fill, true)}
          </View>
        </View>
      </View>
    </View>
  );
  // Fill derivatives are dynamic data geometry, using the original ring silhouette.
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={
        amount === undefined
          ? { text: 'In progress' }
          : { min: 0, max: 100, now: amount }
      }
      accessibilityState={{ busy: amount === undefined }}
      style={{ width, height: width }}
    >
      {image(track)}
      {angle > 0 && slice(false, Math.min(angle, 180) - 180)}
      {angle > 180 && slice(true, angle - 180)}
      {angle > 0 && angle < 360 && (
        <>
          <View
            style={{
              position: 'absolute',
              left: half - stroke / 2,
              top: half - r - stroke / 2,
              width: stroke,
              height: stroke,
              borderRadius: stroke / 2,
              backgroundColor: fill,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: half + Math.sin((angle * Math.PI) / 180) * r - stroke / 2,
              top: half - Math.cos((angle * Math.PI) / 180) * r - stroke / 2,
              width: stroke,
              height: stroke,
              borderRadius: stroke / 2,
              backgroundColor: fill,
            }}
          />
        </>
      )}
      {size === 'large' && (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: t.sizes['type/metric/md/size'],
              lineHeight: t.sizes['type/metric/md/line'],
              fontWeight: '500',
            }}
          >
            {amount === undefined ? '—' : `${Math.round(amount)}%`}
          </Text>
        </View>
      )}
    </View>
  );
}
export function Divider() {
  const t = useMagnolia();
  return (
    <View
      accessible={false}
      importantForAccessibility="no"
      style={{
        height: 1,
        width: '100%',
        backgroundColor: t.colors['color/border/subtle'],
      }}
    />
  );
}
export function CardHeader({
  title,
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  const t = useMagnolia(),
    s = t.sizes;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
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
              color: t.colors['color/fg/secondary'],
            }}
          >
            {description}
          </Text>
        )}
      </View>
      {action}
    </View>
  );
}
export function EmptyState({
  title = 'Nothing here yet',
  body = 'Items you create or are assigned to will show up here.',
  icon,
  action,
}: {
  title?: string;
  body?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  return (
    <View style={{ alignItems: 'center', gap: s['gap/empty-body'] }}>
      <View
        style={{
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 24,
          backgroundColor: c['color/bg/empty-disc'],
          marginBottom: 6,
        }}
      >
        {icon ?? <Glyph name="inbox" color={c['color/fg/secondary']} />}
      </View>
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
      <Text
        style={{
          maxWidth: 320,
          fontSize: s['type/empty-body/size'],
          lineHeight: s['type/empty-body/line'],
          color: c['color/fg/secondary'],
          textAlign: 'center',
          marginBottom: 10,
        }}
      >
        {body}
      </Text>
      {action}
    </View>
  );
}
export function Banner({
  title,
  body,
  tone = 'neutral',
  action,
  dismissible = false,
  onDismiss,
}: {
  title: string;
  body?: string;
  tone?: Exclude<Tone, 'accent'>;
  action?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}) {
  const t = useMagnolia(),
    s = t.sizes,
    c = toneColors(t.colors, tone),
    [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <View
      accessibilityLiveRegion={tone === 'danger' ? 'assertive' : 'none'}
      style={{
        flexDirection: 'row',
        gap: 12,
        paddingVertical: s['pad/banner-y'],
        paddingStart: s['pad/banner-x'],
        paddingEnd: dismissible ? 51 : s['pad/banner-x'],
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 12,
        backgroundColor: c.subtle,
      }}
    >
      <Glyph
        name={
          tone === 'neutral' || tone === 'info'
            ? 'banner-info'
            : `banner-${tone}`
        }
        color={c.fg}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontWeight: '500',
            fontSize: s['type/banner-title/size'],
            lineHeight: s['type/banner-title/line'],
          }}
        >
          {title}
        </Text>
        {body && (
          <Text
            style={{
              color: t.colors['color/fg/secondary'],
              fontSize: s['type/banner-body/size'],
              lineHeight: s['type/banner-body/line'],
            }}
          >
            {body}
          </Text>
        )}
        {action && (
          <View style={{ paddingTop: s['gap/banner-action'] }}>{action}</View>
        )}
      </View>
      {dismissible && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Dismiss ${title}`}
          hitSlop={8}
          onPress={() => {
            setVisible(false);
            onDismiss?.();
          }}
          style={{
            position: 'absolute',
            top: 10,
            end: 10,
            width: 28,
            height: 28,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Glyph name="close" color={t.colors['color/fg/secondary']} />
        </Pressable>
      )}
    </View>
  );
}
export function ListItem({
  title,
  description,
  meta,
  leading,
  chevron = true,
  unread = false,
  selected = false,
  disabled = false,
  onPress,
}: {
  title: string;
  description?: string;
  meta?: string;
  leading?: ReactNode;
  chevron?: boolean;
  unread?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${unread ? 'Unread: ' : ''}${title}`}
      accessibilityHint={description}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: Math.max(44, s['size/row']),
        paddingVertical: s['gap/inline'],
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: s['radius/control'],
        backgroundColor: pressed
          ? c['color/bg/list-pressed']
          : selected
            ? c['color/bg/list-selected']
            : 'transparent',
        opacity: disabled ? 0.5 : 1,
      })}
    >
      {leading && (
        <View
          style={{ width: 32, alignItems: 'center', justifyContent: 'center' }}
        >
          {leading}
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0, paddingStart: unread ? 4 : 0 }}>
        <View style={{ position: 'relative' }}>
          {unread && (
            <Glyph
              name="unread"
              color={c['color/bg/accent-strong']}
              style={{
                position: 'absolute',
                start: -12,
                top: (s['type/body/line'] - 8) / 2,
              }}
            />
          )}
          <Text
            numberOfLines={1}
            style={{ fontWeight: selected ? '500' : '400' }}
          >
            {title}
          </Text>
        </View>
        {description && (
          <Text
            numberOfLines={1}
            style={{
              fontSize: s['type/list-meta/size'],
              lineHeight: s['type/list-meta/line'],
              color: c[selected ? 'color/fg/primary' : 'color/fg/secondary'],
            }}
          >
            {description}
          </Text>
        )}
      </View>
      {meta && (
        <Text
          style={{
            fontSize: s['type/list-meta/size'],
            lineHeight: s['type/list-meta/line'],
            color: c[selected ? 'color/fg/primary' : 'color/fg/tertiary'],
          }}
        >
          {meta}
        </Text>
      )}
      {chevron && (
        <View style={{ width: 6, height: 16 }}>
          <Glyph
            name="chevron-right"
            color={c['color/fg/tertiary']}
            style={{ position: 'absolute', start: -4 }}
          />
        </View>
      )}
    </Pressable>
  );
}
export function AmbientWash({
  contextId,
  hue,
}: {
  contextId: string;
  hue?: ContextHue;
}) {
  const t = useMagnolia(),
    color = hue ?? contextHue(contextId);
  return (
    <Image
      accessible={false}
      importantForAccessibility="no"
      source={nativeGlyphs.wash.source}
      resizeMode="stretch"
      style={{
        position: 'absolute',
        top: 0,
        start: 0,
        end: 0,
        height: 400,
        width: '100%',
        tintColor: t.colors[`color/wash/${color}`],
      }}
    />
  );
}
