import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import type { TextInput } from 'react-native';
import {
  MagnoliaProvider,
  useMagnolia,
  Text,
  Button,
  Switch,
  SegmentedControl,
  FormSection,
  FormRow,
  ErrorSummary,
  TextField,
  TextArea,
  SearchField,
  NumberField,
  DateField,
  TimeField,
  Icon,
  Kbd,
  Sheet,
  SheetAction,
  SheetSeparator,
  Drawer,
  CommandPalette,
  Toast,
} from '@highlanderrobotics/magnolia-react-native/v2';

/** Local-only v2 runtime fixture. The host loads Roboto and Roboto Mono. */
export default function V2() {
  const [dark, setDark] = useState(true);
  const [density, setDensity] = useState('comfortable');
  return (
    <MagnoliaProvider
      mode={dark ? 'dark' : 'light'}
      density={density === 'compact' ? 'compact' : 'comfortable'}
    >
      <Showcase
        dark={dark}
        setDark={setDark}
        density={density}
        setDensity={setDensity}
      />
    </MagnoliaProvider>
  );
}

function Showcase({
  dark,
  setDark,
  density,
  setDensity,
}: {
  dark: boolean;
  setDark: (value: boolean) => void;
  density: string;
  setDensity: (value: string) => void;
}) {
  const t = useMagnolia();
  const nameRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(0);
  const [search, setSearch] = useState('');
  const [count, setCount] = useState('0');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState(false);
  const [action, setAction] = useState('No action yet');
  const errors =
    submitted && !name.trim()
      ? [{ id: 'name', label: 'Name', message: 'Enter a name' }]
      : [];
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.colors['color/bg/canvas'] }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 24,
            gap: 24,
            alignItems: 'stretch',
          }}
        >
          <Text
            accessibilityRole="header"
            style={{ fontSize: 28, lineHeight: 36, fontWeight: '500' }}
          >
            Magnolia UI v2
          </Text>
          <Text>Native preview · local examples only</Text>
          <Switch label="Dark theme" checked={dark} onCheckedChange={setDark} />
          <SegmentedControl
            label="Density"
            value={density}
            onValueChange={setDensity}
            items={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ]}
          />
          <ErrorSummary
            errors={errors}
            focusKey={submitted}
            onField={() => nameRef.current?.focus()}
          />
          <FormSection
            title="Report details"
            description="Check stacked fields and linked validation on a phone."
          >
            <TextField
              ref={nameRef}
              label="Name"
              placeholder="Enter a name"
              value={name}
              onChangeText={setName}
              error={errors[0]?.message}
            />
            <FormRow>
              <DateField
                label="Date"
                value={date}
                onValueChange={(value) => setDate(value ?? '')}
                helper="Report date"
              />
              <TimeField
                label="Time"
                value={time}
                onValueChange={(value) => setTime(value ?? '')}
                helper="Local time"
              />
            </FormRow>
            <NumberField
              label="Items checked"
              value={count}
              onChangeText={setCount}
            />
            <TextArea label="Notes" value={notes} onChangeText={setNotes} />
            <Button
              onPress={() => {
                setSubmitted((n) => n + 1);
                if (name.trim()) setToast(true);
              }}
            >
              Validate report
            </Button>
          </FormSection>
          <SearchField
            label="Search examples"
            value={search}
            onChangeText={setSearch}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Icon name="folder" label="Folder" />
            <Kbd modifier="command" />
            <Kbd modifier="shift" />
            <Kbd modifier="enter" showKey={false} />
          </View>
          <Sheet
            title="Northwind"
            subtitle="Project · 214 entries"
            trigger={(props) => <Button {...props}>Open sheet</Button>}
          >
            <SheetAction
              label="Share link"
              onPress={() => setAction('Shared example')}
            />
            <SheetSeparator />
            <SheetAction label="Unavailable" disabled />
          </Sheet>
          <Drawer
            title="Northwind"
            subtitle="Project details"
            metrics={[
              { label: 'Reports', value: 0 },
              { label: 'Score', value: null },
            ]}
            details={[{ label: 'Status', value: 'In progress' }]}
            trigger={(props) => <Button {...props}>Open drawer</Button>}
            actions={(close) => <Button onPress={close}>Done</Button>}
          >
            <Text>Zero values and missing values remain distinct.</Text>
          </Drawer>
          <CommandPalette
            trigger={(props) => <Button {...props}>Open commands</Button>}
            items={[
              { id: 'reports', label: 'Reports', group: 'Pages' },
              { id: 'new', label: 'New report', group: 'Actions' },
              { id: 'disabled', label: 'Unavailable', disabled: true },
            ]}
            onSelect={(item, options) =>
              setAction(`${item.label}${options.panel ? ' in panel' : ''}`)
            }
          />
          <Toast
            open={toast}
            message="Example report validated"
            tone="success"
            onOpenChange={setToast}
          />
          <Text accessibilityLiveRegion="polite">{action}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
