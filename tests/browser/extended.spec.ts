import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('pill tabs match Figma geometry and skip disabled tabs with keyboard and RTL', async ({
  page,
}) => {
  await page.goto('/controls');
  await page.evaluate(() => document.fonts.ready);
  const reference = page.getByTestId('pill-tabs');
  const tabs = reference.getByRole('tab');
  expect((await tabs.first().boundingBox())!.height).toBe(35);
  expect(
    Math.abs((await tabs.first().boundingBox())!.width - 109),
  ).toBeLessThan(1);
  expect(
    await reference
      .locator('[role="tablist"]')
      .evaluate((el) => getComputedStyle(el).gap),
  ).toBe('7px');
  await expect(tabs.first()).toHaveCSS(
    'background-color',
    'rgb(187, 170, 240)',
  );
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(reference.getByRole('tabpanel')).toContainText(
    'Compare scoring',
  );
  const available = page.getByRole('tablist', { name: 'Availability' });
  await available.getByRole('tab', { name: 'Ready', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    available.getByRole('tab', { name: 'Complete', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Home');
  await expect(
    available.getByRole('tab', { name: 'Ready', exact: true }),
  ).toBeFocused();
  await page.locator('html').evaluate((el) => el.setAttribute('dir', 'rtl'));
  await page.keyboard.press('ArrowLeft');
  await expect(
    available.getByRole('tab', { name: 'Complete', exact: true }),
  ).toBeFocused();
});

test('tooltip describes the focused trigger and Escape dismisses without moving focus', async ({
  page,
}) => {
  await page.goto('/controls');
  const trigger = page.getByRole('button', { name: 'Why choose a team?' });
  await trigger.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await expect(trigger).toHaveAccessibleDescription(
    'Choose the team you are scouting.',
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Show notification' }).focus();
  await page.waitForTimeout(250);
  await expect(page.getByRole('tooltip')).toBeHidden();
  await trigger.hover();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.getByRole('tooltip').hover();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.getByRole('button', { name: 'Show notification' }).hover();
  await expect(page.getByRole('tooltip')).toBeHidden();
});

test('popover focuses its content, fits the viewport and restores focus on Escape', async ({
  page,
}) => {
  await page.goto('/controls');
  const trigger = page.getByRole('button', {
    name: 'Edit display',
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Display settings' });
  await expect(
    dialog.getByRole('textbox', { name: 'Display name' }),
  ).toBeFocused();
  const box = (await dialog.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('button', { name: 'Show notification' }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(
    page.getByRole('button', { name: 'Show notification' }),
  ).toBeFocused();
  await expect(
    page.getByRole('status').filter({ hasText: 'Report saved' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss notification' }).click();
  await expect(
    page.getByText('Report saved. You can keep scouting.'),
  ).toHaveCount(0);
});

test('combobox filters, skips disabled items, scrolls active options and commits form values', async ({
  page,
}) => {
  await page.goto('/controls');
  const input = page.getByRole('combobox', { name: 'Team lookup' });
  await input.fill('Unavailable');
  await page.keyboard.press('ArrowDown');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('option', { name: 'Unavailable team' }),
  ).toBeDisabled();
  await input.fill('Example team');
  await page.keyboard.press('End');
  const activeId = await input.getAttribute('aria-activedescendant');
  const last = page.getByRole('option', { name: '9011 — Example team' });
  expect(await last.getAttribute('id')).toBe(activeId);
  await expect(last).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('9011 — Example team');
  await page
    .getByRole('listbox', { name: 'Scouting roles' })
    .selectOption(['scout', 'analyst']);
  await page.getByRole('button', { name: 'Submit choices' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Team 9011' }),
  ).toContainText('roles scout, analyst');
  await page.getByRole('button', { name: 'Reset choices' }).click();
  await expect(input).toHaveValue('');
  expect(
    await page
      .getByRole('listbox', { name: 'Scouting roles' })
      .evaluate((el: HTMLSelectElement) => [...el.selectedOptions].length),
  ).toBe(0);
  await expect(
    page.getByRole('combobox', { name: 'Disabled lookup' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('listbox', { name: 'Disabled roles' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('option', { name: 'Driver', exact: true }).first(),
  ).toBeDisabled();
});

test('combobox Escape cancels a query and outside click closes the list', async ({
  page,
}) => {
  await page.goto('/controls');
  const input = page.getByRole('combobox', { name: 'Team lookup' });
  await input.fill('8033');
  await page.keyboard.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).toHaveValue('');
  await input.fill('8033');
  await page
    .getByRole('heading', { name: 'Search and multiple choices' })
    .click();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('table sorting is numeric and announced; pagination respects bounds', async ({
  page,
}) => {
  await page.goto('/controls');
  const table = page.getByRole('table', { name: 'Example teams' });
  const sort = table.getByRole('button', { name: 'Team', exact: true });
  await sort.click();
  await expect(table.getByRole('row').nth(1)).toContainText('254');
  await expect(
    table.getByRole('columnheader', { name: 'Team' }),
  ).toHaveAttribute('aria-sort', 'ascending');
  await sort.click();
  await expect(table.getByRole('row').nth(1)).toContainText('8033');
  await expect(
    table.getByRole('columnheader', { name: 'Team' }),
  ).toHaveAttribute('aria-sort', 'descending');
  const nav = page.getByRole('navigation', { name: 'Report pages' });
  await expect(nav.getByRole('button', { name: 'Previous' })).toBeDisabled();
  await nav.getByRole('button', { name: 'Next' }).click();
  await expect(
    nav.getByRole('button', { name: 'Page 2', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('button', { name: 'Page 8', exact: true }).click();
  await expect(nav.getByRole('button', { name: 'Next' })).toBeDisabled();
  await expect(nav.getByRole('status')).toHaveText('Page 8 of 8');
});

test('accordion keeps native keyboard and exclusive-group behavior', async ({
  page,
}) => {
  await page.goto('/controls');
  const first = page
    .locator('summary')
    .filter({ hasText: 'Keyboard shortcuts' });
  await first.focus();
  await page.keyboard.press('Space');
  await expect(first.locator('..')).toHaveAttribute('open', '');
  const second = page
    .locator('summary')
    .filter({ hasText: 'What happens offline?' });
  await second.click();
  await expect(first.locator('..')).not.toHaveAttribute('open');
  await expect(second.locator('..')).toHaveAttribute('open', '');
});

test('extended controls pass axe and fit all themes/densities', async ({
  page,
}, info) => {
  await page.goto('/controls');
  for (const theme of ['dark', 'light']) {
    if (theme === 'light')
      await page.getByRole('button', { name: 'Use light theme' }).click();
    for (const density of ['comfortable', 'compact']) {
      if (density === 'compact')
        await page.getByRole('button', { name: 'Use compact density' }).click();
      await page.getByRole('button', { name: 'Show notification' }).click();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(results.violations).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: info.outputPath(`controls-${theme}-${density}.png`),
        fullPage: true,
      });
    }
    await page.getByRole('button', { name: 'Use comfortable density' }).click();
  }
});

test('new controls server-render and hydrate without duplicate IDs or browser globals', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (/hydration/i.test(msg.text())) errors.push(msg.text());
  });
  await page.goto('/controls-ssr');
  await page.getByRole('tab', { name: 'Notes', exact: true }).click();
  await expect(
    page.getByRole('tabpanel').filter({ hasText: 'Team notes' }),
  ).toBeVisible();
  const ids = await page
    .locator('[id]')
    .evaluateAll((els) => els.map((el) => el.id));
  expect(ids.length).toBe(new Set(ids).size);
  expect(errors).toEqual([]);
});
