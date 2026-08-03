import { test, expect } from '@playwright/test';

import { NAV_LINKS, ONDEMAND_URL } from '../fixtures/site';

test.use({ viewport: { width: 390, height: 844 } });

test.describe('Mobile navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('desktop nav is hidden at mobile viewport', async ({ page }) => {
    const desktopNav = page.getByRole('navigation', { name: 'Primary' });
    await expect(desktopNav).toBeHidden();
  });

  test('toggle button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeVisible();
  });

  test('toggle button starts collapsed', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('pressing Enter on toggle opens menu', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('mobile nav contains all primary links including On Demand', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    const mobileNav = page.locator('#mobile-nav');
    for (const { label } of NAV_LINKS) {
      await expect(mobileNav.getByRole('link', { name: label })).toBeVisible();
    }
  });

  test('clicking a marketing nav link navigates and closes menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page.locator('#mobile-nav').getByRole('link', { name: 'Programs' }).click();
    await expect(page).toHaveURL('/programs');
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('mobile menu Member Login points at the configured member app', async ({ page }) => {
    test.skip(!ONDEMAND_URL, 'NEXT_PUBLIC_ONDEMAND_URL is unset or still the placeholder.');
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await expect(
      page.locator('#mobile-nav').getByRole('link', { name: 'Member Login' }),
    ).toHaveAttribute('href', ONDEMAND_URL!);
  });

  test('mobile menu omits Member Login when no member app is configured', async ({ page }) => {
    test.skip(Boolean(ONDEMAND_URL), 'NEXT_PUBLIC_ONDEMAND_URL points at a member app.');
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    const mobileNav = page.locator('#mobile-nav');
    await expect(mobileNav.getByRole('link', { name: 'Member Login' })).toHaveCount(0);
    await expect(mobileNav.getByRole('link', { name: 'Book Free Trial' })).toBeVisible();
  });

  test('pressing Escape closes the menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await expect(page.locator('#mobile-nav')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Toggle menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
