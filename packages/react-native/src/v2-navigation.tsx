import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Linking, Pressable, View } from 'react-native';
import type { PressableProps, ViewProps } from 'react-native';
import { Text, Glyph, IconButton, useMagnolia } from './v2.js';

type DestinationProps = Omit<PressableProps, 'children'> & {
  label: string;
  icon?: ReactNode;
  count?: string | number;
  selected?: boolean;
  href?: string;
};

function Destination({
  label,
  icon,
  count,
  selected = false,
  href,
  disabled,
  onPress,
  onFocus,
  onBlur,
  style,
  rail = false,
  ...rest
}: DestinationProps & { rail?: boolean }) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const [focus, setFocus] = useState(false),
    [hover, setHover] = useState(false);
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole={href ? 'link' : 'button'}
      accessibilityLabel={
        rest.accessibilityLabel ??
        [label, count].filter((x) => x !== undefined).join(', ')
      }
      accessibilityState={{
        ...rest.accessibilityState,
        selected,
        disabled: !!disabled,
      }}
      onFocus={(e) => {
        setFocus(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocus(false);
        onBlur?.(e);
      }}
      onHoverIn={(e) => {
        setHover(true);
        rest.onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        setHover(false);
        rest.onHoverOut?.(e);
      }}
      onPress={(e) => {
        if (disabled) return;
        if (onPress) onPress(e);
        else if (href) void Linking.openURL(href);
      }}
      style={(interaction) => [
        {
          width: rail ? 72 : 224,
          maxWidth: '100%',
          minHeight: rail ? 56 : Math.max(44, s['size/control-sm']),
          flexDirection: rail ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: rail ? 'center' : undefined,
          gap: rail ? 4 : 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: selected
            ? c['color/bg/selected']
            : !disabled && interaction.pressed
              ? c['color/bg/ghost-pressed']
              : !disabled && hover
                ? c['color/bg/ghost-hover']
                : 'transparent',
          outlineWidth: focus ? 2 : 0,
          outlineOffset: -2,
          outlineColor: c['color/border/focus'],
        },
        typeof style === 'function' ? style(interaction) : style,
      ]}
    >
      {(interaction) => {
        const color =
          c[
            disabled
              ? 'color/fg/disabled'
              : selected || interaction.pressed || hover
                ? 'color/fg/primary'
                : 'color/fg/secondary'
          ];
        return (
          <>
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{
                width: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon ?? (
                <Glyph
                  name={rail && selected ? 'rail-house-selected' : 'nav-house'}
                  color={color}
                />
              )}
            </View>
            <Text
              style={{
                color,
                flex: rail ? undefined : 1,
                minWidth: 0,
                textAlign: rail ? 'center' : 'auto',
                fontSize:
                  s[
                    rail
                      ? selected
                        ? 'type/label/sm/size'
                        : 'type/body/sm/size'
                      : selected
                        ? 'type/label/size'
                        : 'type/body/size'
                  ],
                lineHeight:
                  s[
                    rail
                      ? selected
                        ? 'type/label/sm/line'
                        : 'type/body/sm/line'
                      : selected
                        ? 'type/label/line'
                        : 'type/body/line'
                  ],
                fontWeight: selected ? '500' : '400',
              }}
            >
              {label}
            </Text>
            {count !== undefined && !rail && (
              <Text
                style={{
                  color:
                    c[disabled ? 'color/fg/disabled' : 'color/fg/secondary'],
                  fontSize: s['type/label/sm/size'],
                  lineHeight: s['type/label/sm/line'],
                  fontWeight: '500',
                }}
              >
                {count}
              </Text>
            )}
          </>
        );
      }}
    </Pressable>
  );
}
export function NavItem(props: DestinationProps) {
  return <Destination {...props} />;
}
export function NavRailItem(props: Omit<DestinationProps, 'count'>) {
  return <Destination {...props} rail />;
}
export function NavSection({
  label,
  style,
  ...rest
}: ViewProps & { label: string }) {
  const t = useMagnolia();
  return (
    <View
      {...rest}
      style={[
        {
          width: 224,
          maxWidth: '100%',
          paddingTop: 16,
          paddingBottom: 4,
          paddingHorizontal: 8,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: t.colors['color/fg/tertiary'],
          fontSize: t.sizes['type/label/sm/size'],
          lineHeight: t.sizes['type/label/sm/line'],
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
export function Breadcrumb({
  items,
  label = 'Breadcrumb',
  style,
  ...rest
}: ViewProps & {
  label?: string;
  items: { label: string; href?: string; onPress?: () => void }[];
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  return (
    <View
      {...rest}
      accessibilityLabel={label}
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 4,
        },
        style,
      ]}
    >
      {items.map((item, i) => {
        const current = i === items.length - 1;
        return (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              maxWidth: '100%',
              flexShrink: 1,
            }}
          >
            {i > 0 && (
              <Glyph
                name="breadcrumb-separator"
                color={c['color/fg/secondary']}
              />
            )}
            {!current && (item.href || item.onPress) ? (
              <BreadcrumbLink item={item} />
            ) : (
              <Text
                accessibilityLabel={
                  current ? `${item.label}, current page` : item.label
                }
                style={{
                  flexShrink: 1,
                  color: c[current ? 'color/fg/primary' : 'color/fg/secondary'],
                  fontSize:
                    s[current ? 'type/label/sm/size' : 'type/body/sm/size'],
                  lineHeight:
                    s[current ? 'type/label/sm/line' : 'type/body/sm/line'],
                  fontWeight: current ? '500' : '400',
                }}
              >
                {item.label}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
function BreadcrumbLink({
  item,
}: {
  item: { label: string; href?: string; onPress?: () => void };
}) {
  const t = useMagnolia();
  const [focus, setFocus] = useState(false),
    [hover, setHover] = useState(false);
  return (
    <Pressable
      accessibilityRole={item.href ? 'link' : 'button'}
      accessibilityLabel={item.label}
      onPress={() => {
        if (item.onPress) item.onPress();
        else if (item.href) void Linking.openURL(item.href);
      }}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        minHeight: 44,
        justifyContent: 'center',
        flexShrink: 1,
        borderRadius: 2,
        outlineWidth: focus ? 2 : 0,
        outlineOffset: 2,
        outlineColor: t.colors['color/border/focus'],
      }}
    >
      <Text
        style={{
          color: t.colors[hover ? 'color/fg/primary' : 'color/fg/secondary'],
          fontSize: t.sizes['type/body/sm/size'],
          lineHeight: t.sizes['type/body/sm/line'],
        }}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

export function TabBarItem({
  label,
  icon,
  badge,
  selected = false,
  disabled,
  href,
  onPress,
  onFocus,
  onBlur,
  style,
  ...rest
}: Omit<DestinationProps, 'icon' | 'count'> & {
  icon?: ReactNode | ((selected: boolean) => ReactNode);
  badge?: string | number;
}) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const [focus, setFocus] = useState(false);
  const color =
    c[
      disabled
        ? 'color/fg/disabled'
        : selected
          ? 'color/fg/accent'
          : 'color/fg/secondary'
    ];
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole={href ? 'link' : 'button'}
      accessibilityLabel={
        rest.accessibilityLabel ??
        `${label}${badge !== undefined ? `, ${badge} unread` : ''}`
      }
      accessibilityState={{
        ...rest.accessibilityState,
        selected,
        disabled: !!disabled,
      }}
      onPress={(e) => {
        if (disabled) return;
        if (onPress) onPress(e);
        else if (href) void Linking.openURL(href);
      }}
      onFocus={(e) => {
        setFocus(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocus(false);
        onBlur?.(e);
      }}
      style={(interaction) => [
        {
          width: 80,
          minHeight: 52,
          paddingVertical: 4,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          borderRadius: interaction.pressed ? 0 : 8,
          backgroundColor:
            interaction.pressed && !disabled
              ? c['color/bg/ghost-pressed']
              : 'transparent',
          outlineWidth: focus ? 2 : 0,
          outlineOffset: -2,
          outlineColor: c['color/border/focus'],
        },
        typeof style === 'function' ? style(interaction) : style,
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={{
          width: 24,
          height: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {typeof icon === 'function'
          ? icon(selected)
          : (icon ?? (
              <Glyph
                name={selected ? 'tab-house-selected' : 'tab-house'}
                color={color}
              />
            ))}
      </View>
      <Text
        style={{
          color,
          textAlign: 'center',
          fontSize: s[selected ? 'type/label/sm/size' : 'type/body/sm/size'],
          lineHeight: s[selected ? 'type/label/sm/line' : 'type/body/sm/line'],
          fontWeight: selected ? '500' : '400',
        }}
      >
        {label}
      </Text>
      {badge !== undefined && (
        <View
          style={{
            position: 'absolute',
            top: -1,
            left: 49,
            minWidth: 16,
            height: 16,
            paddingHorizontal: 4,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: c['color/bg/base'],
            backgroundColor: c['color/fg/primary'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: c['color/bg/base'],
              fontSize: 11,
              lineHeight: 16,
              fontWeight: '500',
            }}
          >
            {badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
export function TabBar({
  children,
  bottomInset = 32,
  style,
  ...rest
}: ViewProps & { bottomInset?: number }) {
  const t = useMagnolia();
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 4,
          paddingTop: 4,
          paddingHorizontal: 8,
          paddingBottom: Math.max(
            0,
            Number.isFinite(bottomInset) ? bottomInset : 32,
          ),
          borderTopWidth: 1,
          borderColor: t.colors['color/border/subtle'],
          backgroundColor: t.colors['color/bg/base'],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function TopBar({
  title,
  variant = 'inline',
  collapsed = false,
  onBack,
  backLabel = 'Back',
  onAction,
  actionLabel = 'More options',
  action,
  style,
  ...rest
}: ViewProps & {
  title: string;
  variant?: 'inline' | 'large';
  collapsed?: boolean;
  onBack?: () => void;
  backLabel?: string;
  onAction?: () => void;
  actionLabel?: string;
  action?: ReactNode;
}) {
  const t = useMagnolia(),
    s = t.sizes,
    large = variant === 'large' && !collapsed;
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: t.colors['color/bg/base'],
          paddingHorizontal: 4,
          paddingBottom: large ? 8 : 0,
        },
        style,
      ]}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44 }}
      >
        {onBack ? (
          <IconButton
            label={backLabel}
            variant="tertiary"
            onPress={onBack}
            icon={<Glyph name="top-back" />}
          />
        ) : (
          <View style={{ width: 44 }} />
        )}
        {large ? (
          <View style={{ flex: 1 }} />
        ) : (
          <Text
            accessibilityRole="header"
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: 'center',
              fontSize: s['type/title/sm/size'],
              lineHeight: s['type/title/sm/line'],
              fontWeight: '500',
            }}
          >
            {title}
          </Text>
        )}
        {action ??
          (onAction ? (
            <IconButton
              label={actionLabel}
              variant="tertiary"
              onPress={onAction}
              icon={<Glyph name="top-more" />}
            />
          ) : (
            <View style={{ width: 44 }} />
          ))}
      </View>
      {large && (
        <Text
          accessibilityRole="header"
          style={{
            paddingHorizontal: 12,
            fontSize: s['type/title/lg/size'],
            lineHeight: s['type/title/lg/line'],
            fontWeight: '500',
            letterSpacing: -0.28,
          }}
        >
          {title}
        </Text>
      )}
    </View>
  );
}
