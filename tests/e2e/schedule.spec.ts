import { expect, test } from '@playwright/test';

import { upcomingItems } from '../../content/upcoming';
import { isWithinUpcomingWindow, MAX_SHOWN_EVENTS, toUpcomingEvent } from '../../lib/upcoming';

test.describe('Schedule page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/schedule');
  });

  test('renders the weekly class schedule heading and day tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Weekly class schedule/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Monday schedule' })).toBeVisible();
  });

  test('renders the upcoming events section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Upcoming events/i })).toBeVisible();
  });

  // The live defect this covers: the section showed its empty state while the
  // school had events on. Reading the shipped list keeps the check honest as the
  // calendar changes, instead of hard-coding an event that expires.
  test('shows the events it ships, and the empty state only when it ships none', async ({
    page,
  }) => {
    // This pins the hand-maintained fallback, and the server picks the ICS feed
    // over it whenever that variable is set. The env belongs to the server process
    // rather than this test, so skip instead of asserting against a source the
    // page is not reading.
    test.skip(
      Boolean(process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL?.trim()),
      'NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL is set, so /schedule renders the feed rather than content/upcoming.ts',
    );

    // Asks lib/upcoming.ts which entries the page keeps, and sorts the way the page
    // does, so the expectation cannot disagree with what is actually rendered.
    const inWindow = upcomingItems
      .filter((item) => isWithinUpcomingWindow(toUpcomingEvent(item)))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const section = page
      .getByRole('heading', { name: /Upcoming events/i })
      .locator('xpath=ancestor::section[1]');
    const emptyState = section.getByText(/No special events on the calendar right now/i);

    if (inWindow.length === 0) {
      await expect(emptyState).toBeVisible();
      return;
    }

    await expect(emptyState).toHaveCount(0);
    for (const item of inWindow.slice(0, MAX_SHOWN_EVENTS)) {
      await expect(section.getByText(item.title, { exact: true })).toBeVisible();
    }
  });
});

/**
 * Every class time on the page is a start, on one line.
 *
 * Each row's time cell is a fixed grid track so the rows' columns line up, and
 * a fixed track cannot grow for its content, so what goes in it has to fit.
 * The cell printed the whole range ("7:00-8:00 AM"): the start-time extractor
 * looked for `7:00 AM` at the front of the string, content/schedule.ts writes
 * the period once at the end of the range so that matched no entry, and the
 * fallback was the raw string. The range is wider than the track at every
 * width, so every row wrapped "7:00-8:00" over "AM" - on the live site at
 * 1440px as much as on a phone. The cell now prints the start through
 * `formatClassStart` with `whitespace-nowrap`, and the end of the range is what
 * the duration column beside it is for.
 *
 * Line boxes rather than a pixel width: `Range.getClientRects()` returns one
 * rect per line a text run occupies, which the platform's text shaping cannot
 * move, where the width at which a wrap happens is machine-local (see
 * tests/e2e/header-widths.spec.ts). The scroll relation says the label did not
 * stay on one line by being clipped, and the shape of the text says the cell
 * is a start with its period rather than a range that happened to fit.
 *
 * The page always opens on Monday, which carries the widest labels the week
 * has ("10:00 AM", "11:00 AM", "12:00 PM"), so no tab is clicked: a click
 * before hydration is swallowed under `next dev`, and the test would then
 * measure a day other than the one it named.
 */
test.describe('Class times on the schedule page', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'Mobile', 'This spec sets its own viewports.');
  });

  for (const width of [320, 768, 1440]) {
    test(`every row shows its start time on one line at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/schedule');
      const cells = page.locator('details > summary > div:first-child');
      await expect(cells.first()).toBeVisible();
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      const measured = await cells.evaluateAll((els) =>
        els.map((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return {
            text: el.textContent?.trim() ?? '',
            lineBoxes: range.getClientRects().length,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
          };
        }),
      );
      expect(measured.length).toBeGreaterThan(0);
      for (const cell of measured) {
        expect(cell.text, 'a time cell prints something other than a start and its period').toMatch(
          /^\d{1,2}:\d{2} (AM|PM)$/,
        );
        expect(cell.lineBoxes, `"${cell.text}" breaks across lines at ${width}px`).toBe(1);
        // The client width is read first because a box reporting 0 would
        // compare equal to anything and the relation could not fail.
        expect(cell.clientWidth, 'the time cell has no layout box to measure').toBeGreaterThan(0);
        expect(cell.scrollWidth, `"${cell.text}" is clipped at ${width}px`).toBeLessThanOrEqual(
          cell.clientWidth,
        );
      }
    });
  }
});
