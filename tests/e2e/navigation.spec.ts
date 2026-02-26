import { test, expect } from '@playwright/test';

import { NAV_LINKS, PUBLIC_PAGES } from '../fixtures/site';

const publicPaths = PUBLIC_PAGES.map((p) => p.path);

test.describe('Navigation', () => {
  for (const path of publicPaths.slice(0, 6)) {
    test(`header present on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('banner')).toBeVisible();
    });
  }

  test('logo link returns to /', async ({ page }) => {
    await page.goto('/programs');
    await page.getByRole('link', { name: 'Diaz Martial Arts home' }).click();
    await expect(page).toHaveURL('/');
  });

  for (const { href, label } of NAV_LINKS) {
    test(`desktop nav "${label}" navigates to ${href}`, async ({ page }) => {
      await page.goto('/');
      // Use the primary nav (desktop)
      const nav = page.getByRole('navigation', { name: 'Primary' });
      await nav.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(href);
    });
  }

  test('footer Privacy link → /privacy', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }).click();
    await expect(page).toHaveURL('/privacy');
  });

  test('footer Terms link → /terms', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Terms' }).click();
    await expect(page).toHaveURL('/terms');
  });

  test('announcement bar "See pricing" link → /pricing', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'See pricing' }).click();
    await expect(page).toHaveURL('/pricing');
  });
});
