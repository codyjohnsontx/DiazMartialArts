import { expect, test } from '@playwright/test';

test.describe('Schedule page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/schedule');
  });

  test('renders the weekly class schedule heading and day tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Weekly class schedule/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Monday schedule' })).toBeVisible();
  });

  test('renders the upcoming events section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Upcoming events/i })).toBeVisible();
  });
});
