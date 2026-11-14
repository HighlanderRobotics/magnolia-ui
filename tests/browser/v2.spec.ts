import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('v2 numeric and card choices retain bounds, keyboard and reset semantics', async ({
  page,
}) => {
  await page.goto('/v2');
  const controls = page.getByTestId('numeric-family');
  const input = controls.getByRole('spinbutton', {
    name: 'Cycle time',
    exact: true,
  });
  await input.fill('4.25');
  expect(
    await input.evaluate((el: HTMLInputElement) => el.validity.stepMismatch),
  ).toBe(true);
  await input.fill('4.3');
  expect(
    await input.evaluate((el: HTMLInputElement) => el.validity.valid),
  ).toBe(true);
  const decrease = controls.getByRole('button', {
    name: 'Decrease Items counted',
    exact: true,
  });
  for (let i = 0; i < 3; i++) await decrease.click();
  await expect(decrease).toBeDisabled();
  await expect(controls.locator('output')).toHaveText('0');
  const increase = controls.getByRole('button', {
    name: 'Increase Items counted',
    exact: true,
  });
  for (let i = 0; i < 5; i++) await increase.click();
  await expect(increase).toBeDisabled();
  const phone = controls.getByRole('radio', {
    name: 'This phone',
    exact: true,
  });
  await phone.focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    controls.getByRole('radio', { name: 'Cloud version', exact: true }),
  ).toBeChecked();
  await expect(
    controls.getByRole('radio', { name: 'Archived version', exact: true }),
  ).toBeDisabled();
  await expect(
    controls.getByRole('link', { name: 'Unavailable link', exact: true }),
  ).not.toHaveAttribute('href');
  await expect(
    controls.getByRole('link', { name: /Open design source/ }),
  ).toHaveAttribute('rel', 'noopener noreferrer');
  await controls
    .getByRole('button', { name: 'Reset numbers and choices', exact: true })
    .click();
  await expect(phone).toBeChecked();
  await expect(input).toHaveValue('4.2');
  await expect(controls.locator('output')).toHaveText('3');
});
test('v2 display controls expose progress, selection and dismissal without losing geometry', async ({
  page,
}) => {
  await page.goto('/v2');
  const display = page.getByTestId('display-family');
  const empty = display.getByRole('progressbar', {
    name: '0 percent complete',
    exact: true,
  });
  await expect(empty).toHaveAttribute('aria-valuenow', '0');
  await expect(empty.locator('circle')).toHaveCount(0);
  await expect(
    display.getByRole('progressbar', {
      name: '100 percent complete',
      exact: true,
    }),
  ).toHaveAttribute('aria-valuenow', '100');
  await expect(
    display.getByRole('progressbar', {
      name: 'Pending completion',
      exact: true,
    }),
  ).not.toHaveAttribute('aria-valuenow');
  expect(
    (await display
      .getByRole('progressbar', { name: 'Overall completion', exact: true })
      .boundingBox())!.width,
  ).toBe(96);
  expect(
    (await display.locator('.mg2-avatar-group').boundingBox())!.width,
  ).toBe(110);
  const northwind = display.getByRole('button', { name: /Unread: Northwind/ });
  await expect(northwind).toHaveAttribute('aria-pressed', 'true');
  await display
    .getByRole('button', { name: 'Review tasks', exact: true })
    .click();
  await expect(northwind).toHaveAttribute('aria-pressed', 'false');
  await expect(
    display.getByRole('button', { name: /Larkspur/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    display.getByRole('button', { name: /Archived workspace/ }),
  ).toBeDisabled();
  await display
    .getByRole('button', { name: 'Dismiss Review pending tasks', exact: true })
    .click();
  await expect(
    display.getByText('Three tasks need an owner', { exact: false }),
  ).toHaveCount(0);
  await display
    .getByRole('button', { name: 'Restore banner', exact: true })
    .click();
  await expect(
    display.getByText('Three tasks need an owner', { exact: false }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await display
      .locator('.mg2-loading-spinner .mg2-glyph')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
});
test('v2 choices, search, select and textarea work with keyboards and native forms', async ({
  page,
}) => {
  await page.goto('/v2');
  const checkbox = page.getByRole('checkbox', {
    name: 'Include archived',
    exact: true,
  });
  await expect(checkbox).toBeChecked();
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(checkbox).not.toBeChecked();
  const mixed = page.getByRole('checkbox', {
    name: 'Select all projects',
    exact: true,
  });
  await expect(mixed).toHaveJSProperty('indeterminate', true);
  await mixed.click();
  await expect(mixed).toHaveJSProperty('indeterminate', false);
  const toggle = page.getByRole('switch', {
    name: 'Notifications',
    exact: true,
  });
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).not.toBeChecked();
  await page
    .getByRole('radio', { name: 'Daily frequency', exact: true })
    .check();
  await expect(
    page.getByRole('radio', { name: 'Weekly frequency', exact: true }),
  ).not.toBeChecked();
  const search = page.getByRole('searchbox', {
    name: 'Search projects',
    exact: true,
  });
  await search.fill('Northwind');
  await page
    .getByRole('button', { name: 'Clear Search projects', exact: true })
    .click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  const select = page.getByRole('combobox', { name: /Report interval/ });
  await select.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(select).toContainText('Monthly');
  const notes = page.getByRole('textbox', {
    name: 'Report notes',
    exact: true,
  });
  await notes.fill('x'.repeat(281));
  await page.getByRole('button', { name: 'Save report', exact: true }).click();
  await expect(page.getByTestId('report-saved')).toHaveCount(0);
  await expect(notes).toHaveAttribute('aria-invalid', 'true');
  await notes.fill('Useful report');
  await page.getByRole('button', { name: 'Save report', exact: true }).click();
  await expect(page.getByTestId('report-saved')).toContainText(
    'Saved month report: Useful report',
  );
  await page.getByRole('button', { name: 'Reset report', exact: true }).click();
  await expect(select).toContainText('Weekly');
  await expect(checkbox).toBeChecked();
  await expect(toggle).toBeChecked();
  await expect(
    page.getByRole('radio', { name: 'Weekly frequency', exact: true }),
  ).toBeChecked();
});
test('v2 Figma controls retain geometry, fonts and accessibility in every theme and density', async ({
  page,
}, info) => {
  const failed: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400 && /\.(svg|woff2)/.test(r.url()))
      failed.push(r.url());
  });
  await page.goto('/v2');
  await page.evaluate(() => document.fonts.ready);
  for (const theme of ['dark', 'light'])
    for (const density of ['comfortable', 'compact']) {
      await page.getByLabel('Theme', { exact: true }).selectOption(theme);
      await page.getByLabel('Density', { exact: true }).selectOption(density);
      const root = page.locator('.mg-v2');
      await expect(root).toHaveAttribute('data-density', density);
      const button = page.getByTestId('buttons').locator('button').first();
      expect((await button.boundingBox())!.height).toBe(
        density === 'comfortable' ? 44 : 32,
      );
      expect(
        (await page.getByLabel('Project name', { exact: true }).boundingBox())!
          .height,
      ).toBe(density === 'comfortable' ? 44 : 32);
      expect(
        await root.evaluate((el) => getComputedStyle(el).fontFamily),
      ).toContain('Roboto');
      const choiceBox = (await page
        .locator('.mg2-choice-box')
        .first()
        .boundingBox())!;
      expect([choiceBox.width, choiceBox.height]).toEqual(
        density === 'comfortable' ? [20, 20] : [16, 16],
      );
      const track = (await page.locator('.mg2-switch-control').boundingBox())!;
      expect([track.width, track.height]).toEqual(
        density === 'comfortable' ? [44, 24] : [32, 20],
      );
      const thumb = (await page
        .locator('.mg2-switch-thumb .mg2-glyph')
        .boundingBox())!;
      expect([thumb.width, thumb.height]).toEqual(
        density === 'comfortable' ? [20, 20] : [16, 16],
      );
      const iconButton = (await page
        .getByRole('button', { name: 'More options', exact: true })
        .boundingBox())!;
      expect([iconButton.width, iconButton.height]).toEqual(
        density === 'comfortable' ? [44, 44] : [32, 32],
      );
      const stepGlyph = (await page
        .locator('[data-glyph="step-plus"]')
        .boundingBox())!;
      expect([stepGlyph.width, stepGlyph.height]).toEqual([16, 16]);
      const chip = (await page
        .getByRole('button', { name: 'Active projects', exact: true })
        .locator('.mg2-glyph')
        .boundingBox())!;
      expect([chip.width, chip.height]).toEqual(
        density === 'comfortable' ? [14, 14] : [12, 12],
      );
      expect(
        (await page
          .getByRole('searchbox', { name: 'Search projects' })
          .locator('..')
          .boundingBox())!.height,
      ).toBe(density === 'comfortable' ? 44 : 32);
      const spinner = page.locator('.mg2-spinner').first();
      expect(
        await spinner.evaluate((el) => getComputedStyle(el).maskImage),
      ).not.toBe('none');
      expect((await spinner.boundingBox())!.width).toBeGreaterThan(19);
      expect((await spinner.boundingBox())!.width).toBeLessThan(29);
      expect(
        await page
          .locator('.mg2-error-icon')
          .evaluate((el) => getComputedStyle(el).maskImage),
      ).not.toBe('none');
      expect((await page.locator('.mg2-error-icon').boundingBox())!.width).toBe(
        12,
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.screenshot({
        path: info.outputPath(`v2-${theme}-${density}.png`),
        fullPage: true,
      });
    }
  expect(failed).toEqual([]);
});
test('v2 tabs, segmented controls, inputs and loading keep their interaction contracts', async ({
  page,
}) => {
  await page.goto('/v2');
  const overview = page.getByRole('tab', { name: 'Overview', exact: true });
  await overview.focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: 'Activity', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('End');
  await expect(
    page.getByRole('tab', { name: 'Notes', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(overview).toBeFocused();
  await page.getByRole('tab', { name: 'Week', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: 'Month', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('Showing this month')).toBeVisible();
  await page.getByLabel('Project name', { exact: true }).fill('Larkspur');
  await expect(
    page.getByRole('heading', { name: 'Larkspur', exact: true }),
  ).toBeVisible();
  const save = page.getByRole('button', { name: 'Save', exact: true });
  const width = (await save.boundingBox())!.width;
  await save.click();
  await expect(save).toHaveAttribute('aria-busy', 'true');
  await expect(save).toBeDisabled();
  expect((await save.boundingBox())!.width).toBe(width);
  await expect(
    page.getByRole('status').filter({ hasText: 'Changes saved' }),
  ).toBeVisible();
  await expect(save).toBeEnabled();
});
