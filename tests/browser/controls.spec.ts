import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});
test('dialog traps focus, closes with Escape, restores trigger and handles nesting', async ({
  page,
}) => {
  const trigger = page.getByRole('button', {
    name: 'Open dialog',
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole('dialog', {
    name: 'Confirm match',
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    dialog.getByRole('button', { name: 'Open nested dialog', exact: true }),
  ).toBeFocused();
  await dialog
    .getByRole('button', { name: 'Open nested dialog', exact: true })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Nested confirmation', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Open nested dialog', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test('canClose blocks Escape and backdrop but inside actions can close', async ({
  page,
}) => {
  await page.getByRole('switch', { name: 'Allow dialog dismissal' }).uncheck();
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Confirm match',
    exact: true,
  });
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole('button', { name: 'Close dialog', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
});
test('backdrop dismisses and internal content does not', async ({ page }) => {
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Confirm match',
    exact: true,
  });
  await dialog.getByRole('textbox').click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).not.toBeVisible();
});
test('menu supports arrows, skips disabled items, typeahead, Escape and selection', async ({
  page,
}) => {
  const trigger = page.getByRole('button', {
    name: 'Match actions',
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('menuitem', { name: 'Open match' }),
  ).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('menuitem', { name: 'Copy match' }),
  ).toBeFocused();
  await page.keyboard.press('Home');
  await page.keyboard.press('c');
  await expect(
    page.getByRole('menuitem', { name: 'Copy match' }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('menu')).not.toBeVisible();
  await trigger.click();
  await page.getByRole('menuitem', { name: 'Copy match' }).click();
  await expect(page.getByText('Match copied')).toBeVisible();
  await expect(trigger).toBeFocused();
});
test('menu closes on outside pointer and tab', async ({ page }) => {
  const trigger = page.getByRole('button', {
    name: 'Match actions',
    exact: true,
  });
  await trigger.click();
  await trigger.click();
  await expect(page.getByRole('menu')).not.toBeVisible();
  await trigger.click();
  await page.getByRole('heading', { name: 'Dialogs & menus' }).click();
  await expect(page.getByRole('menu')).not.toBeVisible();
  await trigger.click();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('menu')).not.toBeVisible();
});
test('switch supports Space, disabled exclusion and form submission', async ({
  page,
}) => {
  const toggle = page.getByRole('switch', { name: 'Offline scouting' });
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toBeChecked();
  await expect(
    page.getByRole('switch', { name: 'Disabled switch' }),
  ).toBeDisabled();
  expect(
    await toggle.evaluate((el: HTMLInputElement) =>
      new FormData(el.form!).get('offline'),
    ),
  ).toBe('on');
  await expect(
    page.getByRole('option', { name: 'Unavailable' }).first(),
  ).toBeDisabled();
});
test('light/dark, compact/comfortable and reduced motion pass axe', async ({
  page,
}) => {
  for (const mode of ['light', 'dark']) {
    if (mode === 'dark')
      await page.getByRole('button', { name: 'Use dark theme' }).click();
    for (const density of ['comfortable', 'compact']) {
      if (density === 'compact')
        await page.getByRole('button', { name: 'Use compact density' }).click();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    }
    await page.getByRole('button', { name: 'Use comfortable density' }).click();
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page
      .getByRole('button', { name: 'Primary action' })
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('0s');
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test('gallery fits viewport and captures representative control states', async ({
  page,
}, info) => {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath('light-comfortable.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Use dark theme' }).click();
  await page.getByRole('button', { name: 'Use compact density' }).click();
  await page.screenshot({
    path: info.outputPath('dark-compact.png'),
    fullPage: true,
  });
});

test('server HTML hydrates without mismatch and retains form/error bindings', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (message) => {
    if (message.type() === 'warn' || message.type() === 'error')
      errors.push(message.text());
  });
  const response = await page.goto('/ssr');
  expect(await response!.text()).toContain('data-ssr="true"');
  await page
    .getByRole('textbox', { name: 'Team name', exact: true })
    .fill('Highlanders');
  await page.getByRole('switch', { name: 'Offline scouting' }).check();
  await page.getByRole('button', { name: 'Use dark theme' }).click();
  await expect(
    page.getByRole('button', { name: 'Use light theme' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(errors).toEqual([]);
});

test('checkbox and shared radio bindings preserve native form behavior', async ({
  page,
}) => {
  await page.getByRole('checkbox', { name: 'I am ready' }).check();
  const red = page.getByRole('radio', { name: 'Red alliance' }),
    blue = page.getByRole('radio', { name: 'Blue alliance' });
  await red.check();
  await expect(red).toBeChecked();
  await blue.check();
  await expect(red).not.toBeChecked();
  await expect(blue).toBeChecked();
  await page.getByRole('button', { name: 'Use dark theme' }).click();
  await expect(blue).toBeChecked();
  expect(
    await blue.evaluate((el: HTMLInputElement) =>
      new FormData(el.form!).get('alliance'),
    ),
  ).toBe('blue');
});
