import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import {
  Button,
  Glyph,
  Spinner,
  SearchField,
  Text,
  useMagnolia,
} from './v2.js';
type Item = { value: string; label: string; disabled?: boolean };
function Highlight({ label, query }: { label: string; query: string }) {
  const index = query ? label.toLowerCase().indexOf(query.toLowerCase()) : -1;
  return (
    <Text style={{ flex: 1 }}>
      {index < 0 ? (
        label
      ) : (
        <>
          {label.slice(0, index)}
          <Text style={{ fontWeight: '500' }}>
            {label.slice(index, index + query.length)}
          </Text>
          {label.slice(index + query.length)}
        </>
      )}
    </Text>
  );
}
type Shared = {
  label: string;
  items: Item[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
  onQueryChange?: (query: string) => void;
};
type Props = Shared & {
  value?: string | null;
  values?: string[];
  multiple?: boolean;
  onSelect: (item: Item) => void;
  onRemove?: (value: string) => void;
};
function ChoiceField({
  label,
  items,
  value = null,
  values = [],
  multiple = false,
  placeholder,
  disabled = false,
  error,
  loading = false,
  onQueryChange,
  onSelect,
  onRemove,
}: Props) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState('');
  const trigger = useRef<View>(null);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const matches = items.filter((item) =>
      item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
    ),
    selected = items.filter((item) =>
      multiple ? values.includes(item.value) : item.value === value,
    );
  function close() {
    Keyboard.dismiss();
    setOpen(false);
    const target = findNodeHandle(trigger.current);
    if (target != null) AccessibilityInfo.setAccessibilityFocus(target);
  }
  function search(next: string) {
    setQuery(next);
    onQueryChange?.(next);
  }
  function choose(item: Item) {
    if (item.disabled || loading) return;
    onSelect(item);
    if (multiple) search('');
    else close();
  }
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
      <View
        style={{
          flexDirection: 'row',
          flexWrap: multiple ? 'wrap' : 'nowrap',
          alignItems: 'center',
          gap: multiple ? 4 : s['gap/inline'],
          paddingVertical: multiple ? 9 : 0,
          paddingStart: multiple ? 9 : 12,
          paddingEnd: 36,
          minHeight: 44,
          borderWidth: 1,
          borderRadius: s['radius/control'],
          borderColor:
            c[
              error
                ? 'color/border/danger'
                : open
                  ? 'color/border/accent'
                  : 'color/border/default'
            ],
          backgroundColor: c['color/bg/field'],
        }}
      >
        {multiple &&
          selected.map((item) => (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.label}`}
              accessibilityState={{ disabled }}
              disabled={disabled}
              onPress={() => onRemove?.(item.value)}
              style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  height: s['size/token'],
                  paddingStart: 8,
                  paddingEnd: 5,
                  borderWidth: 1,
                  borderColor: c['color/border/edge'],
                  borderRadius: 4,
                  backgroundColor: c['color/bg/neutral-subtle'],
                }}
              >
                <Text
                  style={{
                    fontSize: s['type/label/sm/size'],
                    lineHeight: s['type/label/sm/line'],
                  }}
                >
                  {item.label}
                </Text>
                <Glyph name="token-remove" color={c['color/fg/secondary']} />
              </View>
            </Pressable>
          ))}
        <Pressable
          ref={trigger}
          accessibilityRole="combobox"
          accessibilityLabel={label}
          accessibilityValue={{
            text: multiple
              ? `${selected.length} selected`
              : (selected[0]?.label ?? 'No selection'),
          }}
          accessibilityState={{ expanded: open, disabled, busy: loading }}
          accessibilityHint={error}
          disabled={disabled}
          onPress={() => {
            search('');
            setOpen(true);
          }}
          style={{
            flex: 1,
            minWidth: multiple ? 70 : 0,
            minHeight: 44,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color:
                c[
                  !multiple && selected.length
                    ? 'color/fg/primary'
                    : 'color/fg/tertiary'
                ],
            }}
          >
            {multiple
              ? (placeholder ?? 'Add tag…')
              : (selected[0]?.label ?? placeholder ?? 'Search options')}
          </Text>
        </Pressable>
        <View
          pointerEvents="none"
          style={{ position: 'absolute', end: 11, top: 13 }}
        >
          <Glyph
            name={open ? 'combo-up' : 'combo-down'}
            color={c['color/fg/secondary']}
          />
        </View>
      </View>
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
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: '#0008',
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Dismiss ${label} options`}
            onPress={close}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />
          <View
            accessibilityViewIsModal
            style={{
              maxHeight: '85%',
              padding: 12,
              gap: 8,
              borderTopStartRadius: 12,
              borderTopEndRadius: 12,
              backgroundColor: c['color/bg/overlay'],
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text accessibilityRole="header">{label}</Text>
              <Button variant="tertiary" onPress={close}>
                Done
              </Button>
            </View>
            <SearchField
              label={`Search ${label}`}
              value={query}
              onChangeText={search}
              autoFocus
            />
            <ScrollView keyboardShouldPersistTaps="handled">
              {!loading &&
                matches.map((item) => (
                  <Pressable
                    key={item.value}
                    accessibilityRole={multiple ? 'checkbox' : 'radio'}
                    accessibilityLabel={item.label}
                    accessibilityState={{
                      checked: multiple
                        ? values.includes(item.value)
                        : value === item.value,
                      disabled: !!item.disabled,
                    }}
                    disabled={item.disabled}
                    onPress={() => choose(item)}
                    style={({ pressed }) => ({
                      minHeight: 44,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: s['gap/inline'],
                      paddingHorizontal: 8,
                      paddingVertical: 7,
                      borderRadius: s['radius/control-inner'],
                      backgroundColor: pressed
                        ? c['color/bg/tertiary-hover']
                        : 'transparent',
                      opacity: item.disabled ? 0.4 : 1,
                    })}
                  >
                    <Highlight label={item.label} query={query} />
                    {(multiple
                      ? values.includes(item.value)
                      : value === item.value) && (
                      <Glyph name="combo-check" color={c['color/fg/accent']} />
                    )}
                  </Pressable>
                ))}
              {(loading || !matches.length) && (
                <View
                  accessible
                  accessibilityLabel={
                    loading ? 'Searching' : `No results for ${query}`
                  }
                  accessibilityLiveRegion="polite"
                  style={{
                    minHeight: 44,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: s['gap/inline'],
                    padding: 8,
                  }}
                >
                  {loading ? (
                    <Spinner size="small" label="Searching" />
                  ) : (
                    <Glyph name="combo-empty" color={c['color/fg/secondary']} />
                  )}
                  <Text style={{ color: c['color/fg/secondary'] }}>
                    {loading
                      ? 'Searching…'
                      : `No results${query ? ` for “${query}”` : ''}`}
                  </Text>
                </View>
              )}
            </ScrollView>
            {!loading && !!matches.length && (
              <Text
                style={{
                  fontSize: s['type/caption/size'],
                  lineHeight: s['type/caption/line'],
                  color: c['color/fg/tertiary'],
                  paddingHorizontal: 8,
                }}
              >
                {multiple
                  ? `${selected.length} selected`
                  : `${matches.length} of ${items.length} options`}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
export function Combobox({
  value,
  onValueChange,
  ...rest
}: Shared & { value: string | null; onValueChange: (value: string) => void }) {
  return (
    <ChoiceField
      {...rest}
      value={value}
      onSelect={(item) => onValueChange(item.value)}
    />
  );
}
export function MultiSelect({
  value,
  onValueChange,
  ...rest
}: Shared & { value: string[]; onValueChange: (value: string[]) => void }) {
  function toggle(id: string) {
    onValueChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  }
  return (
    <ChoiceField
      {...rest}
      multiple
      values={value}
      onSelect={(item) => toggle(item.value)}
      onRemove={toggle}
    />
  );
}
