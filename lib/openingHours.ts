export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

/**
 * One opening-hours rule, held as data rather than as the sentence a reader
 * sees. `opens`/`closes` are 24-hour `HH:MM`, which is the only form
 * schema.org accepts; a `null` `hours` means closed that day.
 *
 * The two times are one field rather than two nullable ones so that a
 * half-filled rule cannot be written. Held separately, `opens: '10:00',
 * closes: null` was a state each consumer below read differently - "Closed" on
 * the page against 10:00-00:00 in the markup - which is the page-and-markup
 * drift this module exists to make impossible.
 *
 * `label` is the visible shorthand for the days the rule covers ("Mon-Fri").
 * It is stated rather than derived because the grouping is an editorial choice
 * - a gym writes "Mon-Fri", not "Monday, Tuesday, Wednesday, Thursday, Friday"
 * - while `days` has to stay the full explicit list for the markup.
 */
export type OpeningHoursRule = {
  days: DayOfWeek[];
  label: string;
  hours: { opens: string; closes: string } | null;
};

function to12Hour(value: string): string {
  const [hour24, minute] = value.split(':').map(Number);
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
}

/**
 * The human-readable lines for the footer and the contact page, derived from
 * the same rules the markup below is built from so the two can never drift.
 * Hours are a local-search signal and a reason someone drives across town, so
 * a page saying one thing while its markup says another is worse than either.
 */
export function formatOpeningHours(rules: OpeningHoursRule[]): string[] {
  return rules.map((rule) =>
    rule.hours
      ? `${rule.label}: ${to12Hour(rule.hours.opens)} - ${to12Hour(rule.hours.closes)}`
      : `${rule.label}: Closed`,
  );
}

const CLOSED_ALL_DAY = { opens: '00:00', closes: '00:00' };

/**
 * schema.org `openingHours` takes a strict format - `Mo-Fr 07:00-21:00`, with
 * two-letter days and 24-hour times - and this site was emitting its display
 * strings ("Mon-Fri: 7:00 AM - 9:00 PM") into that property instead. They
 * parse as nothing, so the business published opening hours a search engine
 * could not read, which is the failure mode where present markup is worse than
 * absent markup: it looks done.
 *
 * `openingHoursSpecification` is the unambiguous form and the one Google
 * documents for LocalBusiness. A closed day is carried as `00:00` to `00:00`
 * rather than by omission, which is Google's documented way of saying closed
 * all day - and keeps "Sun: Closed" a stated fact rather than a gap a reader
 * has to interpret.
 */
export function toOpeningHoursSpecification(rules: OpeningHoursRule[]) {
  return rules.map((rule) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: rule.days,
    ...(rule.hours ?? CLOSED_ALL_DAY),
  }));
}
