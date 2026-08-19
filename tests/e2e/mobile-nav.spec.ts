import { test, expect } from '@playwright/test';

import { NAV_LINKS } from '../fixtures/site';

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

  /**
   * The mobile menu used to carry a "Member Login" control alongside the call to
   * action, shown only when NEXT_PUBLIC_ONDEMAND_URL named a deployed member
   * app. That control is gone, so this asserts the shape unconditionally rather
   * than only on the unconfigured matrix leg the old pair of tests split between
   * them. On Demand stays in the link list above, which is now the site's only
   * member entry point.
   */
  test('mobile menu ends in one Book Free Trial call to action and no Member Login', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    const mobileNav = page.locator('#mobile-nav');
    await expect(mobileNav.getByRole('link', { name: 'Book Free Trial' })).toHaveCount(1);
    await expect(mobileNav.getByRole('link', { name: 'Book Free Trial' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Member Login' })).toHaveCount(0);
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
