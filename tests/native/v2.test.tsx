import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
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
  ProgressBar,
  ProgressRing,
  Avatar,
  ListItem,
  Banner,
  NumberField,
  Stepper,
  SelectableCard,
  Link,
  FileField,
  Attachment,
  Steps,
  Calendar,
  DateField,
  TimeField,
  Combobox,
  MultiSelect,
  Slider,
} from '../../packages/react-native/src/v2';
test('v2 native Slider exposes stepped accessibility adjustments and disabled state', () => {
  const change = jest.fn();
  const { getByRole } = render(
    <MagnoliaProvider>
      <Slider label="Confidence" value={70} step={5} onValueChange={change} />
      <Slider label="Locked" value={100} disabled onValueChange={change} />
    </MagnoliaProvider>,
  );
  const slider = getByRole('adjustable', { name: 'Confidence' });
  expect(slider.props.accessibilityValue.now).toBe(70);
  fireEvent(slider, 'accessibilityAction', {
    nativeEvent: { actionName: 'increment' },
  });
  expect(change).toHaveBeenLastCalledWith(75);
  fireEvent(slider, 'accessibilityAction', {
    nativeEvent: { actionName: 'decrement' },
  });
  expect(change).toHaveBeenLastCalledWith(65);
  fireEvent(
    getByRole('adjustable', { name: 'Locked' }),
    'accessibilityAction',
    { nativeEvent: { actionName: 'decrement' } },
  );
  expect(change).toHaveBeenCalledTimes(2);
});
test('v2 native searchable choices announce loading and suppress choices during a request', async () => {
  const choose = jest.fn();
  const { getByRole, getByText, queryByRole } = render(
    <MagnoliaProvider>
      <Combobox
        label="Owner"
        value={null}
        items={[{ value: 'priya', label: 'Priya Nair' }]}
        onValueChange={choose}
        loading
      />
    </MagnoliaProvider>,
  );
  fireEvent.press(getByRole('combobox', { name: 'Owner' }));
  await waitFor(() => expect(getByText('Searching…')).toBeTruthy());
  expect(queryByRole('radio')).toBeNull();
  expect(choose).not.toHaveBeenCalled();
});
test('v2 native searchable choices filter options, skip disabled values and preserve token removal', () => {
  const choose = jest.fn(),
    multi = jest.fn();
  const items = [
    { value: 'priya', label: 'Priya Nair' },
    { value: 'pritam', label: 'Pritam Rao' },
    { value: 'disabled', label: 'Unavailable', disabled: true },
  ];
  const { getByRole, getByLabelText, queryByRole } = render(
    <MagnoliaProvider>
      <Combobox
        label="Owner"
        items={items}
        value="priya"
        onValueChange={choose}
      />
      <MultiSelect
        label="Tags"
        items={items}
        value={['priya']}
        onValueChange={multi}
      />
    </MagnoliaProvider>,
  );
  fireEvent.press(getByRole('combobox', { name: 'Owner' }));
  fireEvent.changeText(getByLabelText('Search Owner'), 'Prit');
  expect(queryByRole('radio', { name: 'Priya Nair' })).toBeNull();
  fireEvent.press(getByRole('radio', { name: 'Pritam Rao' }));
  expect(choose).toHaveBeenCalledWith('pritam');
  fireEvent.press(getByRole('button', { name: 'Remove Priya Nair' }));
  expect(multi).toHaveBeenCalledWith([]);
  fireEvent.press(getByRole('combobox', { name: 'Tags' }));
  fireEvent.press(getByRole('checkbox', { name: 'Unavailable' }));
  expect(multi).toHaveBeenCalledTimes(1);
  fireEvent.press(getByRole('checkbox', { name: 'Pritam Rao' }));
  expect(multi).toHaveBeenLastCalledWith(['priya', 'pritam']);
});
test('v2 native temporal controls validate typed dates and expose calendar/time choices', () => {
  const dateChange = jest.fn(),
    timeChange = jest.fn();
  const { getByLabelText, getByRole, getByText } = render(
    <MagnoliaProvider>
      <DateField
        label="Due date"
        value="2026-10-14"
        onValueChange={dateChange}
      />
      <TimeField label="Start time" value="14:30" onValueChange={timeChange} />
    </MagnoliaProvider>,
  );
  fireEvent.changeText(getByLabelText('Due date'), '2026-02-30');
  fireEvent(getByLabelText('Due date'), 'blur', {});
  expect(getByText('Error: Enter a valid date.')).toBeTruthy();
  expect(dateChange).not.toHaveBeenCalled();
  fireEvent.press(getByRole('button', { name: 'Choose Due date' }));
  fireEvent.press(getByRole('button', { name: 'Thu, Oct 15, 2026' }));
  expect(dateChange).toHaveBeenCalledWith('2026-10-15');
  fireEvent.press(getByRole('button', { name: 'Choose Start time' }));
  fireEvent.press(getByRole('radio', { name: '2:45 PM' }));
  expect(timeChange).toHaveBeenCalledWith('14:45');
});
test('v2 native calendar disables constrained days and starts a new range after completion', () => {
  const change = jest.fn();
  const { getByRole } = render(
    <MagnoliaProvider>
      <Calendar
        value="2026-10-14"
        endValue="2026-10-17"
        range
        min="2026-10-01"
        max="2026-10-31"
        today="2026-10-09"
        onValueChange={change}
      />
    </MagnoliaProvider>,
  );
  expect(
    getByRole('button', { name: 'Mon, Sep 28, 2026' }).props.accessibilityState
      .disabled,
  ).toBe(true);
  fireEvent.press(getByRole('button', { name: 'Tue, Oct 20, 2026' }));
  expect(change).toHaveBeenCalledWith('2026-10-20', undefined);
});
test('v2 native file controls delegate picking, expose progress and keep retry/remove independent', () => {
  const browse = jest.fn(),
    retry = jest.fn(),
    remove = jest.fn();
  const { getByRole, getByLabelText } = render(
    <MagnoliaProvider>
      <FileField label="Photos" onBrowse={browse} />
      <Attachment
        name="photo.jpg"
        state="failed"
        onRetry={retry}
        onRemove={remove}
      />
      <Attachment
        name="upload.jpg"
        state="uploading"
        progress={77}
        onRemove={remove}
      />
      <Steps items={['Details', 'Counts', 'Review']} current={1} />
    </MagnoliaProvider>,
  );
  fireEvent.press(getByRole('button', { name: 'Photos' }));
  expect(browse).toHaveBeenCalledTimes(1);
  fireEvent.press(getByRole('button', { name: 'Retry' }));
  expect(retry).toHaveBeenCalledTimes(1);
  expect(remove).not.toHaveBeenCalled();
  fireEvent.press(getByRole('button', { name: 'Remove photo.jpg' }));
  expect(remove).toHaveBeenCalledTimes(1);
  expect(
    getByRole('progressbar', { name: 'Uploading upload.jpg' }).props
      .accessibilityValue.now,
  ).toBe(77);
  expect(getByLabelText('Counts: current')).toBeTruthy();
});
test('v2 native numeric controls preserve raw decimals and clamp stepper activation', () => {
  const change = jest.fn();
  const { getByRole, getByLabelText } = render(
    <MagnoliaProvider>
      <NumberField
        label="Cycle time"
        unit="seconds"
        value="4.2"
        onChangeText={change}
      />
      <Stepper label="Items" value={0} min={0} max={5} onValueChange={change} />
    </MagnoliaProvider>,
  );
  fireEvent.changeText(getByLabelText('Cycle time'), '4.');
  expect(change).toHaveBeenCalledWith('4.');
  expect(getByLabelText('Cycle time').props.keyboardType).toBe('decimal-pad');
  change.mockClear();
  fireEvent.press(getByRole('button', { name: 'Decrease Items' }));
  expect(change).not.toHaveBeenCalled();
  fireEvent.press(getByRole('button', { name: 'Increase Items' }));
  expect(change).toHaveBeenCalledWith(1);
});
test('v2 native selectable cards expose radio state and disabled links block navigation', () => {
  const choose = jest.fn(),
    navigate = jest.fn();
  const { getByRole } = render(
    <MagnoliaProvider density="compact">
      <SelectableCard
        title="Phone"
        value="phone"
        selected
        onValueChange={choose}
      />
      <SelectableCard
        title="Archive"
        value="archive"
        selected={false}
        disabled
        onValueChange={choose}
      />
      <Link
        label="Unavailable"
        href="https://example.com"
        disabled
        onPress={navigate}
      />
    </MagnoliaProvider>,
  );
  expect(
    getByRole('radio', { name: 'Phone' }).props.accessibilityState.checked,
  ).toBe(true);
  fireEvent.press(getByRole('radio', { name: 'Archive' }));
  expect(choose).not.toHaveBeenCalled();
  fireEvent.press(getByRole('radio', { name: 'Phone' }));
  expect(choose).toHaveBeenCalledWith('phone');
  fireEvent.press(getByRole('link', { name: 'Unavailable' }));
  expect(navigate).not.toHaveBeenCalled();
});
test('v2 native display clamps progress, preserves missing data and avatar fallback', () => {
  const { getByRole, getByText } = render(
    <MagnoliaProvider>
      <ProgressBar label="Complete" value={120} />
      <ProgressRing label="Pending" value={NaN} />
      <ProgressRing label="Not started" value={-1} />
      <Avatar name="Maya Chen" />
    </MagnoliaProvider>,
  );
  expect(
    getByRole('progressbar', { name: 'Complete' }).props.accessibilityValue.now,
  ).toBe(100);
  expect(
    getByRole('progressbar', { name: 'Pending' }).props.accessibilityState.busy,
  ).toBe(true);
  expect(
    getByRole('progressbar', { name: 'Not started' }).props.accessibilityValue
      .now,
  ).toBe(0);
  expect(getByText('MC')).toBeTruthy();
});
test('v2 native display retains list selection, disabled activation and dismissible banners', () => {
  const press = jest.fn(),
    dismiss = jest.fn();
  const { getByRole, queryByText } = render(
    <MagnoliaProvider>
      <ListItem title="Northwind" unread selected onPress={press} />
      <ListItem title="Archived" disabled onPress={press} />
      <Banner title="Review tasks" dismissible onDismiss={dismiss} />
    </MagnoliaProvider>,
  );
  expect(
    getByRole('button', { name: 'Unread: Northwind' }).props.accessibilityState
      .selected,
  ).toBe(true);
  fireEvent.press(getByRole('button', { name: 'Archived' }));
  expect(press).not.toHaveBeenCalled();
  fireEvent.press(getByRole('button', { name: 'Unread: Northwind' }));
  expect(press).toHaveBeenCalledTimes(1);
  fireEvent.press(getByRole('button', { name: 'Dismiss Review tasks' }));
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(queryByText('Review tasks')).toBeNull();
});
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
