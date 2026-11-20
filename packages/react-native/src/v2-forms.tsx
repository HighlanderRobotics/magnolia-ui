import React from 'react';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text, Glyph, useMagnolia } from './v2.js';
import { useOverlayFocus } from './v2-overlays.js';

export function FormSection({
  title,
  description,
  children,
  style,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useMagnolia();
  return (
    <View
      style={[
        { width: 560, maxWidth: '100%', gap: t.sizes['gap/form-header'] },
        style,
      ]}
    >
      <View style={{ gap: 4 }}>
        <Text
          accessibilityRole="header"
          style={{
            fontSize: t.sizes['type/title/sm/size'],
            lineHeight: t.sizes['type/title/sm/line'],
            fontWeight: '500',
          }}
        >
          {title}
        </Text>
        {description && (
          <Text
            style={{
              fontSize: t.sizes['type/body/sm/size'],
              lineHeight: t.sizes['type/body/sm/line'],
              color: t.colors['color/fg/secondary'],
            }}
          >
            {description}
          </Text>
        )}
      </View>
      <View style={{ gap: t.sizes['gap/stack'], width: '100%' }}>
        {children}
      </View>
    </View>
  );
}

export function FormRow({ children }: { children?: ReactNode }) {
  const t = useMagnolia(),
    [width, setWidth] = React.useState(0);
  const stacked = width <= 480;
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        width: '100%',
        flexDirection: stacked ? 'column' : 'row',
        gap: t.sizes['gap/stack'],
      }}
    >
      {React.Children.map(children, (child) => (
        <View
          style={{
            flex: stacked ? undefined : 1,
            minWidth: 0,
            width: stacked ? '100%' : undefined,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

type FormError = { id: string; label: string; message: string };
export function ErrorSummary({
  errors,
  title,
  autofocus = true,
  focusKey = 0,
  onField,
  ref: externalRef,
  style,
}: {
  errors: readonly FormError[];
  title?: string;
  autofocus?: boolean;
  focusKey?: number;
  onField: (error: FormError) => void;
  ref?: React.Ref<View>;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useMagnolia(),
    focus = useOverlayFocus(),
    heading = React.useRef<View>(null);
  const hasErrors = errors.length > 0;
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (hasErrors && autofocus) focus.focusElement(() => heading.current);
  }, [hasErrors, autofocus, focusKey, focus.focusElement]);
  if (!hasErrors) return null;
  const summaryTitle =
    title ??
    `Fix ${errors.length} ${errors.length === 1 ? 'field' : 'fields'} to continue`;
  return (
    <View
      style={[
        {
          width: 740,
          maxWidth: '100%',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 8,
          paddingHorizontal: t.sizes['pad/summary-x'] - 1,
          paddingVertical: t.sizes['pad/summary-y'] - 1,
          borderWidth: 1,
          borderRadius: 12,
          borderColor: t.colors['color/border/danger'],
          backgroundColor: t.colors['color/bg/danger-subtle'],
        },
        style,
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          width: t.sizes['size/icon-sm'],
          height: t.sizes['type/summary-title/line'],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Glyph name="error-summary" color={t.colors['color/fg/danger']} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: t.sizes['gap/summary-title'] }}>
        <View
          ref={(node) => {
            heading.current = node;
            if (typeof externalRef === 'function') externalRef(node);
            else if (externalRef) externalRef.current = node;
          }}
          accessible
          accessibilityRole="alert"
          accessibilityLabel={summaryTitle}
        >
          <Text
            style={{
              fontSize: t.sizes['type/summary-title/size'],
              lineHeight: t.sizes['type/summary-title/line'],
              fontWeight: '500',
            }}
          >
            {summaryTitle}
          </Text>
        </View>
        <View style={{ gap: t.sizes['gap/summary-row'] }}>
          {errors.map((error) => (
            <Pressable
              key={error.id}
              accessibilityRole="link"
              accessibilityLabel={`${error.label} — ${error.message}`}
              onPress={() => onField(error)}
              onFocus={() => setFocusedId(error.id)}
              onBlur={() => setFocusedId(null)}
              style={({ pressed }) => ({
                minHeight: 44,
                justifyContent: 'center',
                opacity: pressed ? 0.75 : 1,
                outlineWidth: focusedId === error.id ? 2 : 0,
                outlineColor: t.colors['color/border/focus'],
                outlineOffset: 2,
                borderRadius: 2,
              })}
            >
              <Text
                style={{
                  fontSize: t.sizes['type/summary-item/size'],
                  lineHeight: t.sizes['type/summary-item/line'],
                  color: t.colors['color/fg/danger'],
                }}
              >
                <Text
                  style={{
                    fontWeight: '500',
                    color: t.colors['color/fg/danger'],
                    fontSize: t.sizes['type/summary-item/size'],
                    lineHeight: t.sizes['type/summary-item/line'],
                  }}
                >
                  {error.label}
                </Text>{' '}
                — {error.message}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
