import { describe, expect, it } from 'vitest';

import { upcomingItems } from '@/content/upcoming';
import {
  hasUpcomingEventEnded,
  isWithinUpcomingWindow,
  toUpcomingEvent,
  UPCOMING_WINDOW_DAYS,
} from '@/lib/upcoming';

const DAY_MS = 24 * 60 * 60 * 1000;

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
        'reach /schedule. Replace them, or empty the list to choose the deliberate ' +
        'empty state - the maintenance comment in content/upcoming.ts owns the rules ' +
        'for choosing between those.',
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

  // An all-day entry is a floating calendar date, not an instant: /schedule prints
  // its day with getUTCDate and renders its span with timeZone UTC. Both of the
  // conventions that rests on are invisible in the file itself, so pin them here
  // rather than leaving the next hand-editor to find out from the live page.
  it('anchors every all-day entry at exact UTC midnight', () => {
    for (const item of upcomingItems) {
      if (!item.allDay) continue;

      for (const field of ['start', 'end'] as const) {
        const value = item[field];
        if (!value) continue;

        expect(
          new Date(value).getTime() % DAY_MS,
          `${item.id} has ${field}: '${value}'. An all-day entry is a floating calendar ` +
            "date, so write it as 'YYYY-MM-DDT00:00:00Z' - the trailing Z included, and " +
            'no time of day. Anything else prints a different day for a visitor whose ' +
            'zone is ahead of UTC.',
        ).toBe(0);
      }
    }
  });

  it('flags every midnight-anchored entry as all-day', () => {
    const untagged = upcomingItems.filter(
      (item) => !item.allDay && new Date(item.start).getTime() % DAY_MS === 0,
    );

    expect(
      untagged.map((item) => `${item.id} (${item.start})`),
      'These entries start at exact midnight but are not marked allDay, so /schedule ' +
        'renders them as "12:00 AM" - a class time the school never published. Add ' +
        '`allDay: true` if the flyer printed no time, or write the real time it did.',
    ).toEqual([]);
  });

  it('carries no placeholder entries', () => {
    const placeholders = upcomingItems.filter((item) =>
      /^(fallback|example|placeholder)-/.test(item.id),
    );

    expect(placeholders.map((item) => item.id)).toEqual([]);
  });
});
