/**
 * The gym's own time zone. Class times and the end-of-day rule for upcoming
 * events read their wall clock here, so those answers are the same whether the
 * code runs on a Vercel box in UTC, on a laptop in Chicago, or in a visitor's
 * browser anywhere else.
 */
export const SCHOOL_TIME_ZONE = 'America/Chicago';

const schoolClock = new Intl.DateTimeFormat('en-US', {
  timeZone: SCHOOL_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** The gym's wall clock at an instant. `weekday` is 0 for Sunday, as `getDay`. */
export function readSchoolClock(instant: number) {
  const parts = schoolClock.formatToParts(new Date(instant));
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

// How far the gym's clock sits from UTC at a given instant, read off the zone
// itself rather than hard-coded, so it follows the zone's own rules.
function schoolOffsetAt(instant: number): number {
  const at = readSchoolClock(instant);

  return (
    Date.UTC(at.year, at.month - 1, at.day, at.hour, at.minute, at.second) -
    Math.floor(instant / 1000) * 1000
  );
}

/**
 * The instant a wall-clock time occurs at the gym. `day` may run past the end of
 * the month, as with `Date.UTC`, which is how callers step forward a day.
 *
 * Solving for the offset a second time settles the days that change offset
 * partway through, which is why stepping a day cannot just add 24 hours:
 * 2026-11-01 lasts 25 hours here and 2026-03-08 lasts 23, so a fixed step lands
 * an hour off on the far side of either.
 *
 * A wall time the clock skips (2:00-2:59 AM on 2026-03-08) never occurs, and
 * solving for it lands an hour early, before times that come earlier that night.
 * It is read on the offset in force before the jump instead, which moves it
 * forward by the gap (2:30 AM becomes 3:30 AM CDT), as the clock itself does. A
 * time the clock repeats in the fall resolves to its first occurrence.
 */
export function schoolWallTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): number {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const instant = wall - schoolOffsetAt(wall - schoolOffsetAt(wall));
  const offset = schoolOffsetAt(instant);

  return wall - instant === offset ? instant : wall - offset;
}
