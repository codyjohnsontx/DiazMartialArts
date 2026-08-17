import { describe, expect, it } from 'vitest';

import { upcomingItems } from '@/content/upcoming';
import {
  hasUpcomingEventEnded,
  isWithinUpcomingWindow,
  toUpcomingEvent,
  UPCOMING_WINDOW_DAYS,
} from '@/lib/upcoming';

// Deliberately runs against the real clock and the real shipped content, unlike
// tests/unit/upcoming.test.ts, which freezes time to exercise lib/upcoming.ts.
// It asks lib/upcoming.ts itself which entries reach the page, so this guard can
// never go red at an instant the live page still renders the event.
//
// content/upcoming.ts is hand-maintained and lib/upcoming.ts drops anything
// outside its forward window, so a list that is merely out of date looks
// exactly like a list that is empty on purpose: /schedule quietly renders "no
// events" either way. That is the bug this guard exists to stop recurring.
//
// An empty list stays legal - that is the documented deliberate empty state. A
// non-empty list that reaches the page as nothing is not: it means nobody
// refreshed the file, and CI should say so instead of the public site telling
// visitors an active gym has nothing scheduled.
describe('content/upcoming.ts staleness guard', () => {
  it('keeps no entry whose event is already over', () => {
    const passed = upcomingItems.filter((item) => hasUpcomingEventEnded(toUpcomingEvent(item)));

    expect(
      passed.map((item) => `${item.id} (${item.start})`),
      'These entries in content/upcoming.ts have already happened, so they no longer ' +
        'reach /schedule. Replace them with events from the current monthly calendar on ' +
        '/announcements, or empty the list to choose the deliberate empty state.',
    ).toEqual([]);
  });

  it('shows at least one event whenever it lists any', () => {
    if (upcomingItems.length === 0) return;

    const visible = upcomingItems.filter((item) => isWithinUpcomingWindow(toUpcomingEvent(item)));

    expect(
      visible.length,
      `content/upcoming.ts lists ${upcomingItems.length} event(s) but /schedule shows none of ` +
        `them: each one is either over or starts more than ${UPCOMING_WINDOW_DAYS} days out, so ` +
        'the section renders its empty state anyway. Add a current event, or empty the list so ' +
        'the empty state is the deliberate choice.',
    ).toBeGreaterThan(0);
  });

  it('gives every entry a real, parseable date', () => {
    for (const item of upcomingItems) {
      expect(Number.isNaN(new Date(item.start).getTime()), `${item.id} start`).toBe(false);
      if (item.end) {
        expect(Number.isNaN(new Date(item.end).getTime()), `${item.id} end`).toBe(false);
      }
    }
  });

  it('carries no placeholder entries', () => {
    const placeholders = upcomingItems.filter((item) =>
      /^(fallback|example|placeholder)-/.test(item.id),
    );

    expect(placeholders.map((item) => item.id)).toEqual([]);
  });
});
