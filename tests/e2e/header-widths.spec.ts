import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * The header used to turn its desktop navigation on at `md` (768px) while the
 * six nav labels plus the call to action needed far more room, so every page
 * scrolled sideways across the whole of tablet portrait - 768 on the classic
 * iPad, 820 on the Air, 834 on the Pro.
 *
 * The desktop header is now gated at `min-[1035px]`, a measured number rather
 * than the next Tailwind size up. 1035px is where the row reaches its natural
 * width; below it the flex row shrinks until "Book Free Trial" wraps onto a
 * second line, which no overflow assertion catches, because a squeezed button
 * is not an overflowing one. That is how the same mistake survived twice - at
 * 892px, where the document stopped overflowing only once the button had been
 * crushed into three lines, and again at `lg`, which fixed the tablets but left
 * 1024-1034 rendering a two-line button.
 *
 * These tests measure the conditions that define both bugs - scrollWidth
 * against clientWidth, and how many lines the call to action occupies - rather
 * than reading the Tailwind classes back, because a class whose value misses
 * its theme scale emits no CSS at all and would still read correct. Both
 * boundaries are pinned: move the breakpoint down and the widths below it wrap
 * or overflow, move it up and 1035 loses its desktop header.
 *
 * Every width below was measured under overlay scrollbars, which is what
 * headless Chromium and macOS give you, and that omits one case. A media query
 * is evaluated against `window.innerWidth`, which counts a classic scrollbar,
 * while the row lays out in `documentElement.clientWidth`, which does not, so
 * on a classic-scrollbar platform a window of 1035-1049 turns the desktop
 * header on with only 1020-1034px to lay it out in and the call to action wraps
 * again. That residual is known and accepted; these numbers do not cover it.
 */

// This spec drives the viewport itself, so the configured project viewports are
// irrelevant and running it under both would just do the same work twice.
test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name === 'Mobile', 'This spec sets its own viewports.');
});

/** Widths that get the menu button, and used to overflow or wrap. */
const TABLET_WIDTHS = [768, 800, 820, 834, 891, 1023, 1024, 1034];

/** Widths whose header rendering must not have moved. */
const UNCHANGED_WIDTHS = [320, 375, 390, 767, 1035, 1440];

/** The header is shared but page content is not, so this checks several. */
const PATHS = ['/', '/programs', '/schedule', '/coaches', '/contact'];

async function measure(page: Page) {
  return page.evaluate(async () => {
    // Every assertion here is text-metric-driven and the 320px row clears the
    // viewport by only a few pixels, so measuring before Manrope has swapped in
    // would size the header off the fallback font's metrics instead.
    await document.fonts.ready;
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
  const desktopCta = (page: Page) =>
    page.locator('header > div').first().getByRole('link', { name: 'Book Free Trial' });

  for (const width of TABLET_WIDTHS) {
    test(`${width}px gets the menu button, not the desktop nav`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(toggle(page)).toBeVisible();
      await expect(desktopNav(page)).toBeHidden();
      // The desktop call to action is gated separately from the nav, so a
      // regression on that one spot alone would otherwise slip through: it
      // would show a menu button and a desktop button side by side.
      await expect(desktopCta(page)).toBeHidden();
    });
  }

  // The upper boundary. Without this the guard would be satisfied by pushing the
  // breakpoint higher still, which would take the desktop header away from the
  // laptops it fits on.
  test('1035px gets the desktop header, not the menu button', async ({ page }) => {
    await page.setViewportSize({ width: 1035, height: 900 });
    await page.goto('/');
    await expect(desktopNav(page)).toBeVisible();
    await expect(desktopCta(page)).toBeVisible();
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

/**
 * Gating the desktop nav on `min-[1035px]` lays the mobile panel out across
 * 768-1034 too, where `md:hidden` used to take it out of the flow entirely.
 * `pointer-events-none max-h-0 opacity-0` hides the closed panel from the eye
 * and the mouse but not from the keyboard - neither opacity nor max-height
 * removes a link from the tab order - so without `invisible` a keyboard visitor
 * tabbing off the menu button lands in six invisible nav links and the call to
 * action, on every page. Both directions are pinned: closed must be
 * unreachable, open must be reachable, or "nothing is focusable" would pass.
 */
test.describe('The closed menu stays out of the keyboard path', () => {
  const TABS = 8;

  const focusIsInsidePanel = (page: Page) =>
    page.evaluate(() => {
      const panel = document.getElementById('mobile-nav');
      return Boolean(panel && document.activeElement && panel.contains(document.activeElement));
    });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 1000 });
    await page.goto('/');
  });

  test('tabbing off the menu button never enters the closed panel', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.focus();

    for (let i = 1; i <= TABS; i += 1) {
      await page.keyboard.press('Tab');
      expect(
        await focusIsInsidePanel(page),
        `focus entered the closed menu panel after ${i} tab(s)`,
      ).toBe(false);
    }
  });

  test('tabbing off the menu button does reach the open panel', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await toggle.focus();

    let reached = false;
    for (let i = 0; i < TABS && !reached; i += 1) {
      await page.keyboard.press('Tab');
      reached = await focusIsInsidePanel(page);
    }
    expect(reached, `focus never reached the open menu panel within ${TABS} tabs`).toBe(true);
  });
});

/**
 * The width the desktop header switches on at has to come from the width it
 * actually needs. Measured on the rendered page: the header row reaches its
 * natural size at 1035px, and below that the flex row shrinks "Book Free
 * Trial" until the label wraps onto a second line - 56px tall instead of 38.
 * No overflow assertion catches that, because a button squeezed into two lines
 * is not an overflowing one, which is exactly how the same mistake survived one
 * breakpoint lower at 892px. So the desktop header is gated at `min-[1035px]`
 * rather than at `lg`, and this pins the property that number was chosen for.
 */
test.describe('The call to action never renders wrapped', () => {
  const CTA_WIDTHS = [768, 834, 1023, 1024, 1034, 1035, 1036, 1100, 1280, 1440];

  /** Sitting on its own line is the observable form of "the header fits". */
  const lineCount = (control: Locator) =>
    control.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getClientRects().length;
    });

  for (const width of CTA_WIDTHS) {
    test(`no visible Book Free Trial control wraps at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);

      const visible = page.getByRole('link', { name: 'Book Free Trial' });
      for (const control of await visible.all()) {
        if (!(await control.isVisible())) continue;
        expect(
          await lineCount(control),
          `"Book Free Trial" wrapped onto more than one line at ${width}px`,
        ).toBe(1);
      }
    });
  }

  /**
   * The counterweight. Without this the loop above would be satisfied by a
   * header that shows no call to action at all, at any width.
   */
  for (const width of [1035, 1100, 1440]) {
    test(`the desktop call to action is shown and unwrapped at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);

      const cta = page.locator('header > div').first().getByRole('link', {
        name: 'Book Free Trial',
      });
      await expect(cta).toBeVisible();
      expect(await lineCount(cta)).toBe(1);
    });
  }
});
