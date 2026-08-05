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
});

describe('getUpcomingEvents', () => {
  it('uses fallback content when no ICS URL is configured', async () => {
    const { getUpcomingEvents } = await loadUpcoming();

    const result = await getUpcomingEvents();

    expect(result.source).toBe('fallback');
    expect(result.events.map((event) => event.id)).toEqual(['fallback-3', 'fallback-4']);
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
