export type UpcomingItem = {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  notes?: string;
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
// To update: take dates from the current monthly events calendar on
// /announcements (app/announcements/page.tsx, images in public/announcements/).
// Genuine scheduled events only - never a placeholder, and never a guessed date
// or time. If a flyer gives no time, set allDay rather than inventing one; if it
// gives no date, leave the event out. An empty list is a supported state: the
// section then renders a deliberate empty state pointing at the weekly schedule.
//
// `end` is optional and never guessed either. Leave it off and the entry runs
// through the end of the day it starts on, at midnight at the gym, so an event
// never disappears while it is happening. Set `end` only when the flyer actually
// prints one: an allDay entry takes the last day the event runs rather than the
// day after, and stays listed until that day is over at the gym, while a timed
// entry with an `end` finishes at that exact time.
export const upcomingItems: UpcomingItem[] = [
  {
    // Source: the August 2026 panel of the July 2026 events calendar flyer
    // ("26-27 Stripe Testing (White Stripe)"), which gave no time of day. That
    // flyer has since been retired from /announcements along with the rest of
    // the June and July set; the event it printed still runs, so the entry
    // stays until the date passes.
    id: 'stripe-testing-white-stripe-2026-08',
    title: 'Stripe Testing (White Stripe)',
    start: '2026-08-26T00:00:00Z',
    end: '2026-08-27T00:00:00Z',
    allDay: true,
  },
];
