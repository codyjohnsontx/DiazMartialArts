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

  test('carries no class-schedule flyer and serves every flyer image', async ({ page }) => {
    await page.goto('/announcements');

    // A class timetable reads as current operating hours, so it belongs on
    // /schedule alone and the feed must not carry a competing copy.
    await expect(page.getByRole('heading', { name: /Class Schedule/i })).toHaveCount(0);
    await expect(page.locator('main img[src*="class-schedule"]')).toHaveCount(0);

    const flyers = page.locator('main article img');
    const flyerCount = await flyers.count();
    expect(flyerCount).toBeGreaterThan(0);

    // next/image points each flyer at the dev image optimizer, which re-encodes
    // the source through sharp on first request: 1.4s to 1.8s apiece on an idle
    // eight-core machine, and several times that on a two-core runner. Waiting
    // for all thirteen to decode in the browser therefore measured that
    // optimizer's queue - one dev server, shared with the other project's
    // worker - and not whether a flyer was missing. In CI one request stayed
    // outstanding past the budget and took both projects of the job down with
    // it, while the other matrix leg passed on the same commit.
    //
    // Ask for each flyer's own file instead. A deleted or renamed flyer, which
    // is the regression this guards, answers 404 either way, and the check no
    // longer rides on lazy-load order or optimizer throughput.
    const sources = await flyers.evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.map((img) => {
        const url = new URL(img.src, window.location.href);
        return url.pathname === '/_next/image' ? (url.searchParams.get('url') ?? img.src) : img.src;
      }),
    );

    for (const source of sources) {
      const response = await page.request.get(source);
      expect(response.status(), `${source} should be served`).toBe(200);
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
