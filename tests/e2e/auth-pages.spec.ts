import { test, expect } from '@playwright/test';

test.describe('Auth pages', () => {
  test('/sign-in renders a member portal coming soon CTA without Clerk login', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(
      page.getByRole('heading', { name: /Member portal coming soon/i }),
    ).toBeVisible();
    await expect(page.getByText(/Online login is closed/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Join the waitlist/i })).toBeVisible();
    await expect(page.locator('[class*="cl-"]').first()).toHaveCount(0);
  });

  test('/sign-up renders a hard access wall without Clerk signup', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(
      page.getByRole('heading', { name: /Account creation is closed/i }),
    ).toBeVisible();
    await expect(page.getByText(/new online accounts are not open yet/i)).toBeVisible();
    await expect(page.locator('[class*="cl-"]').first()).toHaveCount(0);
  });
});
