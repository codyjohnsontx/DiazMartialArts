import { expect, test } from '@playwright/test';

test.describe('Schedule page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/schedule');
  });

  test('renders weekly schedule table', async ({ page }) => {
    await expect(page.getByRole('table', { name: 'Weekly class schedule' })).toBeVisible();
  });

  test('renders monthly calendar section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Monthly Calendar' })).toBeVisible();

    if (process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL) {
      await expect(page.locator('iframe[title="Diaz Martial Arts monthly schedule"]')).toBeVisible();
    } else {
      await expect(page.getByText('Monthly calendar coming soon.')).toBeVisible();
    }
  });

  test('renders upcoming events section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Upcoming \(Next 60 Days\)/i })).toBeVisible();
  });
});
