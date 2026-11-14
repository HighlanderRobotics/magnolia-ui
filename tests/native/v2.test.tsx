import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import {
  MagnoliaProvider,
  Button,
  TextField,
  Tabs,
  Stat,
} from '../../packages/react-native/src/v2';
test('v2 native loading preserves its label and blocks duplicate submission', () => {
  const onPress = jest.fn();
  const { getByRole, getByText, rerender } = render(
    <MagnoliaProvider>
      <Button onPress={onPress} loading>
        Save changes
      </Button>
    </MagnoliaProvider>,
  );
  expect(getByText('Save changes')).toBeTruthy();
  expect(getByRole('button').props.accessibilityState.busy).toBe(true);
  fireEvent.press(getByRole('button'));
  expect(onPress).not.toHaveBeenCalled();
  rerender(
    <MagnoliaProvider mode="light" density="compact">
      <Button onPress={onPress}>Save changes</Button>
    </MagnoliaProvider>,
  );
  fireEvent.press(getByRole('button'));
  expect(onPress).toHaveBeenCalledTimes(1);
});
test('v2 native fields announce errors and tabs preserve disabled states', () => {
  const change = jest.fn();
  const { getByLabelText, getByRole, getByText } = render(
    <MagnoliaProvider>
      <TextField label="Match" error="Enter a positive number" />
      <Tabs
        label="Views"
        value="missing"
        onValueChange={change}
        items={[
          { value: 'a', label: 'Overview' },
          { value: 'b', label: 'Notes', disabled: true },
        ]}
      />
      <Stat label="Average" value={null} />
    </MagnoliaProvider>,
  );
  expect(getByLabelText('Match').props.accessibilityHint).toContain(
    'Enter a positive number',
  );
  expect(
    getByRole('tab', { name: 'Overview' }).props.accessibilityState.selected,
  ).toBe(true);
  fireEvent.press(getByRole('tab', { name: 'Notes' }));
  expect(change).not.toHaveBeenCalled();
  expect(getByText('—')).toBeTruthy();
});
