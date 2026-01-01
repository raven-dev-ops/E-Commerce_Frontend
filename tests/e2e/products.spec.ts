import { expect, test } from '@playwright/test';

test('products page renders example catalog and filters', async ({ page }) => {
  await page.goto('/products');

  await expect(page.getByText('Classic Beard Balm')).toBeVisible();
  await expect(page.getByText('Citrus Beard Oil')).toBeVisible();

  await page.fill('input[name="q"]', 'Citrus');
  await page.click('button[type="submit"]');

  await expect(page.getByText('Citrus Beard Oil')).toBeVisible();
  await expect(page.getByText('Classic Beard Balm')).toHaveCount(0);
});
