import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('Starlight preserves readable light/dark docs, navigation and search', async ({
  page,
}, info) => {
  await page.goto('http://127.0.0.1:4174/');
  await expect(
    page.getByRole('heading', { name: 'Theme guide', exact: true }),
  ).toBeVisible();
  const colors: string[] = [];
  for (const mode of ['light', 'dark']) {
    const mobileMenu = page.getByRole('button', { name: 'Menu', exact: true });
    if (!(await page.locator('starlight-theme-select select:visible').count()))
      await mobileMenu.click();
    await page
      .locator('starlight-theme-select select:visible')
      .selectOption(mode);
    if (await mobileMenu.isVisible()) await mobileMenu.click();
    await expect(
      page.getByRole('heading', { name: 'Theme guide', exact: true }),
    ).toBeInViewport();
    await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
    colors.push(
      await page
        .locator('body')
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    );
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`starlight-${mode}.png`),
      fullPage: true,
    });
  }
  expect(colors[0]).not.toBe(colors[1]);
  await page.getByRole('button', { name: /search/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
