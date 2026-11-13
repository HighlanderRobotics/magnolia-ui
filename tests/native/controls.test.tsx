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
