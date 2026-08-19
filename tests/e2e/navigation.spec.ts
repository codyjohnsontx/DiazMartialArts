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
   *
   * Every destination is asserted, not just the labels. The click-through loop
   * above cannot cover On Demand: on the configured matrix leg /ondemand is an
   * HTTP redirect off-site, so clicking it leaves the app. That made the href
   * the only guard On Demand has, and with the member-app button gone it is the
   * whole remaining member entry contract - so it is checked here rather than
   * left to a label match, which a repointed link would still satisfy.
   */
  test('desktop header shows the nav links, each pointing at its route, and one Book Free Trial call to action', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'Mobile', 'Desktop nav is hidden on mobile viewports.');
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link')).toHaveText(NAV_LINKS.map((link) => link.label));
    for (const { href, label } of NAV_LINKS) {
      await expect(nav.getByRole('link', { name: label })).toHaveAttribute('href', href);
    }

    const header = page.getByRole('banner');
    const cta = header.getByRole('link', { name: 'Book Free Trial' });
    await expect(cta).toHaveCount(1);
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/contact');
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
