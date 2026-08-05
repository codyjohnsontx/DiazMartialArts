import { test, expect } from '@playwright/test';

import { MARKETING_NAV_LINKS, ONDEMAND_URL, PUBLIC_PAGES } from '../fixtures/site';

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

  for (const { href, label } of MARKETING_NAV_LINKS) {
    test(`desktop nav "${label}" navigates to ${href}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'Mobile', 'Desktop nav is hidden on mobile viewports.');
      await page.goto('/');
      const nav = page.getByRole('navigation', { name: 'Primary' });
      await nav.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(href);
    });
  }

  test('header Member Login points straight at the configured member app', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'Mobile', 'Desktop nav is hidden on mobile viewports.');
    test.skip(!ONDEMAND_URL, 'NEXT_PUBLIC_ONDEMAND_URL is unset or still the placeholder.');
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Member Login' }).first()).toHaveAttribute(
      'href',
      ONDEMAND_URL!,
    );
  });

  test('header omits Member Login when no member app is configured', async ({ page }) => {
    test.skip(Boolean(ONDEMAND_URL), 'NEXT_PUBLIC_ONDEMAND_URL points at a member app.');
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Member Login' })).toHaveCount(0);
    // The public call to action must survive either way.
    await expect(page.getByRole('link', { name: 'Book Free Trial' }).first()).toBeVisible();
  });

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

  test('header home link is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Diaz Martial Arts home' })).toBeVisible();
  });
});
