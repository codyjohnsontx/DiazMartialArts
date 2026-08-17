import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function loadUpcoming() {
  vi.resetModules();
  return import('@/lib/upcoming');
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-01T12:00:00-05:00'));
  delete process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.doUnmock('@/content/upcoming');
});

describe('getUpcomingEvents', () => {
  it('uses fallback content when no ICS URL is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL', '');
    // Mocked rather than leaning on whatever content/upcoming.ts ships today, so
    // this pins the no-ICS path instead of drifting with the hand-maintained list.
    vi.doMock('@/content/upcoming', () => ({
      upcomingItems: [
        { id: 'hand-maintained', title: 'Hand Maintained', start: '2026-05-10T18:00:00-05:00' },
      ],
    }));
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    expect(result.source).toBe('fallback');
    // No feed was even requested, so this is the no-ICS path rather than a feed
    // that returned zero events.
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.events.map((event) => event.id)).toEqual(['hand-maintained']);
  });

  it('keeps the ICS feed in charge whenever the URL is set', async () => {
    // The hand-maintained list must never shadow a configured calendar.
    vi.doMock('@/content/upcoming', () => ({
      upcomingItems: [
        { id: 'hand-maintained', title: 'Hand Maintained', start: '2026-05-10T18:00:00-05:00' },
      ],
    }));
    process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL = 'https://calendar.example/feed.ics';
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:from-feed',
      'SUMMARY:From Feed',
      'DTSTART:20260512T180000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => ics }));
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    expect(result.source).toBe('ics');
    expect(result.events.map((event) => event.id)).toEqual(['from-feed']);
  });

  it('maps fallback content items to dates and clips them to the 60-day window', async () => {
    vi.doMock('@/content/upcoming', () => ({
      upcomingItems: [
        {
          id: 'in-window',
          title: 'In Window',
          start: '2026-05-10T18:00:00-05:00',
          end: '2026-05-10T20:00:00-05:00',
          location: 'Main Mat',
          notes: 'Bring water.',
        },
        {
          id: 'past-window',
          title: 'Past Window',
          start: '2026-08-01T18:00:00-05:00',
        },
      ],
    }));
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    expect(result.source).toBe('fallback');
    expect(result.events.map((event) => event.id)).toEqual(['in-window']);
    expect(result.events[0].start).toBeInstanceOf(Date);
    expect(result.events[0].start.toISOString()).toBe('2026-05-10T23:00:00.000Z');
    expect(result.events[0].end).toBeInstanceOf(Date);
    expect(result.events[0].end?.toISOString()).toBe('2026-05-11T01:00:00.000Z');
    expect(result.events[0]).toMatchObject({
      title: 'In Window',
      location: 'Main Mat',
      notes: 'Bring water.',
    });
  });

  it('keeps an all-day event listed while it is still running', async () => {
    // Now is 2026-05-01T17:00:00Z, so every entry below has already started. An
    // event that is under way is exactly when visitors look it up, so windowing on
    // the start instead of the end would drop all three of the first ones.
    vi.doMock('@/content/upcoming', () => ({
      upcomingItems: [
        {
          id: 'runs-today',
          title: 'Stripe Testing',
          start: '2026-05-01T00:00:00Z',
          allDay: true,
        },
        {
          id: 'mid-span',
          title: 'Camp Weekend',
          start: '2026-04-29T00:00:00Z',
          end: '2026-05-02T00:00:00Z',
          allDay: true,
        },
        {
          id: 'final-day',
          title: 'Belt Testing',
          start: '2026-04-30T00:00:00Z',
          end: '2026-05-01T00:00:00Z',
          allDay: true,
        },
        {
          id: 'ended-yesterday',
          title: 'Old Seminar',
          start: '2026-04-28T00:00:00Z',
          end: '2026-04-30T00:00:00Z',
          allDay: true,
        },
      ],
    }));
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    expect(result.events.map((event) => event.id)).toEqual(['mid-span', 'final-day', 'runs-today']);
  });

  it('keeps a timed event listed until its end time passes', async () => {
    vi.doMock('@/content/upcoming', () => ({
      upcomingItems: [
        {
          id: 'running-now',
          title: 'Open Mat',
          start: '2026-05-01T11:00:00-05:00',
          end: '2026-05-01T13:00:00-05:00',
        },
        {
          id: 'already-finished',
          title: 'Morning Class',
          start: '2026-05-01T06:00:00-05:00',
          end: '2026-05-01T07:00:00-05:00',
        },
      ],
    }));
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    expect(result.events.map((event) => event.id)).toEqual(['running-now']);
  });

  it('runs a timed fallback entry with no end through the end of its day at the gym', async () => {
    // 7:30 PM at the gym, which is already the next day in UTC: a rule anchored in
    // UTC would have dropped tonight's event half an hour ago, and ending it at its
    // own start would have dropped it at 6:00 PM, while it was still running. The
    // suite pins TZ to the gym's zone, but the rule reads the same on a UTC box.
    vi.setSystemTime(new Date('2026-05-01T19:30:00-05:00'));
    vi.doMock('@/content/upcoming', () => ({
      upcomingItems: [
        { id: 'tonight', title: 'Fite Nite', start: '2026-05-01T18:00:00-05:00' },
        { id: 'last-night', title: 'Old Fite Nite', start: '2026-04-30T18:00:00-05:00' },
      ],
    }));
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    expect(result.events.map((event) => event.id)).toEqual(['tonight']);
  });

  it('ends a timed ICS event with no DTEND where it starts', async () => {
    // RFC 5545 gives the feed its own meaning for an absent end, so the fallback
    // rule above must not be applied to it.
    vi.setSystemTime(new Date('2026-05-01T19:30:00-05:00'));
    process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL = 'https://calendar.example/feed.ics';
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:started-at-six',
      'SUMMARY:Started At Six',
      'DTSTART:20260501T230000Z',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:still-to-come',
      'SUMMARY:Still To Come',
      'DTSTART:20260510T230000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => ics }));
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    expect(result.events.map((event) => event.id)).toEqual(['still-to-come']);
  });

  it('carries the all-day flag through from fallback content', async () => {
    vi.doMock('@/content/upcoming', () => ({
      upcomingItems: [
        {
          id: 'all-day',
          title: 'Stripe Testing',
          start: '2026-05-10T00:00:00Z',
          end: '2026-05-11T00:00:00Z',
          allDay: true,
        },
        { id: 'timed', title: 'Seminar', start: '2026-05-12T19:00:00-05:00' },
      ],
    }));
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    expect(result.events.map((event) => event.allDay)).toEqual([true, undefined]);
  });

  it('treats a date-only ICS DTSTART as an all-day event', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL = 'https://calendar.example/feed.ics';
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:all-day',
      'SUMMARY:All Day Event',
      'DTSTART;VALUE=DATE:20260510',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:timed',
      'SUMMARY:Timed Event',
      'DTSTART:20260512T180000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => ics }));
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    expect(result.events.map((event) => [event.id, event.allDay])).toEqual([
      ['all-day', true],
      ['timed', undefined],
    ]);
    // Anchored in UTC, not the server's zone, so the printed day never shifts.
    expect(result.events[0].start.toISOString()).toBe('2026-05-10T00:00:00.000Z');
  });

  it('reads a date-only ICS DTEND as the last day the event runs', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL = 'https://calendar.example/feed.ics';
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:one-day',
      'SUMMARY:One Day',
      'DTSTART;VALUE=DATE:20260510',
      'DTEND;VALUE=DATE:20260511',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:two-day',
      'SUMMARY:Two Day',
      'DTSTART;VALUE=DATE:20260512',
      'DTEND;VALUE=DATE:20260514',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => ics }));
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    // A date-only DTEND is exclusive per RFC 5545, so a one-day event ends on the
    // day it starts and a 12-13 event ends on the 13th. Taking it literally would
    // have the card announce a day the school never published.
    expect(result.events.map((event) => [event.id, event.end?.toISOString()])).toEqual([
      ['one-day', '2026-05-10T00:00:00.000Z'],
      ['two-day', '2026-05-13T00:00:00.000Z'],
    ]);
  });

  it('parses, sorts, and limits events from an ICS feed', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL = 'https://calendar.example/feed.ics';
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:later',
      'SUMMARY:Later Event',
      'DTSTART:20260520T180000Z',
      'DTEND:20260520T190000Z',
      'LOCATION:Main Mat',
      'DESCRIPTION:Bring water\\nand gear.',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:earlier',
      'SUMMARY:Earlier Event',
      'DTSTART:20260510T150000Z',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:past',
      'SUMMARY:Past Event',
      'DTSTART:20260401T150000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => ics,
      }),
    );
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    expect(result.source).toBe('ics');
    expect(result.events.map((event) => event.id)).toEqual(['earlier', 'later']);
    expect(result.events[1]).toMatchObject({
      title: 'Later Event',
      location: 'Main Mat',
      notes: 'Bring water\nand gear.',
    });
  });

  it('falls back when the ICS request is not OK', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL = 'https://calendar.example/feed.ics';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    expect(result.source).toBe('fallback');
  });
});
