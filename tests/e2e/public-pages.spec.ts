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
    // The flyers are allowed the wait below one after another, so the test
    // needs more than the 30s default to report the flyer that failed rather
    // than dying on its own clock partway down the page. Budgeted from the
    // per-flyer wait rather than a flyer count, so adding one to the feed does
    // not quietly reintroduce that failure mode.
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

  test('every category filter it offers selects part of the feed', async ({ page }) => {
    // This used to assert every one of four named categories lists something.
    // That held only while the feed happened to span all four, and the feed is
    // whatever the gym is currently running. The row now renders a button only
    // for a category the feed carries, so what is checked here is that promise:
    // nothing it advertises is a dead end, against the real page and the real
    // content. The guarantees that need a feed spanning several categories -
    // that picking one excludes the others, and that an empty selection says so
    // - are pinned in tests/components/announcement-flyer-gallery.test.tsx,
    // where the feed is a fixture rather than whatever is running this month.
    await page.goto('/announcements');

    const articles = page.locator('main article');
    const emptyState = page.getByText(/No announcements in this category/i);

    // The row lists only the categories the feed carries, so walk what is
    // rendered rather than a fixed set of names that need not all be there.
    const filterButtons = page.locator('main button[aria-pressed]');
    await expect(filterButtons.first()).toHaveText(/^All$/i);
    const categories = (await filterButtons.allTextContents()).slice(1).map((t) => t.trim());
    expect(categories.length).toBeGreaterThan(0);

    const allCount = await articles.count();
    expect(allCount).toBeGreaterThan(0);
    await expect(emptyState).toHaveCount(0);

    let selected = 0;
    for (const category of categories) {
      const button = page.getByRole('button', { name: new RegExp(`^${category}$`, 'i') });
      await button.click();

      // count() does not retry, so read it only once the click has demonstrably
      // landed. These specs run against `next dev`, where hydration can trail
      // the load event; a click that arrives before it is swallowed, and the
      // unfiltered count read in its place would surface much later as a bogus
      // count mismatch instead of the timing miss it actually was.
      await expect(button).toHaveAttribute('aria-pressed', 'true');

      const count = await articles.count();
      selected += count;

      // The row advertises this category, so it has to lead somewhere, and the
      // empty state has to stay away. Only that direction is observable from
      // this page: no button is rendered for a category with no flyers, so the
      // empty state cannot be reached here at all.
      expect(count, `the "${category}" filter is a dead end`).toBeGreaterThan(0);
      await expect(emptyState).toHaveCount(0);
    }

    // Each flyer carries exactly one category, so the filtered views should
    // partition the feed. Weaker than it looks, and deliberately kept anyway:
    // the walk covers only the categories currently present, so on a
    // single-category feed this compares the feed to itself and a filter that
    // stopped excluding would still pass. It catches an over-counting filter
    // the moment the gym runs more than one kind of announcement, and the
    // component test carries the exclusion guarantee in the meantime.
    expect(selected).toBe(allCount);
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
