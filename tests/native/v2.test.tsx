import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import {
  MagnoliaProvider,
  Button,
  TextField,
  Tabs,
  Stat,
  Checkbox,
  Radio,
  Switch,
  Chip,
  SearchField,
  TextArea,
  Select,
  IconButton,
  Kbd,
} from '../../packages/react-native/src/v2';
test('v2 native choices retain mixed, disabled and selected semantics', () => {
  const changed = jest.fn();
  const { getByRole, getByLabelText } = render(
    <MagnoliaProvider density="compact">
      <Checkbox
        label="Projects"
        checked
        indeterminate
        onCheckedChange={changed}
      />
      <Switch
        label="Notifications"
        checked
        disabled
        onCheckedChange={changed}
      />
      <Radio label="Weekly" value="week" checked onValueChange={changed} />
      <Chip label="Active" selected onSelectedChange={changed} />
      <IconButton label="More" />
      <Kbd keyName="K" modifier />
    </MagnoliaProvider>,
  );
  expect(
    getByRole('checkbox', { name: 'Projects' }).props.accessibilityState
      .checked,
  ).toBe('mixed');
  fireEvent.press(getByRole('checkbox', { name: 'Projects' }));
  expect(changed).toHaveBeenLastCalledWith(false);
  fireEvent.press(getByRole('switch', { name: 'Notifications' }));
  expect(changed).toHaveBeenCalledTimes(1);
  expect(
    getByRole('radio', { name: 'Weekly' }).props.accessibilityState.checked,
  ).toBe(true);
  expect(
    getByRole('button', { name: 'Active' }).props.accessibilityState.selected,
  ).toBe(true);
  expect(getByLabelText('Command K')).toBeTruthy();
});
test('v2 native search clears through its controlled callback and select skips disabled choices', () => {
  const clear = jest.fn(),
    choose = jest.fn();
  const { getByRole, getByLabelText, getByText } = render(
    <MagnoliaProvider>
      <SearchField
        label="Search projects"
        value="Northwind"
        onChangeText={clear}
      />
      <TextArea label="Notes" value={'x'.repeat(281)} characterLimit={280} />
      <Select
        label="Interval"
        value="week"
        items={[
          { value: 'week', label: 'Weekly' },
          { value: 'disabled', label: 'Unavailable', disabled: true },
          { value: 'month', label: 'Monthly' },
        ]}
        onValueChange={choose}
      />
    </MagnoliaProvider>,
  );
  fireEvent.press(getByRole('button', { name: 'Clear Search projects' }));
  expect(clear).toHaveBeenCalledWith('');
  expect(getByLabelText('Notes').props.accessibilityHint).toContain(
    'Up to 280',
  );
  fireEvent.press(getByRole('combobox', { name: 'Interval' }));
  fireEvent.press(getByRole('radio', { name: 'Unavailable' }));
  expect(choose).not.toHaveBeenCalled();
  fireEvent.press(getByRole('radio', { name: 'Monthly' }));
  expect(choose).toHaveBeenCalledWith('month');
  expect(getByText('Weekly')).toBeTruthy();
});
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
