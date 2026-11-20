import React from 'react';
import type { ReactNode } from 'react';
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  SafeAreaView,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import {
  commandResults,
  v2Tokens,
} from '@highlanderrobotics/magnolia-tokens/v2';
import type { CommandData } from '@highlanderrobotics/magnolia-tokens/v2';
import { Text, Glyph, Kbd, IconButton, useMagnolia } from './v2.js';
import { usePanelDisclosure } from './v2-overlays.js';
import type { NativeFocusTarget } from './v2-overlays.js';

export function CommandItem({
  label,
  meta,
  shortcut = [],
  active = false,
  disabled = false,
  icon,
  style,
  ...rest
}: PressableProps & {
  label: string;
  meta?: string;
  shortcut?: readonly string[];
  active?: boolean;
  icon?: ReactNode;
}) {
  const t = useMagnolia();
  const fg = t.colors[disabled ? 'color/fg/disabled' : 'color/fg/primary'];
  const secondary =
    t.colors[
      disabled
        ? 'color/fg/disabled'
        : active
          ? 'color/fg/primary'
          : 'color/fg/secondary'
    ];
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{
        ...rest.accessibilityState,
        selected: active,
        disabled: !!disabled,
      }}
      style={(state) => [
        {
          width: 544,
          maxWidth: '100%',
          minHeight: Math.max(44, t.sizes['size/control-sm']),
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderRadius: 8,
          backgroundColor:
            active || state.pressed
              ? t.colors['color/bg/selected']
              : 'transparent',
        },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <View style={{ flexShrink: 0 }}>
        {icon ?? <Glyph name="command-file" color={secondary} />}
      </View>
      <Text
        style={{
          flex: 1,
          color: fg,
          fontWeight: active ? '500' : '400',
          fontSize: t.sizes[active ? 'type/label/size' : 'type/body/size'],
          lineHeight: t.sizes[active ? 'type/label/line' : 'type/body/line'],
        }}
      >
        {label}
      </Text>
      {meta && (
        <Text
          style={{
            color: secondary,
            fontSize: t.sizes['type/body/sm/size'],
            lineHeight: t.sizes['type/body/sm/line'],
          }}
        >
          {meta}
        </Text>
      )}
      {shortcut.length > 0 && (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: 'row', gap: 2 }}
        >
          {shortcut.map((key, i) => (
            <Kbd key={i} keyName={key} disabled={!!disabled} />
          ))}
        </View>
      )}
    </Pressable>
  );
}

export function CommandPalette({
  open,
  onOpenChange,
  trigger,
  items,
  query: controlledQuery,
  onQueryChange,
  label = 'Commands',
  placeholder = 'Search or jump to…',
  emptyMessage = 'No matching commands',
  loading = false,
  canClose = true,
  onSelect,
  onClose,
  returnFocusRef,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: (
    props: Pick<
      PressableProps,
      'onPress' | 'accessibilityState' | 'accessibilityHint'
    > & { ref: React.Ref<View> },
  ) => ReactNode;
  items: readonly (CommandData & { icon?: ReactNode })[];
  query?: string;
  onQueryChange?: (query: string) => void;
  label?: string;
  placeholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  canClose?: boolean;
  onSelect?: (item: CommandData, options: { panel: boolean }) => boolean | void;
  onClose?: () => void;
  returnFocusRef?: React.RefObject<NativeFocusTarget | null>;
}) {
  const t = useMagnolia(),
    viewport = useWindowDimensions();
  const disclosure = usePanelDisclosure(
    open,
    onOpenChange,
    onClose,
    returnFocusRef,
  );
  const [internalQuery, setInternalQuery] = React.useState(''),
    [activeId, setActiveId] = React.useState<string | null>(null);
  const query = controlledQuery ?? internalQuery;
  const input = React.useRef<TextInput>(null),
    scroll = React.useRef<ScrollView>(null);
  const positions = React.useRef(new Map<string, number>()),
    longPressed = React.useRef(false);
  const results = loading ? [] : commandResults(items, query),
    enabled = results.filter((item) => !item.disabled);
  const active = enabled.find((item) => item.id === activeId) ?? enabled[0];
  const mobile = viewport.width <= 600;
  const Panel = mobile ? SafeAreaView : View;
  function changeQuery(value: string) {
    if (controlledQuery === undefined) setInternalQuery(value);
    onQueryChange?.(value);
    setActiveId(null);
  }
  React.useEffect(() => {
    if (disclosure.visible) changeQuery('');
  }, [disclosure.visible]);
  React.useEffect(() => {
    const y = active && positions.current.get(active.id);
    if (y !== undefined) scroll.current?.scrollTo({ y, animated: false });
  }, [active?.id]);
  function choose(item: CommandData | undefined, panel = false) {
    if (!item || item.disabled || loading) return;
    if (onSelect?.(item, { panel }) !== false) disclosure.close();
  }
  function dismiss() {
    if (canClose) disclosure.close();
  }
  return (
    <>
      {trigger?.({
        ref: disclosure.focus.triggerRef,
        accessibilityState: { expanded: disclosure.visible },
        accessibilityHint: `Opens ${label}`,
        onPress: () => disclosure.change(true),
      })}
      <Modal
        visible={disclosure.visible}
        transparent
        animationType="none"
        onRequestClose={dismiss}
        onShow={() => disclosure.focus.focusElement(() => input.current)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          accessibilityViewIsModal
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: mobile ? 0 : 16,
            backgroundColor: t.colors['color/bg/scrim'],
          }}
        >
          <Pressable
            accessible={false}
            onPress={dismiss}
            style={{ position: 'absolute', inset: 0 }}
          />
          <Panel
            accessibilityLabel={label}
            onAccessibilityEscape={dismiss}
            style={{
              width: mobile ? '100%' : v2Tokens.scale['size/palette'],
              maxWidth: '100%',
              maxHeight: '100%',
              height: mobile ? '100%' : undefined,
              borderWidth: mobile ? 0 : 1,
              borderColor: t.colors['color/border/subtle'],
              borderRadius: mobile ? 0 : 16,
              overflow: 'hidden',
              backgroundColor: t.colors['color/bg/overlay'],
              boxShadow: '0px 1px 2px #0003, 0px 8px 20px #0000004d',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                minHeight: v2Tokens.scale['size/row-lg'],
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderColor: t.colors['color/border/subtle'],
              }}
            >
              <Glyph
                name="command-search"
                color={t.colors['color/fg/secondary']}
              />
              <TextInput
                ref={input}
                value={query}
                onChangeText={changeQuery}
                accessibilityLabel={label}
                accessibilityRole="combobox"
                accessibilityState={{ expanded: true, busy: loading }}
                placeholder={placeholder}
                placeholderTextColor={t.colors['color/fg/tertiary']}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={() => choose(active)}
                blurOnSubmit={false}
                onKeyPress={(e) => {
                  const key = e.nativeEvent.key;
                  if (key === 'Escape') dismiss();
                  if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
                    const index = enabled.findIndex(
                      (item) => item.id === active?.id,
                    );
                    const next =
                      key === 'Home'
                        ? 0
                        : key === 'End'
                          ? enabled.length - 1
                          : (index +
                              (key === 'ArrowDown' ? 1 : -1) +
                              enabled.length) %
                            enabled.length;
                    setActiveId(enabled[next]?.id ?? null);
                  }
                }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: 0,
                  color: t.colors['color/fg/primary'],
                  fontFamily: 'Roboto',
                  fontSize: t.sizes['type/body/size'],
                  lineHeight: t.sizes['type/body/line'],
                }}
              />
              {mobile ? (
                <IconButton
                  label={`Close ${label}`}
                  variant="tertiary"
                  icon={
                    <Glyph
                      name="sheet-close"
                      color={t.colors['color/fg/primary']}
                    />
                  }
                  onPress={disclosure.close}
                />
              ) : (
                <Kbd keyName="Esc" />
              )}
            </View>
            <ScrollView
              ref={scroll}
              keyboardShouldPersistTaps="handled"
              style={{ flexGrow: mobile ? 1 : 0, flexShrink: 1 }}
              contentContainerStyle={{ padding: 8 }}
            >
              {results.map((item, i) => (
                <View
                  key={item.id}
                  onLayout={(e) =>
                    positions.current.set(item.id, e.nativeEvent.layout.y)
                  }
                >
                  {item.group &&
                    (i === 0 || item.group !== results[i - 1].group) && (
                      <Text
                        style={{
                          fontSize: t.sizes['type/label/sm/size'],
                          lineHeight: t.sizes['type/label/sm/line'],
                          fontWeight: '500',
                          paddingTop: 8,
                          paddingBottom: 6,
                          paddingHorizontal: 12,
                          color: t.colors['color/fg/tertiary'],
                        }}
                      >
                        {item.group}
                      </Text>
                    )}
                  <CommandItem
                    {...item}
                    active={item.id === active?.id}
                    style={{ width: '100%' }}
                    onHoverIn={() => {
                      if (!item.disabled) setActiveId(item.id);
                    }}
                    onFocus={() => {
                      if (!item.disabled) setActiveId(item.id);
                    }}
                    onPressIn={() => {
                      longPressed.current = false;
                    }}
                    onLongPress={() => {
                      longPressed.current = true;
                      choose(item, true);
                    }}
                    onPress={() => {
                      if (!longPressed.current) choose(item);
                      longPressed.current = false;
                    }}
                    accessibilityHint="Opens this command. Long press to open in a panel."
                    accessibilityActions={[
                      { name: 'open-panel', label: 'Open in panel' },
                    ]}
                    onAccessibilityAction={(e) => {
                      if (e.nativeEvent.actionName === 'open-panel')
                        choose(item, true);
                    }}
                  />
                </View>
              ))}
              {!results.length && (
                <Text
                  accessibilityLiveRegion="polite"
                  style={{ padding: 16, color: t.colors['color/fg/secondary'] }}
                >
                  {loading ? 'Searching…' : emptyMessage}
                </Text>
              )}
            </ScrollView>
            {!mobile && (
              <View
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  flexDirection: 'row',
                  gap: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderTopWidth: 1,
                  borderColor: t.colors['color/border/subtle'],
                }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  {(['command-up', 'command-down'] as const).map((name) => (
                    <View
                      key={name}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: t.colors['color/border/default'],
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Glyph
                        name={name}
                        color={t.colors['color/fg/secondary']}
                      />
                    </View>
                  ))}
                  <Text
                    style={{
                      color: t.colors['color/fg/secondary'],
                      fontSize: t.sizes['type/body/sm/size'],
                      lineHeight: t.sizes['type/body/sm/line'],
                    }}
                  >
                    Navigate
                  </Text>
                </View>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <Kbd keyName="Enter" />
                  <Text
                    style={{
                      color: t.colors['color/fg/secondary'],
                      fontSize: t.sizes['type/body/sm/size'],
                      lineHeight: t.sizes['type/body/sm/line'],
                    }}
                  >
                    Open
                  </Text>
                </View>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <Kbd keyName="Enter" modifier />
                  <Text
                    style={{
                      color: t.colors['color/fg/secondary'],
                      fontSize: t.sizes['type/body/sm/size'],
                      lineHeight: t.sizes['type/body/sm/line'],
                    }}
                  >
                    Open in panel
                  </Text>
                </View>
              </View>
            )}
          </Panel>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
