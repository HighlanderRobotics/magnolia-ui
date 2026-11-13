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
} from '@highlanderrobotics/magnolia-react-native';
export default function App() {
  const [name, setName] = useState('');
  const [ready, setReady] = useState(false);
  const [dark, setDark] = useState(true);
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
        <View>
          <Alert>Example only: no scouting data is written.</Alert>
        </View>
      </ScrollView>
    </MagnoliaProvider>
  );
}
