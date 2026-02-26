import { test, expect } from '@playwright/test';

test.describe('404 page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/this-route-does-not-exist-12345');
  });

  test('returns HTTP 404', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist-12345');
    expect(response?.status()).toBe(404);
  });

  test('shows a heading', async ({ page }) => {
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('shows a link matching /home|back/i', async ({ page }) => {
    await expect(page.getByRole('link', { name: /home|back/i }).first()).toBeVisible();
  });

  test('header and footer are present', async ({ page }) => {
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});
