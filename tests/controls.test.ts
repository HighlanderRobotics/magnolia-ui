import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Button from '../packages/svelte/src/lib/Button.svelte';
import MenuButton from '../packages/svelte/src/lib/MenuButton.svelte';
import Switch from '../packages/svelte/src/lib/Switch.svelte';
import TextField from '../packages/svelte/src/lib/TextField.svelte';
import Select from '../packages/svelte/src/lib/Select.svelte';
const children = createRawSnippet(() => ({
  render: () => '<span>Continue</span>',
}));
describe.each([
  ['Button', Button],
  ['MenuButton', MenuButton],
] as const)('%s activation', (_, Control) => {
  it('forwards the original cancellable MouseEvent', async () => {
    const click = vi.fn((event: MouseEvent) => event.preventDefault());
    const { getByRole } = render(Control, {
      props: { children, onclick: click },
    });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    getByRole(Control === MenuButton ? 'menuitem' : 'button').dispatchEvent(
      event,
    );
    expect(click.mock.calls[0][0] === event).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });
  it('blocks disabled anchor activation', async () => {
    const click = vi.fn();
    const { getByText } = render(Control, {
      props: {
        children,
        onclick: click,
        element: 'a',
        href: '/wrong',
        disabled: true,
      },
    });
    await fireEvent.click(getByText('Continue'));
    expect(click).not.toHaveBeenCalled();
    expect(getByText('Continue').closest('a')).not.toHaveAttribute('href');
  });
});
it('switch is a native successful form control and supports disabled state', async () => {
  const { getByRole, rerender } = render(Switch, {
    props: { label: 'Offline', name: 'offline' },
  });
  const input = getByRole('switch') as HTMLInputElement;
  expect(input.type).toBe('checkbox');
  await fireEvent.click(input);
  expect(input.checked).toBe(true);
  const form = document.createElement('form');
  form.append(input);
  expect(new FormData(form).get('offline')).toBe('on');
  await rerender({ disabled: true });
  expect(input.disabled).toBe(true);
});
it('field errors reference visible stable IDs and preserve descriptions', () => {
  const { getByRole, getByText } = render(TextField, {
    props: {
      label: 'Team',
      errorMessage: 'Invalid team',
      'aria-describedby': 'help',
    },
  });
  const input = getByRole('textbox');
  const error = getByText('Invalid team');
  expect(input).toHaveAttribute('aria-errormessage', error.id);
  expect(input).toHaveAttribute('aria-describedby', `help ${error.id}`);
  expect(input).toHaveAccessibleName('Team');
});
it('select disables unavailable options and associates errors', () => {
  const { getByRole, getByText } = render(Select, {
    props: {
      label: 'Match',
      required: true,
      placeholder: 'Choose',
      errorMessage: 'Required',
      items: [{ label: 'Unavailable', value: 'x', disabled: true }],
    },
  });
  expect(getByRole('option', { name: 'Unavailable' })).toBeDisabled();
  expect(getByRole('combobox')).toHaveAttribute(
    'aria-errormessage',
    getByText('Required').id,
  );
  expect(getByRole('combobox')).toBeRequired();
});

import Pill from '../packages/svelte/src/lib/Pill.svelte';
it('Pill supports native toggling, cancellation and disabled state', async () => {
  const click = vi.fn((e: MouseEvent) => e.preventDefault());
  const { getByRole, rerender } = render(Pill, {
    props: { children, onclick: click },
  });
  const pill = getByRole('button');
  await fireEvent.click(pill);
  expect(pill).toHaveAttribute('aria-pressed', 'false');
  await rerender({ onclick: undefined });
  await fireEvent.click(pill);
  expect(pill).toHaveAttribute('aria-pressed', 'true');
  await rerender({ disabled: true });
  expect(pill).toBeDisabled();
});

import MultiSelect from '../packages/svelte/src/lib/MultiSelect.svelte';
import Combobox from '../packages/svelte/src/lib/Combobox.svelte';
it('multi-select associates errors and serializes multiple enabled values', async () => {
  const { getByRole, getByText } = render(MultiSelect, {
    props: {
      label: 'Roles',
      name: 'roles',
      value: ['a', 'b'],
      errorMessage: 'Review your roles',
      items: [
        { value: 'a', label: 'Scout' },
        { value: 'b', label: 'Analyst' },
        { value: 'x', label: 'Unavailable', disabled: true },
      ],
    },
  });
  const select = getByRole('listbox') as HTMLSelectElement;
  expect(select).toHaveAttribute(
    'aria-errormessage',
    getByText('Review your roles').id,
  );
  expect(getByRole('option', { name: 'Unavailable' })).toBeDisabled();
  const form = document.createElement('form');
  form.append(select);
  expect(new FormData(form).getAll('roles')).toEqual(['a', 'b']);
});
it('combobox validates selected IDs rather than accepting arbitrary query text', async () => {
  const { getByRole } = render(Combobox, {
    props: {
      label: 'Team',
      required: true,
      items: [{ value: '8033', label: 'Highlander' }],
    },
  });
  const input = getByRole('combobox') as HTMLInputElement;
  await fireEvent.input(input, { target: { value: 'Unknown team' } });
  expect(input.checkValidity()).toBe(false);
  expect(input.validationMessage).toBe('Choose an available option.');
});
