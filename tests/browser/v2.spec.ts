import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('v2 system theme updates original artwork with the device preference', async ({
  page,
}) => {
  await page.goto('/v2');
  const art = page.locator('.mg2-slider img').first(),
    theme = page.getByLabel('Theme', { exact: true });
  const dark = await art.getAttribute('src');
  await theme.selectOption('light');
  const light = await art.getAttribute('src');
  expect(light).not.toBe(dark);
  await page.emulateMedia({ colorScheme: 'light' });
  await theme.selectOption('system');
  await expect(art).toHaveAttribute('src', light!);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(art).toHaveAttribute('src', dark!);
});
test('v2 Slider supports keyboard and pointer changes, announces values and resets its form', async ({
  page,
}) => {
  await page.goto('/v2');
  const slider = page.getByRole('slider', { name: 'Confidence', exact: true });
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('71');
  await expect(slider).toHaveAttribute('aria-valuetext', '71%');
  await page.keyboard.press('Home');
  await expect(slider).toHaveValue('0');
  await page.keyboard.press('End');
  await expect(slider).toHaveValue('100');
  const box = (await slider.locator('..').boundingBox())!;
  if (await page.evaluate(() => matchMedia('(pointer:coarse)').matches))
    await page.touchscreen.tap(box.x + box.width / 2, box.y + 12);
  else await page.mouse.click(box.x + box.width / 2, box.y + 12);
  await expect(slider).toHaveValue('50');
  await expect(
    page.getByRole('slider', { name: 'Disabled confidence', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('button', { name: 'Reset confidence', exact: true })
    .click();
  await expect(slider).toHaveValue('70');
});
test('v2 searchable choice popup states retain accessible roles and contrast', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto('/v2');
  const controls = page.getByTestId('combo-family'),
    owner = controls.getByRole('combobox', { name: 'Owner', exact: true });
  for (const theme of ['dark', 'light']) {
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    for (const query of ['pri', 'zz']) {
      await owner.fill(query);
      expect(
        (
          await new AxeBuilder({ page })
            .include('.mg2-combo')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.bringToFront();
      await owner.press('Escape');
    }
  }
  await controls
    .getByRole('switch', { name: 'Simulate searching', exact: true })
    .check();
  await owner.fill('pri');
  expect(
    (
      await new AxeBuilder({ page })
        .include('.mg2-combo')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test('v2 searchable choices retain selection, multi-value forms, loading and reset behavior', async ({
  page,
}) => {
  await page.goto('/v2');
  const controls = page.getByTestId('combo-family'),
    owner = controls.getByRole('combobox', { name: 'Owner', exact: true }),
    tags = controls.getByRole('combobox', { name: 'Tags', exact: true });
  await owner.fill('pri');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(owner).toHaveValue('Pritam Rao');
  await expect(controls.locator('input[name="owner"]')).toHaveValue('pritam');
  await tags.fill('review');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(
    controls.getByRole('button', { name: 'Remove Needs review', exact: true }),
  ).toBeVisible();
  await expect(
    controls.getByRole('listbox', { name: 'Tags', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  const selected = () =>
    controls
      .locator('select[name="tags"]')
      .evaluate((el: HTMLSelectElement) =>
        Array.from(el.selectedOptions).map((option) => option.value),
      );
  expect(await selected()).toEqual(['damaged', 'followup', 'review']);
  await controls
    .getByRole('button', { name: 'Remove Damaged', exact: true })
    .click();
  expect(await selected()).toEqual(['followup', 'review']);
  await owner.fill('zz');
  await expect(controls.getByRole('status')).toContainText(
    'No results for “zz”',
  );
  await page.keyboard.press('Escape');
  await controls
    .getByRole('switch', { name: 'Simulate searching', exact: true })
    .check();
  await owner.fill('pri');
  await expect(controls.getByRole('status')).toContainText('Searching');
  await expect(controls.getByRole('option')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await controls
    .getByRole('switch', { name: 'Simulate searching', exact: true })
    .uncheck();
  await controls
    .getByRole('button', { name: 'Reset searchable choices', exact: true })
    .click();
  await expect(owner).toHaveValue('Priya Nair');
  expect(await selected()).toEqual(['damaged', 'followup']);
});
test('v2 temporal popovers retain readable focus states in every theme and density', async ({
  page,
}, info) => {
  test.setTimeout(60000);
  await page.goto('/v2');
  for (const theme of ['dark', 'light'])
    for (const density of ['comfortable', 'compact']) {
      await page.getByLabel('Theme', { exact: true }).selectOption(theme);
      await page.getByLabel('Density', { exact: true }).selectOption(density);
      await page
        .getByRole('button', { name: 'Choose Due date', exact: true })
        .click();
      const calendar = page.getByRole('dialog', {
        name: 'Choose Due date',
        exact: true,
      });
      await expect(calendar).toBeVisible();
      await calendar.screenshot({
        path: info.outputPath(`calendar-${theme}-${density}.png`),
      });
      await page.keyboard.press('Escape');
      await expect(
        page.getByRole('button', { name: 'Choose Due date', exact: true }),
      ).toBeFocused();
      await page
        .getByRole('button', { name: 'Choose Due date', exact: true })
        .click();
      expect(
        (
          await new AxeBuilder({ page })
            .include('.mg2-temporal-field .mg-popover:popover-open')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.bringToFront();
      await page.keyboard.press('Escape');
      await expect(calendar).not.toBeVisible();
    }
});
test('v2 date/time pickers validate typing, navigate dates and restore form state', async ({
  page,
}) => {
  await page.goto('/v2');
  const controls = page.getByTestId('temporal-family'),
    date = controls.getByRole('textbox', { name: 'Due date', exact: true });
  await date.fill('2026-02-30');
  await date.press('Enter');
  await expect(date).toHaveAttribute('aria-invalid', 'true');
  expect(await date.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(
    false,
  );
  await date.fill('Oct 14, 2026');
  await date.press('Tab');
  await controls
    .getByRole('button', { name: 'Choose Due date', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Choose Due date',
    exact: true,
  });
  await expect(
    dialog.getByRole('button', { name: 'Wed, Oct 14, 2026', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(
    dialog.getByRole('button', { name: 'Thu, Oct 15, 2026', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog).not.toBeVisible();
  await expect(date).toHaveValue('Thu, Oct 15, 2026');
  await expect(controls.locator('input[name="dueDate"]')).toHaveValue(
    '2026-10-15',
  );
  await controls
    .getByRole('button', { name: 'Choose Start time', exact: true })
    .click();
  const times = page.getByRole('dialog', {
    name: 'Choose Start time',
    exact: true,
  });
  await expect(
    times.getByRole('option', { name: '2:30 PM', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(
    controls.getByRole('textbox', { name: 'Start time', exact: true }),
  ).toHaveValue('2:45 PM');
  await expect(controls.locator('input[name="startTime"]')).toHaveValue(
    '14:45',
  );
  await controls
    .getByRole('button', { name: 'Reset dates and times', exact: true })
    .click();
  await expect(date).toHaveValue('Wed, Oct 14, 2026');
  await expect(
    controls.getByRole('textbox', { name: 'Start time', exact: true }),
  ).toHaveValue('2:30 PM');
  const calendar = controls.getByRole('group', {
    name: 'Date range',
    exact: true,
  });
  await calendar
    .getByRole('button', { name: 'Tue, Oct 20, 2026', exact: true })
    .click();
  await calendar
    .getByRole('button', { name: 'Fri, Oct 23, 2026', exact: true })
    .click();
  await expect(
    calendar.getByRole('button', { name: 'Tue, Oct 20, 2026', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(calendar.locator('[data-range="true"]')).toHaveCount(2);
});
test('v2 file selection validates files, preserves native form data and supports retry/remove/reset', async ({
  page,
}) => {
  await page.goto('/v2');
  const controls = page.getByTestId('files-family'),
    input = controls.locator('input[type="file"]');
  await input.setInputFiles({
    name: 'report.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('bad'),
  });
  await expect(
    controls.locator('.mg2-file-field').getByRole('alert'),
  ).toContainText("report.txt isn't a supported format");
  expect(
    await input.evaluate((el: HTMLInputElement) => el.validity.valid),
  ).toBe(false);
  await input.setInputFiles([
    { name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from('image') },
    {
      name: 'photo2.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('image'),
    },
  ]);
  await expect(controls.getByRole('alert')).toHaveText('Upload failed');
  await controls
    .getByRole('button', { name: 'Remove photo.png', exact: true })
    .click();
  expect(
    await input.evaluate((el: HTMLInputElement) =>
      Array.from(el.files ?? []).map((file) => file.name),
    ),
  ).toEqual(['photo2.jpg']);
  await controls
    .getByRole('button', { name: 'Reset photos', exact: true })
    .click();
  await expect(
    controls.getByRole('button', { name: 'Remove photo2.jpg', exact: true }),
  ).toHaveCount(0);
  expect(await input.evaluate((el: HTMLInputElement) => el.files?.length)).toBe(
    0,
  );
  await controls.locator('.mg2-file-zone').evaluate((el) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(
      new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'too-big.png', {
        type: 'image/png',
      }),
    );
    el.dispatchEvent(
      new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }),
    );
  });
  await expect(
    controls.locator('.mg2-file-field').getByRole('alert'),
  ).toContainText('too-big.png exceeds the file size limit');
  await controls.locator('.mg2-file-zone').evaluate((el) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(
      new File(['image'], 'dropped.png', { type: 'image/png' }),
    );
    el.dispatchEvent(
      new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }),
    );
  });
  await expect(
    controls.getByRole('button', { name: 'Remove dropped.png', exact: true }),
  ).toBeVisible();
  expect(
    await input.evaluate((el: HTMLInputElement) => el.files?.[0]?.name),
  ).toBe('dropped.png');
  await controls.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(controls.getByRole('alert')).toHaveCount(0);
  await controls
    .getByRole('button', { name: 'Remove inspection.jpg', exact: true })
    .click();
  await expect(
    controls.getByText('inspection.jpg', { exact: true }),
  ).toHaveCount(0);
  await expect(controls.locator('li[aria-current="step"]')).toContainText(
    'Counts',
  );
  await controls
    .getByRole('button', { name: 'Next step', exact: true })
    .click();
  await expect(controls.locator('li[aria-current="step"]')).toContainText(
    'Review',
  );
  await expect(
    controls.getByRole('button', { name: 'Next step', exact: true }),
  ).toBeDisabled();
});
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
  test.setTimeout(60000);
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
      for (const field of await page
        .getByTestId('combo-family')
        .locator('.mg-combobox-control')
        .all())
        expect((await field.boundingBox())!.height).toBe(
          density === 'comfortable' ? 44 : 32,
        );
      expect(
        (await page
          .getByRole('group', { name: 'Date range', exact: true })
          .boundingBox())!.width,
      ).toBe(density === 'comfortable' ? 332 : 248);
      expect(
        (await page.locator('.mg2-temporal-control').first().boundingBox())!
          .height,
      ).toBe(density === 'comfortable' ? 44 : 32);
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
      const notification = page
        .getByRole('switch', { name: 'Notifications', exact: true })
        .locator('..');
      const track = (await notification
        .locator('.mg2-switch-control')
        .boundingBox())!;
      expect([track.width, track.height]).toEqual(
        density === 'comfortable' ? [44, 24] : [32, 20],
      );
      const thumb = (await notification
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
