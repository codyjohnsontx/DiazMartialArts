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
