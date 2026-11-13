import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('Figma component geometry, role states and original assets match the reference', async ({
  page,
}, info) => {
  const failedAssets: string[] = [];
  page.on('response', (res) => {
    if (res.status() >= 400 && /\.(svg|woff2)/.test(res.url()))
      failedAssets.push(res.url());
  });
  await page.goto('/figma');
  await page.evaluate(() => document.fonts.ready);
  for (const mode of ['light', 'dark'])
    for (const density of ['comfortable', 'compact']) {
      const buttons = page.getByTestId(`buttons-${mode}-${density}`),
        inputs = page.getByTestId(`inputs-${mode}-${density}`);
      const expectedHeight = density === 'comfortable' ? 44 : 33;
      const enabled = buttons.locator(
        '.mg-button.primary[data-preview-state="enabled"]',
      );
      expect((await enabled.boundingBox())!.height).toBe(expectedHeight);
      // Figma rounds text bounds; macOS/Linux browser shaping differs by up to one pixel.
      expect(
        Math.abs(
          (await enabled.boundingBox())!.width -
            (density === 'comfortable' ? 88 : 66),
        ),
      ).toBeLessThanOrEqual(1);
      const disabled = buttons.locator('.mg-button.primary:disabled');
      expect(
        await disabled.evaluate((el) => getComputedStyle(el).backgroundColor),
      ).toBe(mode === 'light' ? 'rgb(165, 154, 176)' : 'rgb(86, 75, 117)');
      const textDisabled = buttons.locator('.mg-button.text-only:disabled');
      expect(
        await textDisabled.evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ).toBe('rgba(0, 0, 0, 0)');
      const toggle = inputs.getByRole('switch', { name: 'On', exact: true });
      const box = (await toggle.boundingBox())!;
      expect(box.width).toBe(58);
      expect(box.height).toBe(34);
      expect(
        await toggle.evaluate((el) => getComputedStyle(el, '::before').width),
      ).toBe('28px');
      const checkbox = inputs.getByRole('checkbox', { name: 'Option' }).first();
      expect((await checkbox.boundingBox())!.width).toBe(
        density === 'comfortable' ? 24 : 18,
      );
      const checked = inputs.locator(
        'input[type="checkbox"]:not([role="switch"]):checked:not(:disabled)',
      );
      const correctAsset = await checked.evaluate((el, expectedVariable) => {
        const styles = getComputedStyle(el);
        return (
          styles.backgroundImage !== 'none' &&
          styles.backgroundImage ===
            styles.getPropertyValue(expectedVariable).trim()
        );
      }, `--mg-asset-checkbox-${density}-on`);
      expect(correctAsset).toBe(true);
      const select = inputs.getByRole('combobox').first();
      expect((await select.boundingBox())!.height).toBe(expectedHeight);
    }
  expect(
    await page.evaluate(() => document.fonts.check('500 16px Heebo')),
  ).toBe(true);
  expect(failedAssets).toEqual([]);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({
    path: info.outputPath('figma-components.png'),
    fullPage: true,
  });
});
test('Pill toggles with keyboard and exposes state', async ({ page }) => {
  await page.goto('/figma');
  const pill = page.getByRole('button', {
    name: 'Toggle selection',
    exact: true,
  });
  await expect(pill).toHaveAttribute('aria-pressed', 'false');
  await pill.focus();
  await page.keyboard.press('Space');
  await expect(pill).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Enter');
  await expect(pill).toHaveAttribute('aria-pressed', 'false');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
