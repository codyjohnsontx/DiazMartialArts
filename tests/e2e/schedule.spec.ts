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

    // One of these is rendered depending on whether the embed URL is configured at build time.
    await expect(
      page
        .locator('iframe[title="Diaz Martial Arts monthly schedule"]')
        .or(page.getByText('Monthly calendar coming soon.')),
    ).toBeVisible();
  });

  test('renders upcoming events section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Upcoming \(Next 60 Days\)/i })).toBeVisible();
  });
});
