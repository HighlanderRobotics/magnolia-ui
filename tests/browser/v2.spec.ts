import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
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
  await expect(page.getByRole('status')).toHaveText('Changes saved');
  await expect(save).toBeEnabled();
});
