import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  MagnoliaProvider,
  Button,
  TextField,
  Checkbox,
  Switch,
  TitleLarge,
  Alert,
  Pill,
  Radio,
  Select,
  Dialog,
  Menu,
  Text,
} from '@highlanderrobotics/magnolia-react-native';
export default function App() {
  const [name, setName] = useState('');
  const [ready, setReady] = useState(false);
  const [dark, setDark] = useState(true);
  const [alliance, setAlliance] = useState<string | null>(null);
  const [dialog, setDialog] = useState(false);
  const [menu, setMenu] = useState(false);
  const [action, setAction] = useState('No action');
  return (
    <MagnoliaProvider mode={dark ? 'dark' : 'light'}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        <TitleLarge>Magnolia UI</TitleLarge>
        <Switch
          accessibilityLabel="Dark theme"
          value={dark}
          onValueChange={setDark}
        />
        <TextField label="Team name" value={name} onChangeText={setName} />
        <Pill active={ready} onChange={setReady}>
          Ready to scout
        </Pill>
        <Checkbox label="Ready to scout" checked={ready} onChange={setReady} />
        <Button
          variant="primary"
          disabled={!ready}
          onPress={async () => {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }}
        >
          Save example
        </Button>
        <Radio
          label="Red alliance"
          value="red"
          checked={alliance === 'red'}
          onSelect={setAlliance}
        />
        <Radio
          label="Blue alliance"
          value="blue"
          checked={alliance === 'blue'}
          onSelect={setAlliance}
        />
        <Select
          label="Alliance"
          value={alliance}
          onChange={setAlliance}
          items={[
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
            { value: 'unavailable', label: 'Unavailable', disabled: true },
          ]}
        />
        <Button onPress={() => setDialog(true)}>Show match notes</Button>
        <Dialog
          open={dialog}
          title="Match notes"
          onClose={() => setDialog(false)}
        >
          <TextField label="Notes" />
        </Dialog>
        <Button onPress={() => setMenu(true)}>Report actions</Button>
        <Menu
          open={menu}
          onClose={() => setMenu(false)}
          items={[
            { value: 'copy', label: 'Copy report' },
            { value: 'remove', label: 'Remove report', danger: true },
          ]}
          onSelect={setAction}
        />
        <Text accessibilityLiveRegion="polite">{action}</Text>
        <View>
          <Alert>Example only: no scouting data is written.</Alert>
        </View>
      </ScrollView>
    </MagnoliaProvider>
  );
}
