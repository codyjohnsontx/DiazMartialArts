import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { WeeklySchedule } from '@/content/schedule';
import { formatCountdown, getScheduleLabel, getUpcomingClassBlocks } from '@/lib/classSchedule';

/**
 * The coming-up card runs in the visitor's browser, so it runs on the visitor's
 * clock. vitest.config.ts pins the suite to America/Chicago, the gym's own zone,
 * and in that zone a rule reading local time and a rule reading the gym's time
 * agree - which is how the card picked classes on the visitor's clock without a
 * test noticing. Every case here runs with the process moved to another zone.
 *
 * Node applies an assignment to `process.env.TZ` straight away, to `Date` and to
 * `Intl` alike. The guard in each `beforeAll` checks that it did, so a runtime
 * that ignored the switch fails here rather than quietly testing Chicago again.
 * The instants are written in UTC so that none of them depends on the zone
 * under test.
 */
const VISITOR_ZONES = ['America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'UTC'];

const pinnedZone = process.env.TZ;

afterAll(() => {
  process.env.TZ = pinnedZone;
});

// A made-up Sunday class, because the real schedule has none and Sunday is the
// day both daylight-saving changes fall on.
const sundayEvening: WeeklySchedule[] = [
  {
    day: 'Sunday',
    classes: [{ time: '7:00-8:00 PM', program: 'Sunday Test Class', coach: 'Test' }],
  },
];

describe.each(VISITOR_ZONES)('coming-up classes for a visitor in %s', (zone) => {
  beforeAll(() => {
    process.env.TZ = zone;
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(zone);
    // 2026-05-26 is CDT (UTC-5) at the gym, and none of these zones is.
    expect(new Date('2026-05-26T17:30:00Z').getTimezoneOffset()).not.toBe(300);
  });

  it("picks the gym's next class, not the visitor's", () => {
    // Tuesday 12:30 PM at the gym, while the noon class is under way. In Los
    // Angeles that is 10:30 AM, before a morning class the gym already started;
    // in Tokyo it is already Wednesday.
    const now = new Date('2026-05-26T17:30:00Z');
    const [next] = getUpcomingClassBlocks(now);

    expect(next).toMatchObject({ day: 'Tuesday', dayOffset: 0, startLabel: '5:00 PM' });
    expect(next.start.toISOString()).toBe('2026-05-26T22:00:00.000Z');
    expect(getScheduleLabel(next)).toBe('Tonight');
    expect(formatCountdown(next.start, now)).toBe('Starts in 4h 30m');
  });

  it('rolls to the next day on the gym calendar late in the evening', () => {
    // Tuesday 11:30 PM at the gym, which is already Wednesday in London and Tokyo.
    const now = new Date('2026-05-27T04:30:00Z');
    const [next] = getUpcomingClassBlocks(now);

    expect(next).toMatchObject({ day: 'Wednesday', dayOffset: 1, startLabel: '7:00 AM' });
    expect(next.start.toISOString()).toBe('2026-05-27T12:00:00.000Z');
    expect(getScheduleLabel(next)).toBe('Tomorrow');
  });

  it('treats the gym morning as today once midnight has passed at the gym', () => {
    // Wednesday 12:30 AM at the gym, while Los Angeles is still on Tuesday.
    const now = new Date('2026-05-27T05:30:00Z');
    const [next] = getUpcomingClassBlocks(now);

    expect(next).toMatchObject({ day: 'Wednesday', dayOffset: 0, startLabel: '7:00 AM' });
    expect(next.start.toISOString()).toBe('2026-05-27T12:00:00.000Z');
    expect(getScheduleLabel(next)).toBe('Today');
  });

  // 2026-11-01 lasts 25 hours at the gym and 2026-03-08 lasts 23. A class after
  // either change keeps its printed time only if the day is stepped on the gym's
  // calendar; adding 24 hours lands it an hour off.
  it('keeps Monday classes at their printed time across the 25-hour day', () => {
    // Saturday 9:00 PM CDT; Monday 7:00 AM is CST.
    const now = new Date('2026-11-01T02:00:00Z');
    const [next] = getUpcomingClassBlocks(now);

    expect(next).toMatchObject({ day: 'Monday', dayOffset: 2, startLabel: '7:00 AM' });
    expect(next.start.toISOString()).toBe('2026-11-02T13:00:00.000Z');
    expect(formatCountdown(next.start, now)).toBe('Starts in 35h');
  });

  it('keeps Monday classes at their printed time across the 23-hour day', () => {
    // Saturday 9:00 PM CST; Monday 7:00 AM is CDT.
    const now = new Date('2026-03-08T03:00:00Z');
    const [next] = getUpcomingClassBlocks(now);

    expect(next).toMatchObject({ day: 'Monday', dayOffset: 2, startLabel: '7:00 AM' });
    expect(next.start.toISOString()).toBe('2026-03-09T12:00:00.000Z');
    expect(formatCountdown(next.start, now)).toBe('Starts in 33h');
  });

  it('places a class on each transition day after the change', () => {
    const [fallBack] = getUpcomingClassBlocks(new Date('2026-11-01T02:00:00Z'), {
      schedule: sundayEvening,
    });
    expect(fallBack).toMatchObject({ day: 'Sunday', dayOffset: 1, startLabel: '7:00 PM' });
    expect(fallBack.start.toISOString()).toBe('2026-11-02T01:00:00.000Z');

    const [springForward] = getUpcomingClassBlocks(new Date('2026-03-08T03:00:00Z'), {
      schedule: sundayEvening,
    });
    expect(springForward).toMatchObject({ day: 'Sunday', dayOffset: 1, startLabel: '7:00 PM' });
    expect(springForward.start.toISOString()).toBe('2026-03-09T00:00:00.000Z');
  });
});
