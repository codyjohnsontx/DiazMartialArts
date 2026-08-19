import { test, expect } from '@playwright/test';

import { MARKETING_NAV_LINKS, NAV_LINKS, PUBLIC_PAGES } from '../fixtures/site';

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

  /**
   * The header carries the nav links and one call to action, and nothing else.
   * It used to carry a "Member Login" control too, shown only when
   * NEXT_PUBLIC_ONDEMAND_URL named a deployed member app; that control is gone,
   * so this asserts the shape unconditionally rather than only on the
   * unconfigured matrix leg the old pair of tests split between them. On Demand
   * stays as an ordinary nav link, which is now the site's only member entry
   * point.
   */
  test('desktop header shows the nav links and one Book Free Trial call to action', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'Mobile', 'Desktop nav is hidden on mobile viewports.');
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link')).toHaveText(NAV_LINKS.map((link) => link.label));

    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: 'Book Free Trial' })).toHaveCount(1);
    await expect(header.getByRole('link', { name: 'Book Free Trial' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Member Login' })).toHaveCount(0);
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
