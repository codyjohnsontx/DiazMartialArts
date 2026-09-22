/**
 * The gym's own time zone. Class times and the end-of-day rule for upcoming
 * events read their wall clock here, so those answers are the same whether the
 * code runs on a Vercel box in UTC, on a laptop in Chicago, or in a visitor's
 * browser anywhere else.
 *
 * The arithmetic below is written against a named zone rather than this one,
 * because a calendar feed names its own zone per event and that wall time has
 * to be resolved by the same rules. Everything the gym's own clock answers goes
 * through the school-zone pair at the bottom of the file.
 */
export const SCHOOL_TIME_ZONE = 'America/Chicago';

const clocks = new Map<string, Intl.DateTimeFormat>();

function clockIn(timeZone: string): Intl.DateTimeFormat {
  const cached = clocks.get(timeZone);
  if (cached) return cached;

  const clock = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  clocks.set(timeZone, clock);
  return clock;
}

/**
 * Whether this runtime's Intl knows the zone. Callers that take a zone name
 * from outside the codebase - a calendar feed's TZID - ask first, because
 * `Intl.DateTimeFormat` throws on a name it does not know and one bad event
 * would otherwise take the whole feed down with it.
 */
export function isSupportedTimeZone(timeZone: string): boolean {
  try {
    clockIn(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** A zone's wall clock at an instant. `weekday` is 0 for Sunday, as `getDay`. */
function readClock(timeZone: string, instant: number) {
  const parts = clockIn(timeZone).formatToParts(new Date(instant));
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const year = read('year');
  const month = read('month');
  const day = read('day');

  return {
    year,
    month,
    day,
    hour: read('hour'),
    minute: read('minute'),
    second: read('second'),
    weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
  };
}

/** The gym's wall clock at an instant. `weekday` is 0 for Sunday, as `getDay`. */
export function readSchoolClock(instant: number) {
  return readClock(SCHOOL_TIME_ZONE, instant);
}

/**
 * An instant written as ISO 8601 on the gym's clock, with the offset the gym
 * was on: `2026-10-08T19:00:00-05:00`. This is the form schema.org Event
 * dates take. `toISOString` would write the same instant as `...T00:00:00Z`,
 * which is correct but reads as midnight, and a consumer that shows the local
 * time from it needs to know the venue's zone to get back to 7:00 PM.
 */
export function formatSchoolIso(instant: number): string {
  const at = readSchoolClock(instant);
  const offsetMinutes = Math.round(offsetAt(SCHOOL_TIME_ZONE, instant) / 60_000);
  const sign = offsetMinutes < 0 ? '-' : '+';
  const magnitude = Math.abs(offsetMinutes);
  const pad = (value: number) => String(value).padStart(2, '0');

  return (
    `${at.year}-${pad(at.month)}-${pad(at.day)}` +
    `T${pad(at.hour)}:${pad(at.minute)}:${pad(at.second)}` +
    `${sign}${pad(Math.floor(magnitude / 60))}:${pad(magnitude % 60)}`
  );
}

// How far a zone sits from UTC at a given instant, read off the zone itself
// rather than hard-coded, so it follows the zone's own rules.
function offsetAt(timeZone: string, instant: number): number {
  const at = readClock(timeZone, instant);

  return (
    Date.UTC(at.year, at.month - 1, at.day, at.hour, at.minute, at.second) -
    Math.floor(instant / 1000) * 1000
  );
}

/**
 * The instant a wall-clock time occurs in a named zone. `day` may run past the
 * end of the month, as with `Date.UTC`, which is how callers step forward a day.
 *
 * Solving for the offset a second time settles the days that change offset
 * partway through, which is why stepping a day cannot just add 24 hours:
 * 2026-11-01 lasts 25 hours in Chicago and 2026-03-08 lasts 23, so a fixed step
 * lands an hour off on the far side of either.
 *
 * A wall time the clock skips (2:00-2:59 AM on 2026-03-08 in Chicago) never
 * occurs, and solving for it lands an hour early, before times that come earlier
 * that night. It is read on the offset in force before the jump instead, which
 * moves it forward by the gap (2:30 AM becomes 3:30 AM CDT), as the clock itself
 * does. A time the clock repeats in the fall resolves to its first occurrence.
 */
export function wallTimeInZone(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): number {
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  const instant = wall - offsetAt(timeZone, wall - offsetAt(timeZone, wall));
  const offset = offsetAt(timeZone, instant);

  return wall - instant === offset ? instant : wall - offset;
}

/** The instant a wall-clock time occurs at the gym. See `wallTimeInZone`. */
export function schoolWallTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): number {
  return wallTimeInZone(SCHOOL_TIME_ZONE, year, month, day, hour, minute);
}
