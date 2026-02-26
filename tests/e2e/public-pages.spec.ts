import { test, expect } from '@playwright/test';

import { PUBLIC_PAGES } from '../fixtures/site';

test.describe('Public pages — HTTP 200 + heading + footer', () => {
  for (const { path, heading } of PUBLIC_PAGES) {
    test(`${path} returns 200 and shows heading`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByText(heading, { exact: false }).first()).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });
  }
});

test.describe('Coaches page details', () => {
  test('shows Coach Eddie Diaz and his rank', async ({ page }) => {
    await page.goto('/coaches');
    await expect(page.getByText('Coach Eddie Diaz')).toBeVisible();
    await expect(page.getByText('Black Belt, Head Instructor')).toBeVisible();
  });
});

test.describe('Pricing page details', () => {
  test('shows all three plan names', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: 'Essentials' })).toBeVisible();
    // Use heading role to avoid matching "• Unlimited classes" list item
    await expect(page.getByRole('heading', { name: 'Unlimited' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kids Program' })).toBeVisible();
  });
});

test.describe('Schedule page details', () => {
  test('renders weekly schedule table', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page.getByRole('table', { name: 'Weekly class schedule' })).toBeVisible();
  });
});

test.describe('FAQ page details', () => {
  test('renders at least one h3', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('h3').first()).toBeVisible();
  });
});
