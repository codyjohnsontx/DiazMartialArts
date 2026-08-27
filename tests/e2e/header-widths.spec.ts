import { test, expect, type Page } from '@playwright/test';

/**
 * The header used to turn its desktop navigation on at `md` (768px) while the
 * six nav labels plus the call to action needed 892px, so every page scrolled
 * sideways across the whole of tablet portrait - 768 on the classic iPad, 820
 * on the Air, 834 on the Pro. The nav is now held back to `lg` (1024px), which
 * is also where the header's own `lg:gap-8 lg:px-8` spacing steps up, so the
 * desktop header appears under exactly one spacing regime instead of two.
 *
 * These tests measure the condition that defines the bug - scrollWidth against
 * clientWidth - rather than reading the Tailwind classes back, because a class
 * whose value misses its theme scale emits no CSS at all and would still read
 * correct. Both boundaries are pinned: move the breakpoint down and the tablet
 * widths overflow, move it up and 1024 loses its desktop nav.
 */

// This spec drives the viewport itself, so the configured project viewports are
// irrelevant and running it under both would just do the same work twice.
test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name === 'Mobile', 'This spec sets its own viewports.');
});

/** Widths that get the hamburger and used to overflow. */
const TABLET_WIDTHS = [768, 800, 820, 834, 891, 1023];

/** Widths whose header rendering must not have moved. */
const UNCHANGED_WIDTHS = [320, 375, 390, 767, 1024, 1440];

/** The header is shared but page content is not, so this checks several. */
const PATHS = ['/', '/programs', '/schedule', '/coaches', '/contact'];

async function measure(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    // The flex row inside <header> is what the nav overflows; measuring it
    // separately keeps this guard blind to unrelated page-content overflow.
    const row = document.querySelector('header > div') as HTMLElement;
    return {
      docScrollWidth: doc.scrollWidth,
      docClientWidth: doc.clientWidth,
      headerScrollWidth: row.scrollWidth,
      headerClientWidth: row.clientWidth,
    };
  });
}

test.describe('Header fits its viewport', () => {
  for (const width of [...TABLET_WIDTHS, ...UNCHANGED_WIDTHS]) {
    test(`header row does not overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of PATHS) {
        await page.goto(path);
        const m = await measure(page);
        expect(
          m.headerScrollWidth,
          `header row overflows at ${width}px on ${path}`,
        ).toBeLessThanOrEqual(m.headerClientWidth);
      }
    });
  }

  /**
   * The document-level assertion, which is what a visitor actually feels. It is
   * scoped to the tablet band on purpose: at 320-390 two pages overflow for
   * reasons that have nothing to do with the header - the /announcements h1 is
   * one unbreakable word wider than the viewport, and the home page's next-class
   * card overflows below about 331px. Widening this loop before those are fixed
   * would fail for reasons this guard is not about.
   */
  for (const width of TABLET_WIDTHS) {
    test(`page does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of PATHS) {
        await page.goto(path);
        const m = await measure(page);
        expect(m.docScrollWidth, `${path} scrolls sideways at ${width}px`).toBe(m.docClientWidth);
      }
    });
  }
});

test.describe('Which navigation each width gets', () => {
  const toggle = (page: Page) => page.getByRole('button', { name: 'Toggle menu' });
  const desktopNav = (page: Page) => page.getByRole('navigation', { name: 'Primary' });

  for (const width of TABLET_WIDTHS) {
    test(`${width}px gets the menu button, not the desktop nav`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(toggle(page)).toBeVisible();
      await expect(desktopNav(page)).toBeHidden();
    });
  }

  // The upper boundary. Without this the guard would be satisfied by pushing the
  // breakpoint to `xl`, which would take the desktop nav away from laptops.
  test('1024px still gets the desktop nav, not the menu button', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto('/');
    await expect(desktopNav(page)).toBeVisible();
    await expect(toggle(page)).toBeHidden();
  });

  // The lower boundary, unchanged by this fix but worth pinning alongside it.
  test('767px still gets the menu button', async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 900 });
    await page.goto('/');
    await expect(toggle(page)).toBeVisible();
    await expect(desktopNav(page)).toBeHidden();
  });
});

/**
 * tests/e2e/mobile-nav.spec.ts already exercises this menu at 390px. Tablet
 * portrait is a new audience for it, so the same contract is re-run at 834px
 * rather than assumed to carry over.
 */
test.describe('The menu works at tablet portrait', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await page.goto('/');
  });

  test('opens, closes, and reopens', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-nav')).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('Escape closes it', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await toggle.click();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('a link navigates and closes the menu behind it', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page.locator('#mobile-nav').getByRole('link', { name: 'Coaches' }).click();
    await expect(page).toHaveURL('/coaches');
    await expect(page.getByRole('button', { name: 'Toggle menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
