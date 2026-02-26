import { test, expect } from '@playwright/test';

test.describe('Auth pages', () => {
  test('/sign-in renders "Member Login" and Clerk wrapper', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: /Member Login/i })).toBeVisible();
    // Clerk renders into a div with data-clerk-* attribute or cl-rootBox class
    await expect(page.locator('[class*="cl-"]').first()).toBeVisible();
  });

  test('/sign-up renders "Create Account" and Clerk wrapper', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page.getByRole('heading', { name: /Create Account/i })).toBeVisible();
    await expect(page.locator('[class*="cl-"]').first()).toBeVisible();
  });

  test('/account (unauthenticated) redirects to sign-in', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('/ondemand (unauthenticated) redirects to sign-in', async ({ page }) => {
    await page.goto('/ondemand');
    await expect(page).toHaveURL(/sign-in/);
  });
});
