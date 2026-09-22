import { type UpcomingItem, upcomingItems } from '@/content/upcoming';
import { getPublicEnv } from '@/lib/env';
import {
  isSupportedTimeZone,
  readSchoolClock,
  SCHOOL_TIME_ZONE,
  schoolWallTime,
  wallTimeInZone,
} from '@/lib/schoolTime';

export type UpcomingEvent = {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  location?: string;
  notes?: string;
  /** The price in US dollars, when one is known. See `UpcomingItem.priceUsd`. */
  priceUsd?: number;
  /**
   * True when the source gives a date but no clock time, so callers render the
   * date span instead of the midnight that `start` would otherwise imply.
   */
  allDay?: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How far ahead /schedule looks. Exported so everything that states the figure -
 * the page's metadata description, the "Next N days" eyebrow it hands the
 * component, and the content staleness guard - reads this one number instead of
 * each hand-copying it and drifting.
 */
export const UPCOMING_WINDOW_DAYS = 60;
const MAX_ITEMS = 15;

/**
 * How many events /schedule shows. The page cuts the list here before handing
 * it to both the card grid and the Event markup, so the markup describes only
 * events a reader can see on the page.
 */
export const MAX_SHOWN_EVENTS = 4;

function endOfSchoolDay(start: Date): number {
  const at = readSchoolClock(start.getTime());

  return schoolWallTime(at.year, at.month, at.day + 1) - 1;
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

// RFC 5545 spells a DATE-TIME's zone in two places, and both live outside the
// value: a trailing Z means UTC, and a TZID parameter on the property names the
// zone the wall time is written in. A value with neither is floating wall time,
// which for this calendar means the gym's clock - as does a TZID this runtime
// cannot resolve, since the alternative is dropping the whole feed. Reading any
// of them with the server's own zone is what turned a 7:00 PM Central event
// into 2:00 PM on a Vercel box in UTC.
function parseIcsDate(raw: string, timeZone?: string): Date | null {
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

  const zone = timeZone && isSupportedTimeZone(timeZone) ? timeZone : SCHOOL_TIME_ZONE;
  return new Date(wallTimeInZone(zone, year, month + 1, day, hour, minute, second));
}

// The zone a property's value is written in, as named by its own parameters.
// The name goes to Intl exactly as the feed wrote it, and anything Intl cannot
// resolve falls back to the gym's clock in parseIcsDate.
function icsTimeZone(params: string): string | undefined {
  return /(?:^|;)TZID=([^;]*)/i.exec(params)?.[1];
}

// A date-only DTEND is exclusive per RFC 5545, and Google Calendar exports a
// one-day all-day event as DTEND = the following day. content/upcoming.ts instead
// writes `end` as the last day the event runs, so normalise the feed to that and
// both sources mean the same thing by the same field.
function parseIcsEnd(raw: string, start: Date, timeZone?: string): Date | undefined {
  const parsed = parseIcsDate(raw, timeZone);
  if (!parsed) return undefined;
  if (!/^\d{8}$/.test(raw)) return parsed;

  const lastDay = new Date(parsed.getTime() - DAY_MS);
  return lastDay < start ? undefined : lastDay;
}

function parseIcs(icsText: string): UpcomingEvent[] {
  const lines = unfoldIcsLines(icsText);
  const events: UpcomingEvent[] = [];

  let inEvent = false;
  // A VEVENT may contain components of its own, and their properties are not
  // the event's: Google Calendar nests a VALARM in every event carrying a
  // reminder, whose DESCRIPTION is the reminder text and whose SUMMARY, on an
  // email reminder, is the reminder's subject. Collected flat they would win by
  // being last, and the card would print the reminder in place of the event.
  let nested = 0;
  let raw: Record<string, string> = {};
  let params: Record<string, string> = {};

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      nested = 0;
      raw = {};
      params = {};
      continue;
    }

    if (!inEvent) continue;

    if (line.startsWith('BEGIN:')) {
      nested += 1;
      continue;
    }

    if (line.startsWith('END:') && line !== 'END:VEVENT') {
      if (nested > 0) nested -= 1;
      continue;
    }

    if (line === 'END:VEVENT' && nested === 0) {
      inEvent = false;
      const start = parseIcsDate(raw.DTSTART || '', icsTimeZone(params.DTSTART || ''));
      if (!start) continue;

      // A date-only DTSTART (VALUE=DATE) is how ICS spells an all-day event.
      const allDay = /^\d{8}$/.test(raw.DTSTART || '');
      // Per RFC 5545 a DATE-TIME DTSTART with no DTEND is an event that ends where
      // it starts, so say so here. A hand-written entry means something else by an
      // absent end - see endsAt - and spelling the feed's meaning out at the parse
      // site keeps the two sources from having to share one default.
      const end =
        parseIcsEnd(raw.DTEND || '', start, icsTimeZone(params.DTEND || '')) ??
        (allDay ? undefined : start);
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

    if (nested > 0) continue;

    const sepIdx = line.indexOf(':');
    if (sepIdx <= 0) continue;

    const property = line.slice(0, sepIdx);
    const paramIdx = property.indexOf(';');
    const key = paramIdx < 0 ? property : property.slice(0, paramIdx);
    const value = line
      .slice(sepIdx + 1)
      .replace(/\\n/g, '\n')
      .trim();

    if (key) {
      raw[key] = value;
      params[key] = paramIdx < 0 ? '' : property.slice(paramIdx + 1);
    }
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
    priceUsd: item.priceUsd,
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
