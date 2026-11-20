import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Keyboard,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import {
  addMonths,
  dateObject,
  formatDate,
  formatTime,
  localDateISO,
  monthGrid,
  parseDate,
  parseTime,
  quarterHours,
} from '@highlanderrobotics/magnolia-tokens/v2';
import { Button, Glyph, IconButton, Text, useMagnolia } from './v2.js';

type DayProps = {
  day: number | string;
  label: string;
  selected?: boolean;
  today?: boolean;
  outside?: boolean;
  inRange?: boolean;
  edge?: 'single' | 'start' | 'end' | 'middle';
  disabled?: boolean;
  onPress?: () => void;
};
export function DayCell({
  day,
  label,
  selected = false,
  today = false,
  outside = false,
  inRange = false,
  edge = 'single',
  disabled = false,
  onPress,
}: DayProps) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}${today ? ', today' : ''}`}
      accessibilityHint={inRange ? 'In selected range' : undefined}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        position: 'relative',
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: inRange ? 0 : s['radius/control'],
        borderTopEndRadius: edge === 'start' ? 0 : undefined,
        borderBottomEndRadius: edge === 'start' ? 0 : undefined,
        borderTopStartRadius: edge === 'end' ? 0 : undefined,
        borderBottomStartRadius: edge === 'end' ? 0 : undefined,
        backgroundColor:
          !selected && !inRange && !pressed
            ? 'transparent'
            : c[
                selected
                  ? pressed
                    ? 'color/bg/primary-press'
                    : 'color/bg/accent-strong'
                  : inRange
                    ? pressed
                      ? 'color/bg/range-pressed'
                      : 'color/bg/accent-subtle'
                    : pressed
                      ? 'color/bg/day-pressed'
                      : 'color/bg/day-hover'
              ],
      })}
    >
      <Text
        style={{
          fontSize: s['type/body/size'],
          lineHeight: s['type/body/line'],
          fontWeight: selected || today ? '500' : '400',
          color:
            c[
              disabled
                ? 'color/fg/disabled'
                : selected
                  ? 'color/fg/on-accent'
                  : outside
                    ? 'color/fg/tertiary'
                    : 'color/fg/primary'
            ],
          textDecorationLine: disabled ? 'line-through' : 'none',
        }}
      >
        {day}
      </Text>
      {today && (
        <Glyph
          name="today-dot"
          color={
            c[
              selected
                ? 'color/fg/on-accent'
                : inRange
                  ? 'color/fg/primary'
                  : 'color/fg/accent'
            ]
          }
          style={{ position: 'absolute', bottom: 5, left: 19.5 }}
        />
      )}
    </Pressable>
  );
}
export type CalendarProps = {
  value?: string;
  endValue?: string;
  range?: boolean;
  min?: string;
  max?: string;
  today?: string;
  month?: string;
  firstDay?: number;
  onValueChange: (value: string, endValue?: string) => void;
};
export function Calendar({
  value,
  endValue,
  range = false,
  min,
  max,
  today = localDateISO(),
  month,
  firstDay = 1,
  onValueChange,
}: CalendarProps) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes;
  const [visible, setVisible] = useState(
    parseDate(month ?? '') ?? parseDate(value ?? '') ?? today,
  );
  useEffect(() => {
    if (value && parseDate(value)) setVisible(value);
  }, [value]);
  useEffect(() => {
    if (month && parseDate(month)) setVisible(month);
  }, [month]);
  const start = ((firstDay % 7) + 7) % 7,
    cells = monthGrid(visible, start),
    weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
  function choose(day: string) {
    setVisible(day);
    if (range && (!value || endValue || day < value))
      onValueChange(day, undefined);
    else if (range) onValueChange(value!, day);
    else onValueChange(day);
  }
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        padding: 12,
        borderRadius: 12,
        backgroundColor: c['color/bg/overlay'],
        outlineWidth: 1,
        outlineColor: c['color/border/subtle'],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconButton
          label="Previous month"
          variant="tertiary"
          icon={<Glyph name="calendar-prev" />}
          onPress={() => setVisible(addMonths(visible, -1))}
        />
        <Text
          accessibilityLiveRegion="polite"
          style={{
            flex: 1,
            textAlign: 'center',
            fontWeight: '500',
            fontSize: s['type/label/size'],
          }}
        >
          {new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          }).format(dateObject(visible))}
        </Text>
        <IconButton
          label="Next month"
          variant="tertiary"
          icon={<Glyph name="calendar-next" />}
          onPress={() => setVisible(addMonths(visible, 1))}
        />
      </View>
      <View style={{ flexDirection: 'row' }}>
        {Array.from({ length: 7 }, (_, i) => (start + i) % 7).map((day) => (
          <Text
            key={day}
            accessibilityLabel={weekdays[day]}
            style={{
              width: 44,
              height: 28,
              textAlign: 'center',
              fontSize: s['type/caption/size'],
              lineHeight: 28,
              color: c['color/fg/tertiary'],
              fontWeight: '500',
            }}
          >
            {weekdays[day].slice(0, 2)}
          </Text>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, i) =>
        cells.slice(i * 7, i * 7 + 7),
      ).map((week, i) => (
        <View key={i} style={{ flexDirection: 'row' }}>
          {week.map((day, column) =>
            day ? (
              <DayCell
                key={day}
                day={dateObject(day).getUTCDate()}
                label={formatDate(day)}
                selected={day === value || (range && day === endValue)}
                today={day === today}
                outside={day.slice(0, 7) !== visible.slice(0, 7)}
                inRange={
                  range &&
                  !!value &&
                  !!endValue &&
                  day > value &&
                  day < endValue
                }
                edge={
                  range && value && endValue
                    ? day === value
                      ? 'start'
                      : day === endValue
                        ? 'end'
                        : day > value && day < endValue
                          ? 'middle'
                          : 'single'
                    : 'single'
                }
                disabled={(!!min && day < min) || (!!max && day > max)}
                onPress={() => choose(day)}
              />
            ) : (
              <View key={`blank-${column}`} style={{ width: 44, height: 44 }} />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

export type TemporalFieldProps = {
  label: string;
  value?: string;
  onValueChange: (value: string | undefined) => void;
  min?: string;
  max?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
};
function TemporalField({
  kind,
  label,
  value,
  onValueChange,
  min,
  max,
  helper,
  error,
  disabled = false,
  placeholder,
}: TemporalFieldProps & { kind: 'date' | 'time' }) {
  const t = useMagnolia(),
    c = t.colors,
    s = t.sizes,
    format = kind === 'date' ? formatDate : formatTime,
    parse = kind === 'date' ? parseDate : parseTime;
  const [text, setText] = useState(format(value)),
    [open, setOpen] = useState(false),
    [focus, setFocus] = useState(false),
    [localError, setLocalError] = useState('');
  const trigger = useRef<View>(null);
  useEffect(() => {
    setText(format(value));
  }, [value, format]);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const message = error || localError;
  function restore() {
    const target = findNodeHandle(trigger.current);
    if (target != null) AccessibilityInfo.setAccessibilityFocus(target);
  }
  function close() {
    setOpen(false);
    restore();
  }
  function commit() {
    if (!text.trim()) {
      onValueChange(undefined);
      setLocalError('');
      return;
    }
    const next = parse(text),
      invalid = !next
        ? `Enter a valid ${kind}.`
        : min && next < min
          ? `Choose a ${kind} on or after ${min}.`
          : max && next > max
            ? `Choose a ${kind} on or before ${max}.`
            : '';
    setLocalError(invalid);
    if (!invalid) {
      onValueChange(next);
      setText(format(next));
    }
  }
  function choose(next: string) {
    onValueChange(next);
    setText(format(next));
    setLocalError('');
    close();
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
          alignItems: 'center',
          gap: s['gap/inline'],
          paddingStart: 12,
          borderWidth: 1,
          borderColor:
            c[
              message
                ? 'color/border/danger'
                : focus || open
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
          accessibilityLabel={label}
          accessibilityHint={[
            message || helper,
            kind === 'date'
              ? 'Type an ISO date or English month date'
              : 'Type a 24-hour time or AM/PM',
          ]
            .filter(Boolean)
            .join('. ')}
          value={text}
          editable={!disabled}
          placeholder={
            placeholder ??
            (kind === 'date' ? 'e.g. Oct 14, 2026' : 'e.g. 2:30 PM')
          }
          placeholderTextColor={c['color/fg/tertiary']}
          onChangeText={(next) => {
            setText(next);
            setLocalError('');
          }}
          onFocus={() => setFocus(true)}
          onBlur={() => {
            commit();
            setFocus(false);
          }}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 44,
            fontFamily: t.fontFamily,
            fontSize: s['type/body/size'],
            lineHeight: s['type/body/line'],
            color: c['color/fg/primary'],
            paddingVertical: 8,
          }}
        />
        <Pressable
          ref={trigger}
          accessibilityRole="button"
          accessibilityLabel={`Choose ${label}`}
          accessibilityState={{ expanded: open, disabled }}
          disabled={disabled}
          onPress={() => {
            Keyboard.dismiss();
            commit();
            setOpen(true);
          }}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Glyph
            name={kind === 'date' ? 'calendar' : 'clock'}
            color={c['color/fg/secondary']}
          />
        </Pressable>
      </View>
      {!!(message || helper) && (
        <View style={{ minHeight: 19, justifyContent: 'flex-end' }}>
          <Text
            accessibilityLiveRegion={message ? 'polite' : 'none'}
            style={{
              fontSize: s['type/field-help/size'],
              lineHeight: s['type/field-help/line'],
              color: c[message ? 'color/fg/danger' : 'color/fg/secondary'],
            }}
          >
            {message ? `Error: ${message}` : helper}
          </Text>
        </View>
      )}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
        onDismiss={restore}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: '#0008',
          }}
        >
          <Pressable
            accessibilityLabel={`Dismiss ${label} picker`}
            accessibilityRole="button"
            onPress={close}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />
          <View
            accessibilityViewIsModal
            style={{
              alignItems: 'center',
              padding: 12,
              borderTopStartRadius: 12,
              borderTopEndRadius: 12,
              maxHeight: '85%',
              backgroundColor: c['color/bg/overlay'],
            }}
          >
            <View
              style={{
                alignSelf: 'stretch',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text accessibilityRole="header">{label}</Text>
              <Button variant="tertiary" onPress={close}>
                Close
              </Button>
            </View>
            {kind === 'date' ? (
              <Calendar
                value={value}
                min={min}
                max={max}
                onValueChange={choose}
              />
            ) : (
              <ScrollView style={{ alignSelf: 'stretch' }}>
                {quarterHours
                  .filter(
                    (time) => (!min || time >= min) && (!max || time <= max),
                  )
                  .map((time) => (
                    <Pressable
                      key={time}
                      accessibilityRole="radio"
                      accessibilityLabel={formatTime(time)}
                      accessibilityState={{ checked: value === time }}
                      onPress={() => choose(time)}
                      style={{
                        minHeight: 44,
                        padding: 12,
                        borderRadius: s['radius/control'],
                        backgroundColor:
                          time === value
                            ? c['color/bg/list-selected']
                            : 'transparent',
                      }}
                    >
                      <Text
                        style={{ fontWeight: time === value ? '500' : '400' }}
                      >
                        {formatTime(time)}
                      </Text>
                    </Pressable>
                  ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
export function DateField(props: TemporalFieldProps) {
  return <TemporalField {...props} kind="date" />;
}
export function TimeField(props: TemporalFieldProps) {
  return <TemporalField {...props} kind="time" />;
}
