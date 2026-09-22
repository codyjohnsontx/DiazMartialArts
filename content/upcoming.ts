export type UpcomingItem = {
  id: string;
  title: string;
  /**
   * A timed entry is an instant, so write it with the offset the gym was on
   * that day: `-05:00` in daylight saving time, `-06:00` in the winter. A value
   * with neither an offset nor a trailing Z is read on whatever clock the
   * server happens to run - UTC on Vercel - so a 7:00 PM class would print as
   * 2:00 PM. The calendar feed resolves such a value on the gym's clock, as
   * RFC 5545 floating time, but `new Date` has no such rule and this file goes
   * through `new Date`. tests/unit/upcoming-content.test.ts fails on one.
   *
   * All-day entries are floating calendar dates instead - see `allDay`.
   */
  start: string;
  end?: string;
  location?: string;
  notes?: string;
  /**
   * What the event costs, in US dollars, when the flyer prints a price. The card
   * renders this and the Event markup on /schedule emits it as an Offer, from
   * this one field, so what a reader sees and what a search engine reads cannot
   * drift. Leave it off when no price is printed - a price in `notes` is text a
   * machine cannot read, so it belongs here instead.
   */
  priceUsd?: number;
  /**
   * True when the source flyer gives a date but no clock time. The card then
   * shows the date span instead of a time, rather than implying midnight.
   *
   * Write all-day dates as UTC midnight (`...T00:00:00Z`), and write `end` as
   * the last day the event runs rather than the day after it. They are floating
   * calendar dates, not instants, and /schedule renders them in UTC so every
   * visitor sees the day the flyer prints regardless of their own time zone.
   */
  allDay?: boolean;
};

// Hand-maintained list behind the "Upcoming events" section on /schedule. It is
// the fallback source only: NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL takes precedence
// whenever it is set, and nothing here is read then.
//
// MAINTENANCE - nothing updates this file automatically. lib/upcoming.ts keeps
// only entries that start within its forward window (UPCOMING_WINDOW_DAYS) and have
// not finished yet, so an entry stays listed through the last day it runs and then
// drops off the page silently: no error, no warning. Once the last one ages out the
// section falls back to its empty state, which is how /schedule came to tell
// visitors there were no events while /announcements was full of them.
// tests/unit/upcoming-content.test.ts fails as soon as any entry below is over,
// so that staleness is loud instead of silent.
//
// To update: the source is a person, not a feed. The gym emails new flyers to the
// site owner, the owner passes them on, and entries are added here by hand from
// whatever those flyers actually print. Beyond the optional
// NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL feed the header above describes, these
// hand-written entries have no automatic source and none is expected, so do not
// go hunting for another calendar feed to wire up. Take a date only from
// something that actually prints it - genuine scheduled events only, never a
// placeholder, and never a guessed date or time. If the source gives no time, set
// allDay rather than inventing one; if it gives no date, leave the event out. An
// empty list is a supported state and the normal resting state between flyers,
// not a fault or a gap waiting to be filled: the section then renders a
// deliberate empty state pointing at the weekly schedule, and that is the right
// answer whenever nothing is confirmed.
//
// `end` is optional and never guessed either. Leave it off and the entry runs
// through the end of the day it starts on, at midnight at the gym, so an event
// never disappears while it is happening. Set `end` only when the flyer actually
// prints one: an allDay entry takes the last day the event runs rather than the
// day after, and stays listed until that day is over at the gym, while a timed
// entry with an `end` finishes at that exact time.
//
// Current entry: taken from the Master Cleber Luciano flyer on /announcements
// (public/announcements/cleber-luciano-2026-10-08.jpg), which prints Thursday
// October 8th, 7 - 9 PM, at Diaz Martial Arts, cost $125. The flyer prints no
// year; the file it arrived as was named for October 8th 2026, which is a
// Thursday. 8 October is daylight saving time at the gym, hence -05:00.
export const upcomingItems: UpcomingItem[] = [
  {
    id: 'cleber-luciano-2026-10-08',
    title: 'Master Cleber Luciano',
    start: '2026-10-08T19:00:00-05:00',
    end: '2026-10-08T21:00:00-05:00',
    location: 'Diaz Martial Arts',
    priceUsd: 125,
  },
];
