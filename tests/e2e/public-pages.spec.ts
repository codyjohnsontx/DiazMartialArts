import { test, expect } from '@playwright/test';

import { PUBLIC_PAGES } from '../fixtures/site';

test.describe('Public pages - HTTP 200 + heading + footer', () => {
  for (const { path, heading } of PUBLIC_PAGES) {
    test(`${path} returns 200 and shows heading`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole('heading', { name: new RegExp(heading, 'i') }).first(),
      ).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });
  }
});

test.describe('Coaches page details', () => {
  test('shows Coach Eddie Diaz and head instructor label', async ({ page }) => {
    await page.goto('/coaches');
    await expect(page.getByText(/Eddie Diaz/i).first()).toBeVisible();
    await expect(page.getByText(/Head Instructor/i).first()).toBeVisible();
  });
});

test.describe('Announcements page details', () => {
  test('shows Announcements heading', async ({ page }) => {
    await page.goto('/announcements');
    await expect(page.getByRole('heading', { name: 'Announcements', level: 1 })).toBeVisible();
  });

  test('carries no class-schedule flyer and loads every flyer image', async ({ page }) => {
    // Thirteen flyers, each allowed the wait below, need more than the 30s
    // default so the test reports the flyer that failed rather than dying on
    // its own clock partway down the page.
    test.setTimeout(120_000);

    await page.goto('/announcements');

    // A class timetable reads as current operating hours, so it belongs on
    // /schedule alone and the feed must not carry a competing copy.
    await expect(page.getByRole('heading', { name: /Class Schedule/i })).toHaveCount(0);
    await expect(page.locator('main img[src*="class-schedule"]')).toHaveCount(0);

    const flyers = page.locator('main article img');
    const flyerCount = await flyers.count();
    expect(flyerCount).toBeGreaterThan(0);

    // Every flyer but the first renders loading="lazy", so bring them into view
    // one at a time. A single jump to the page bottom would leave whether the
    // rest ever load up to the browser's lazy-load heuristics, which vary with
    // viewport and connection - scrolling to each one makes the check decisive.
    //
    // The wait needs its own budget rather than the 5s default. The quality gate
    // serves these tests from `next dev`, which re-encodes a flyer the first
    // time it is asked for, and bringing one into view also pre-triggers the
    // next few, so several land on that encoder at once. Locally, on an idle
    // machine, the last flyer in such a queue answered after ~9s; CI runs two
    // workers against one dev server on a shared runner, which is slower again.
    // At 5s this timed out on the encoder queue, not on a flyer that never
    // loads, so it failed the gate over how busy the box was.
    for (let i = 0; i < flyerCount; i++) {
      const flyer = flyers.nth(i);
      await flyer.scrollIntoViewIfNeeded();
      await expect
        .poll(() => flyer.evaluate((img: HTMLImageElement) => img.naturalWidth), {
          timeout: 20_000,
        })
        .toBeGreaterThan(0);
    }
  });

  test('every category filter still lists announcements', async ({ page }) => {
    await page.goto('/announcements');

    for (const category of ['Events', 'Promos', 'Testings', 'Closures']) {
      await page.getByRole('button', { name: new RegExp(`^${category}$`, 'i') }).click();
      await expect(page.locator('main article')).not.toHaveCount(0);
      await expect(page.getByText(/No announcements in this category/i)).toHaveCount(0);

      // The two assertions above would also hold if clicking a filter did
      // nothing, so prove the filter actually excludes. A monthly calendar is
      // an Event and will never be a Promo, however the feed grows later.
      if (category === 'Promos') {
        await expect(page.getByRole('heading', { name: 'June Events Calendar' })).toHaveCount(0);
      }
    }
  });
});

test.describe('Schedule page details', () => {
  test('renders weekly schedule heading and day tabs', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page.getByRole('heading', { name: /Weekly class schedule/i })).toBeVisible();

    for (const day of [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]) {
      await expect(page.getByRole('tab', { name: `${day} schedule` })).toBeVisible();
    }
  });
});

test.describe('FAQ page details', () => {
  test('renders at least one FAQ question', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByRole('button', { name: /experience to start/i })).toBeVisible();
  });
});
