import { type UpcomingItem, upcomingItems } from '@/content/upcoming';
import { getPublicEnv } from '@/lib/env';

export type UpcomingEvent = {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  location?: string;
  notes?: string;
  /**
   * True when the source gives a date but no clock time, so callers render the
   * date span instead of the midnight that `start` would otherwise imply.
   */
  allDay?: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How far ahead /schedule looks. Exported so the content staleness guard and the
 * end-to-end test describe the same window the page renders instead of each
 * recomputing it and drifting.
 */
export const UPCOMING_WINDOW_DAYS = 60;
const MAX_ITEMS = 15;

/**
 * The gym's own time zone. An entry that runs through the end of a day ends when
 * that day is over *here*, so the rule reads the same whether the page renders on
 * a Vercel box in UTC or on a laptop in Chicago.
 */
const SCHOOL_TIME_ZONE = 'America/Chicago';

const schoolClock = new Intl.DateTimeFormat('en-US', {
  timeZone: SCHOOL_TIME_ZONE,
  hourCycle: 'h23',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function endOfSchoolDay(start: Date): number {
  const parts = schoolClock.formatToParts(start);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const sinceMidnight =
    ((read('hour') * 60 + read('minute')) * 60 + read('second')) * 1000 +
    start.getUTCMilliseconds();

  return start.getTime() + DAY_MS - sinceMidnight - 1;
}

// An all-day entry is a floating calendar date stored as UTC midnight, so its day
// is read back in UTC and then closed out on the gym's clock. Midday UTC lands
// inside that same calendar date in the school's zone whichever side of a DST
// change it falls on, which is what lets both kinds of entry share one rule for
// the end of a day instead of keeping two in step.
function endOfSchoolDayOnDateOf(floating: Date): number {
  const midday = Date.UTC(
    floating.getUTCFullYear(),
    floating.getUTCMonth(),
    floating.getUTCDate(),
    12,
  );

  return endOfSchoolDay(new Date(midday));
}

function unfoldIcsLines(content: string): string[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const unfolded: string[] = [];

  for (const line of lines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.slice(1);
    } else {
      unfolded.push(line);
    }
  }

  return unfolded;
}

function parseIcsDate(raw: string): Date | null {
  if (!raw) return null;

  // A date-only value is a floating calendar date, not an instant, so anchor it
  // in UTC and render it in UTC. Building it in server-local time would shift the
  // printed day for viewers in another zone.
  if (/^\d{8}$/.test(raw)) {
    const year = Number(raw.slice(0, 4));
    const month = Number(raw.slice(4, 6)) - 1;
    const day = Number(raw.slice(6, 8));
    return new Date(Date.UTC(year, month, day, 0, 0, 0));
  }

  const clean = raw.replace(/Z$/, '');
  if (!/^\d{8}T\d{6}$/.test(clean)) return null;

  const year = Number(clean.slice(0, 4));
  const month = Number(clean.slice(4, 6)) - 1;
  const day = Number(clean.slice(6, 8));
  const hour = Number(clean.slice(9, 11));
  const minute = Number(clean.slice(11, 13));
  const second = Number(clean.slice(13, 15));

  if (raw.endsWith('Z')) {
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }

  return new Date(year, month, day, hour, minute, second);
}

// A date-only DTEND is exclusive per RFC 5545, and Google Calendar exports a
// one-day all-day event as DTEND = the following day. content/upcoming.ts instead
// writes `end` as the last day the event runs, so normalise the feed to that and
// both sources mean the same thing by the same field.
function parseIcsEnd(raw: string, start: Date): Date | undefined {
  const parsed = parseIcsDate(raw);
  if (!parsed) return undefined;
  if (!/^\d{8}$/.test(raw)) return parsed;

  const lastDay = new Date(parsed.getTime() - DAY_MS);
  return lastDay < start ? undefined : lastDay;
}

function parseIcs(icsText: string): UpcomingEvent[] {
  const lines = unfoldIcsLines(icsText);
  const events: UpcomingEvent[] = [];

  let inEvent = false;
  let raw: Record<string, string> = {};

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      raw = {};
      continue;
    }

    if (line === 'END:VEVENT' && inEvent) {
      inEvent = false;
      const start = parseIcsDate(raw.DTSTART || '');
      if (!start) continue;

      // A date-only DTSTART (VALUE=DATE) is how ICS spells an all-day event.
      const allDay = /^\d{8}$/.test(raw.DTSTART || '');
      // Per RFC 5545 a DATE-TIME DTSTART with no DTEND is an event that ends where
      // it starts, so say so here. A hand-written entry means something else by an
      // absent end - see endsAt - and spelling the feed's meaning out at the parse
      // site keeps the two sources from having to share one default.
      const end = parseIcsEnd(raw.DTEND || '', start) ?? (allDay ? undefined : start);
      events.push({
        id: raw.UID || `${raw.SUMMARY || 'event'}-${start.toISOString()}`,
        title: raw.SUMMARY || 'Untitled Event',
        start,
        end,
        location: raw.LOCATION || undefined,
        notes: raw.DESCRIPTION || undefined,
        allDay: allDay || undefined,
      });
      continue;
    }

    if (!inEvent) continue;

    const sepIdx = line.indexOf(':');
    if (sepIdx <= 0) continue;

    const key = line.slice(0, sepIdx).split(';')[0];
    const value = line
      .slice(sepIdx + 1)
      .replace(/\\n/g, '\n')
      .trim();

    if (key) raw[key] = value;
  }

  return events;
}

export function toUpcomingEvent(item: UpcomingItem): UpcomingEvent {
  return {
    id: item.id,
    title: item.title,
    start: new Date(item.start),
    end: item.end ? new Date(item.end) : undefined,
    location: item.location,
    notes: item.notes,
    allDay: item.allDay,
  };
}

// One rule for when an event is over: it runs through the end of its last day at
// the gym, unless a timed entry names an end instant of its own. An all-day entry's
// `end` is the last calendar day it runs, and an entry with no `end` at all lasts
// through the day it starts on - a flyer that printed a start time and no end would
// otherwise vanish from the page the moment the event began, and an all-day one
// would vanish during the evening of its own final day.
function endsAt(event: UpcomingEvent): number {
  if (event.allDay) {
    return endOfSchoolDayOnDateOf(event.end ?? event.start);
  }

  return event.end ? event.end.getTime() : endOfSchoolDay(event.start);
}

export function hasUpcomingEventEnded(event: UpcomingEvent, now: Date = new Date()): boolean {
  return endsAt(event) < now.getTime();
}

/**
 * The rule /schedule renders: an event is listed while it has not finished yet and
 * starts inside the forward window. Windowing on the end rather than the start is
 * what keeps an event that is under way from vanishing on the very days it runs.
 */
export function isWithinUpcomingWindow(event: UpcomingEvent, now: Date = new Date()): boolean {
  const horizon = now.getTime() + UPCOMING_WINDOW_DAYS * DAY_MS;
  return !hasUpcomingEventEnded(event, now) && event.start.getTime() <= horizon;
}

function filterWindow(events: UpcomingEvent[]): UpcomingEvent[] {
  const now = new Date();

  return events
    .filter((event) => isWithinUpcomingWindow(event, now))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, MAX_ITEMS);
}

function fallbackUpcoming(): UpcomingEvent[] {
  return filterWindow(upcomingItems.map(toUpcomingEvent));
}

export async function getUpcomingEvents(): Promise<{
  source: 'ics' | 'fallback';
  events: UpcomingEvent[];
}> {
  const { googleCalendarIcsUrl: icsUrl } = getPublicEnv();

  if (!icsUrl) {
    return { source: 'fallback', events: fallbackUpcoming() };
  }

  try {
    const response = await fetch(icsUrl, {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return { source: 'fallback', events: fallbackUpcoming() };
    }

    const icsText = await response.text();
    const parsed = parseIcs(icsText);
    const filtered = filterWindow(parsed);
    return { source: 'ics', events: filtered };
  } catch {
    return { source: 'fallback', events: fallbackUpcoming() };
  }
}
