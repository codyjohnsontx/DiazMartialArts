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
    // Optimizing all thirteen flyers is roughly 10s of sharp work on an idle
    // eight-core dev machine, and CI runs two projects against one four-core
    // runner. The default 30s does not cover that.
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
    for (let i = 0; i < flyerCount; i++) {
      await flyers.nth(i).scrollIntoViewIfNeeded();
    }

    // Then wait for the whole set to settle at once, rather than holding each
    // flyer to its own deadline as it scrolls past. next dev serves these
    // through an image optimizer that resolves requests one at a time, shared
    // with whatever the other project is loading, so a single flyer can sit
    // behind two dozen others. A per-flyer deadline is therefore a bet on queue
    // position rather than a measure of whether the flyer loads, and that is
    // what failed in CI. Only the total is bounded by the work to be done, so
    // budget against the total.
    await expect
      .poll(
        () =>
          flyers.evaluateAll((imgs: HTMLImageElement[]) => imgs.filter((i) => !i.complete).length),
        { timeout: 90_000 },
      )
      .toBe(0);

    // Settled is not the same as loaded: a flyer whose file is missing also
    // reports complete, with naturalWidth left at 0. Asserting that separately
    // is what makes a genuinely broken flyer fail as soon as its request 404s,
    // instead of sitting out the budget above, and it names the culprit.
    const broken = await flyers.evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.filter((i) => i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
    );
    expect(broken).toEqual([]);
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
