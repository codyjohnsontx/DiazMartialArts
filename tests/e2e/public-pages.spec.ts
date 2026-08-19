import { test, expect } from '@playwright/test';

import { imageSize } from '../fixtures/imageSize';
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

  test('carries no class-schedule flyer and every flyer resolves to a real image', async ({
    page,
    request,
  }) => {
    await page.goto('/announcements');

    // A class timetable reads as current operating hours, so it belongs on
    // /schedule alone and the feed must not carry a competing copy.
    await expect(page.getByRole('heading', { name: /Class Schedule/i })).toHaveCount(0);
    await expect(page.locator('main img[src*="class-schedule"]')).toHaveCount(0);

    const flyers = page.locator('main article img');
    const flyerCount = await flyers.count();
    expect(flyerCount).toBeGreaterThan(0);

    // This deliberately does NOT wait for the browser to decode each flyer.
    //
    // next/image routes every flyer through the on-demand optimizer, which
    // re-encodes it per request in `next dev` and in `next start` alike -
    // `next build` does not pre-generate those variants. Without the optional
    // `sharp` package installed the optimizer falls back to a WebAssembly
    // encoder whose worker pool is `min(cpus - 1, 6)` wide, so on a small CI
    // runner the whole page's variants encode more or less one at a time.
    // Measured cold, serialized, over the fourteen variants this page asks for:
    // ~12s on an idle developer machine and ~27s with the CPU contended. A
    // flyer scrolled into view queues behind whatever is already encoding, so
    // any fixed decode deadline is really an assertion about how busy the box
    // is. Two such deadlines were raised here before; a third would not have
    // converged either.
    //
    // So assert what the page is actually responsible for instead: that the
    // featured flyer loads eagerly and the rest lazily, and that every flyer
    // points at a file the site really serves, which really is an image, and
    // whose true size matches the dimensions the page declares. That still
    // fails on a missing, corrupt, or mis-measured flyer - and it fails naming
    // the offending file - without making a third-party encoder's throughput
    // part of the contract.
    await expect(flyers.first()).toHaveAttribute('loading', 'eager');
    for (let i = 1; i < flyerCount; i++) {
      await expect(flyers.nth(i)).toHaveAttribute('loading', 'lazy');
    }

    for (let i = 0; i < flyerCount; i++) {
      const flyer = flyers.nth(i);
      const src = await flyer.getAttribute('src');
      expect(src, `flyer ${i} renders without a src`).toBeTruthy();

      // Recover the underlying public path from the optimizer URL
      // (/_next/image?url=<path>&w=..&q=..), then fetch that path directly.
      const rendered = new URL(src!, 'http://localhost');
      const source = rendered.searchParams.get('url') ?? rendered.pathname;

      const response = await request.get(source);
      expect(response.status(), `${source} is not served`).toBe(200);
      expect(response.headers()['content-type'], `${source} is not served as an image`).toMatch(
        /^image\//,
      );

      const actual = imageSize(await response.body());
      expect(actual, `${source} is not a readable JPEG or PNG`).not.toBeNull();
      expect(
        actual,
        `${source} is ${actual?.width}x${actual?.height} but the page declares it otherwise`,
      ).toEqual({
        width: Number(await flyer.getAttribute('width')),
        height: Number(await flyer.getAttribute('height')),
      });
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
