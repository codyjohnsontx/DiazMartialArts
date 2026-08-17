import { expect, test } from '@playwright/test';

import { upcomingItems } from '../../content/upcoming';
import { isWithinUpcomingWindow, toUpcomingEvent } from '../../lib/upcoming';

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
    for (const item of inWindow.slice(0, 4)) {
      await expect(section.getByText(item.title, { exact: true })).toBeVisible();
    }
  });
});
