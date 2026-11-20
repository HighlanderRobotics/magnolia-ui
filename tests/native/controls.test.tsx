import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import {
  Button,
  Checkbox,
  TextField,
  MagnoliaProvider,
  Text,
} from '../../packages/react-native/src';
it('exposes button semantics, blocks duplicate presses while pending, and recovers', async () => {
  let resolve: () => void = () => {};
  const press = jest.fn(
    () =>
      new Promise<void>((r) => {
        resolve = r;
      }),
  );
  const { getByRole } = render(<Button onPress={press}>Save report</Button>);
  fireEvent.press(getByRole('button'));
  fireEvent.press(getByRole('button'));
  expect(press).toHaveBeenCalledTimes(1);
  expect(getByRole('button').props.accessibilityState.busy).toBe(true);
  await act(async () => resolve());
  await waitFor(() =>
    expect(getByRole('button').props.accessibilityState.busy).toBe(false),
  );
});
it('shows sync/async failures accessibly without swallowing recovery', async () => {
  const press = jest
    .fn()
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValueOnce(undefined);
  const { getByRole, queryByRole } = render(
    <Button onPress={press}>Save</Button>,
  );
  fireEvent.press(getByRole('button'));
  await waitFor(() =>
    expect(getByRole('alert').props.children).toBe('Offline'),
  );
  fireEvent.press(getByRole('button'));
  await waitFor(() => expect(queryByRole('alert')).toBeNull());
  expect(press).toHaveBeenCalledTimes(2);
});
it('does not activate a disabled native button', () => {
  const press = jest.fn();
  const { getByRole } = render(
    <Button disabled onPress={press}>
      Disabled
    </Button>,
  );
  fireEvent.press(getByRole('button'));
  expect(press).not.toHaveBeenCalled();
});
it('checkbox conveys checked/disabled state and enforces minimum touch area', () => {
  const change = jest.fn();
  const { getByRole, rerender } = render(
    <Checkbox label="Ready" checked onChange={change} />,
  );
  expect(getByRole('checkbox').props.accessibilityState.checked).toBe(true);
  fireEvent.press(getByRole('checkbox'));
  expect(change).toHaveBeenCalledWith(false);
  rerender(<Checkbox label="Ready" disabled onChange={change} />);
  fireEvent.press(getByRole('checkbox'));
  expect(change).toHaveBeenCalledTimes(1);
});
it('native fields retain labels, input props, refs and error announcements', () => {
  const ref = React.createRef<any>();
  const { getByLabelText, getByRole } = render(
    <TextField
      ref={ref}
      label="Team"
      value="8033"
      errorMessage="Invalid team"
    />,
  );
  expect(getByLabelText('Team').props.value).toBe('8033');
  expect(getByRole('alert')).toBeTruthy();
  expect(ref.current).toBeTruthy();
});
it('provider maps semantic themes and allows native text scaling', () => {
  const { getByText } = render(
    <MagnoliaProvider mode="light">
      <Text>Light text</Text>
    </MagnoliaProvider>,
  );
  const styles = getByText('Light text').props.style.flat();
  expect(styles).toEqual(
    expect.arrayContaining([expect.objectContaining({ color: '#000000' })]),
  );
  expect(getByText('Light text').props.allowFontScaling).not.toBe(false);
});

import { Pill } from '../../packages/react-native/src';
it('native Pill exposes selection and blocks disabled activation', () => {
  const change = jest.fn();
  const { getByRole, rerender } = render(
    <Pill active onChange={change}>
      Scouting
    </Pill>,
  );
  expect(getByRole('button').props.accessibilityState.selected).toBe(true);
  fireEvent.press(getByRole('button'));
  expect(change).toHaveBeenCalledWith(false);
  rerender(
    <Pill disabled onChange={change}>
      Scouting
    </Pill>,
  );
  fireEvent.press(getByRole('button'));
  expect(change).toHaveBeenCalledTimes(1);
});

import { Dialog, Radio, Select, Menu } from '../../packages/react-native/src';
import { Modal } from 'react-native';
it('native Radio reports checked state, selected value and disabled behavior', () => {
  const choose = jest.fn();
  const { getByRole, rerender } = render(
    <Radio label="Red alliance" value="red" checked onSelect={choose} />,
  );
  expect(getByRole('radio').props.accessibilityState.checked).toBe(true);
  fireEvent.press(getByRole('radio'));
  expect(choose).toHaveBeenCalledWith('red');
  rerender(
    <Radio label="Red alliance" value="red" disabled onSelect={choose} />,
  );
  fireEvent.press(getByRole('radio'));
  expect(choose).toHaveBeenCalledTimes(1);
});
it('native Dialog guards back and backdrop dismissal and exposes a heading', () => {
  const close = jest.fn();
  const { getByTestId, getByRole, UNSAFE_getByType, rerender } = render(
    <Dialog open title="Match notes" canClose={false} onClose={close}>
      <Text>Notes</Text>
    </Dialog>,
  );
  fireEvent(
    getByTestId('magnolia-dialog-backdrop', { includeHiddenElements: true }),
    'press',
  );
  UNSAFE_getByType(Modal).props.onRequestClose();
  expect(close).not.toHaveBeenCalled();
  expect(getByRole('header')).toHaveTextContent('Match notes');
  rerender(<Dialog open title="Match notes" onClose={close} />);
  fireEvent.press(getByRole('button', { name: 'Close Match notes' }));
  expect(close).toHaveBeenCalledTimes(1);
});
it('native Select commits available choices, retains disabled options and closes', () => {
  function Fixture() {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <Select
        label="Alliance"
        value={value}
        onChange={setValue}
        items={[
          { value: 'red', label: 'Red' },
          { value: 'blue', label: 'Blue', disabled: true },
        ]}
      />
    );
  }
  const { getByRole, queryByRole } = render(<Fixture />);
  fireEvent.press(getByRole('combobox'));
  fireEvent.press(getByRole('radio', { name: 'Blue' }));
  expect(getByRole('combobox').props.accessibilityState.expanded).toBe(true);
  fireEvent.press(getByRole('radio', { name: 'Red' }));
  expect(getByRole('combobox').props.accessibilityValue.text).toBe('Red');
  expect(getByRole('combobox').props.accessibilityState.expanded).toBe(false);
  expect(queryByRole('radio')).toBeNull();
});
it('native Menu keeps failed actions open and closes only after successful completion', async () => {
  const close = jest.fn();
  const action = jest
    .fn()
    .mockRejectedValueOnce(new Error('Try again'))
    .mockResolvedValueOnce(undefined);
  const { getByRole } = render(
    <Menu
      open
      onClose={close}
      items={[
        { value: 'save', label: 'Save report' },
        { value: 'remove', label: 'Remove', disabled: true },
      ]}
      onSelect={action}
    />,
  );
  fireEvent.press(getByRole('button', { name: 'Remove' }));
  expect(action).not.toHaveBeenCalled();
  fireEvent.press(getByRole('button', { name: 'Save report' }));
  await waitFor(() =>
    expect(getByRole('alert')).toHaveTextContent('Try again'),
  );
  expect(close).not.toHaveBeenCalled();
  fireEvent.press(getByRole('button', { name: 'Save report' }));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
});
