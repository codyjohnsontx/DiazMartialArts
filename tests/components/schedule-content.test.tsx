import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ScheduleContent } from '@/components/ScheduleContent';
import type { UpcomingEvent } from '@/lib/upcoming';

const upcoming: UpcomingEvent[] = [
  {
    id: 'event-1',
    title: 'Open Mat',
    start: new Date('2026-06-20T10:00:00-05:00'),
    location: 'Main Mat',
  },
];

// Deliberately not UPCOMING_WINDOW_DAYS: the component takes the figure as a prop,
// so a value the constant could never supply is what proves it reads the prop.
const WINDOW_DAYS = 45;

// One test here renders /schedule itself, and the page reads the optional ICS
// feed before falling back to content/upcoming.ts. Pin the feed off so this suite
// stays offline and deterministic instead of describing whatever a configured
// environment happens to serve.
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('ScheduleContent', () => {
  it('renders Monday classes and upcoming events by default', () => {
    render(<ScheduleContent upcoming={upcoming} windowDays={WINDOW_DAYS} />);

    expect(screen.getByRole('heading', { name: 'Schedule' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Weekly class schedule' })).toBeVisible();
    expect(screen.getByText('Open Mat')).toBeVisible();
    expect(screen.getAllByText('Brazilian Jiu Jitsu (Gi/Gi-less)').length).toBeGreaterThan(0);
  });

  it('shows the date span for an all-day event rather than a made-up time', () => {
    render(
      <ScheduleContent
        upcoming={[
          {
            id: 'stripe-testing',
            title: 'Stripe Testing (White Stripe)',
            start: new Date('2026-08-26T00:00:00Z'),
            end: new Date('2026-08-27T00:00:00Z'),
            allDay: true,
          },
        ]}
        windowDays={WINDOW_DAYS}
      />,
    );

    expect(screen.getByText('Stripe Testing (White Stripe)')).toBeVisible();
    // Read in UTC, so this holds in every time zone CI or a visitor might use.
    expect(screen.getByText('AUG')).toBeVisible();
    expect(screen.getByText('26')).toBeVisible();
    expect(screen.getByText('Through August 27')).toBeVisible();
    // Midnight is an artefact of a date-only source, never a real class time.
    expect(screen.queryByText(/12:00 AM/)).toBeNull();
  });

  it('states the forward window it is handed rather than a figure of its own', () => {
    // Hard-coding the figure in the eyebrow is what let it keep claiming 60 days
    // while lib/upcoming.ts looked somewhere else.
    render(<ScheduleContent upcoming={upcoming} windowDays={WINDOW_DAYS} />);

    expect(screen.getByText(`Next ${WINDOW_DAYS} days`)).toBeVisible();
  });

  it('is handed the same forward window the page actually filters on', async () => {
    // Renders what /schedule itself renders, so the eyebrow and the filter cannot
    // drift apart through the prop the way they used to drift through a copy of
    // the number. Fails if the page hands the component anything else.
    //
    // lib/env.ts caches the public env on first read, and that read happens while
    // the module graph is imported - long before any beforeEach. Reset the
    // registry and import inside the test so the stubbed feed URL is the one the
    // page actually sees, rather than whatever the ambient environment had.
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL', '');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const { default: FreshSchedulePage } = await import('@/app/schedule/page');
    const { UPCOMING_WINDOW_DAYS: freshWindowDays } = await import('@/lib/upcoming');

    render(await FreshSchedulePage());

    expect(screen.getByText(`Next ${freshWindowDays} days`)).toBeVisible();
    // Proves the render took the offline fallback rather than reaching a feed.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('emits Event markup for the events it shows, priced from the same field', async () => {
    // Renders /schedule itself with a pinned list, so this reads the markup the
    // page really emits next to the card it really renders. The list is mocked
    // and the clock frozen so the guard does not age out with the shipped
    // content, and the second entry is past MAX_SHOWN_EVENTS's reach only if
    // the cut is wrong - it should appear in both places or neither.
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T12:00:00-05:00'));
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL', '');
    vi.stubGlobal('fetch', vi.fn());
    vi.doMock('@/content/upcoming', () => ({
      upcomingItems: [
        {
          id: 'seminar',
          title: 'Master Cleber Luciano',
          start: '2026-10-08T19:00:00-05:00',
          end: '2026-10-08T21:00:00-05:00',
          location: 'Diaz Martial Arts',
          priceUsd: 125,
        },
        {
          id: 'open-mat',
          title: 'Free Open Mat',
          start: '2026-10-10T10:00:00-05:00',
        },
      ],
    }));

    try {
      const { default: FreshSchedulePage } = await import('@/app/schedule/page');
      const { container } = render(await FreshSchedulePage());

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
      const events = JSON.parse(script?.textContent ?? '[]') as Array<Record<string, unknown>>;

      expect(events.map((event) => event.name)).toEqual(['Master Cleber Luciano', 'Free Open Mat']);
      expect(events[0].startDate).toBe('2026-10-08T19:00:00-05:00');
      expect(events[0].endDate).toBe('2026-10-08T21:00:00-05:00');
      expect(events[0].offers).toEqual({ '@type': 'Offer', price: 125, priceCurrency: 'USD' });
      expect(events[1]).not.toHaveProperty('offers');

      // The visible price and the Offer's price are the one field, read twice.
      expect(screen.getByText('$125')).toBeVisible();
      expect(screen.getByText('Diaz Martial Arts · 7:00 - 9:00 PM')).toBeVisible();
    } finally {
      vi.doUnmock('@/content/upcoming');
      vi.useRealTimers();
    }
  });

  it('tracks the event grid columns to the number of events', () => {
    // The cards are divided by the grid background showing through 1px gaps, so a
    // column with no card in it renders as an empty grey panel.
    const { container } = render(<ScheduleContent upcoming={upcoming} windowDays={WINDOW_DAYS} />);

    const grid = container.querySelector('.gap-px');
    expect(grid).not.toBeNull();
    expect(grid?.className).not.toMatch(/grid-cols-2|grid-cols-4/);
  });

  it('labels a single-day all-day event without inventing a time', () => {
    render(
      <ScheduleContent
        upcoming={[
          {
            id: 'one-day',
            title: 'Clean Up Day',
            start: new Date('2026-08-26T00:00:00Z'),
            allDay: true,
          },
        ]}
        windowDays={WINDOW_DAYS}
      />,
    );

    expect(screen.getByText('All day')).toBeVisible();
  });

  it('still shows a start time for events that have one', () => {
    render(<ScheduleContent upcoming={upcoming} windowDays={WINDOW_DAYS} />);

    // The exact clock value follows the runtime time zone; what matters is that a
    // timed event keeps showing a real time next to its location.
    expect(screen.getByText(/^Main Mat · \d{1,2}:\d{2} (AM|PM)$/)).toBeVisible();
  });

  describe('a timed event with an end', () => {
    // The Cleber Luciano flyer printed 7 - 9 PM and the card showed 7:00 PM
    // alone, so a parent could not tell how long it ran without opening the
    // flyer.
    it('shows the range, sharing one AM/PM when both ends have the same', () => {
      render(
        <ScheduleContent
          upcoming={[
            {
              id: 'seminar',
              title: 'Master Cleber Luciano',
              start: new Date('2026-10-08T19:00:00-05:00'),
              end: new Date('2026-10-08T21:00:00-05:00'),
              location: 'Diaz Martial Arts',
            },
          ]}
          windowDays={WINDOW_DAYS}
        />,
      );

      expect(screen.getByText('Diaz Martial Arts · 7:00 - 9:00 PM')).toBeVisible();
    });

    it('spells both periods out when the range crosses noon', () => {
      render(
        <ScheduleContent
          upcoming={[
            {
              id: 'open-mat',
              title: 'Open Mat',
              start: new Date('2026-10-10T11:00:00-05:00'),
              end: new Date('2026-10-10T13:00:00-05:00'),
            },
          ]}
          windowDays={WINDOW_DAYS}
        />,
      );

      expect(screen.getByText('11:00 AM - 1:00 PM')).toBeVisible();
    });

    it('shows the start alone when the end is where it starts', () => {
      // The feed writes an event with no DTEND as ending at its start; that is
      // not a range and must not print as "7:00 - 7:00 PM".
      render(
        <ScheduleContent
          upcoming={[
            {
              id: 'no-end',
              title: 'Open Mat',
              start: new Date('2026-10-10T19:00:00-05:00'),
              end: new Date('2026-10-10T19:00:00-05:00'),
            },
          ]}
          windowDays={WINDOW_DAYS}
        />,
      );

      expect(screen.getByText('7:00 PM')).toBeVisible();
    });

    it('names the day the event ends when it is not the day it starts', () => {
      render(
        <ScheduleContent
          upcoming={[
            {
              id: 'overnight',
              title: 'Lock-In',
              start: new Date('2026-10-10T19:00:00-05:00'),
              end: new Date('2026-10-11T08:00:00-05:00'),
            },
          ]}
          windowDays={WINDOW_DAYS}
        />,
      );

      expect(screen.getByText('7:00 PM - Oct 11, 8:00 AM')).toBeVisible();
    });
  });

  it('shows the price from the structured field, and the notes', () => {
    render(
      <ScheduleContent
        upcoming={[
          {
            id: 'seminar',
            title: 'Master Cleber Luciano',
            start: new Date('2026-10-08T19:00:00-05:00'),
            end: new Date('2026-10-08T21:00:00-05:00'),
            priceUsd: 125,
            notes: 'Bring a gi.',
          },
        ]}
        windowDays={WINDOW_DAYS}
      />,
    );

    expect(screen.getByText('$125')).toBeVisible();
    expect(screen.getByText('Bring a gi.')).toBeVisible();
  });

  it('prints no price line for an event with no known price', () => {
    render(<ScheduleContent upcoming={upcoming} windowDays={WINDOW_DAYS} />);

    expect(screen.queryByText(/^\$/)).toBeNull();
  });

  describe("a timed event's date and time, for a visitor outside the gym's zone", () => {
    // vitest.config.ts pins TZ to America/Chicago, the gym's own zone, so a rule
    // reading local accessors and a rule reading the gym's zone agree there and a
    // test running only in Chicago cannot tell them apart. Move the process to a
    // visitor zone the way tests/unit/classScheduleVisitorZone.test.ts does.
    const pinnedZone = process.env.TZ;

    afterEach(() => {
      process.env.TZ = pinnedZone;
    });

    it("renders on the gym's clock, not a visitor's in Tokyo", () => {
      process.env.TZ = 'Asia/Tokyo';
      expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Asia/Tokyo');

      // 7:00 PM CDT on June 20 is 9:00 AM the next day, June 21, in Tokyo, and
      // 9:00 PM is 11:00 AM there. An end read on the visitor's clock would also
      // land on a different day from its start and print that day's name.
      render(
        <ScheduleContent
          upcoming={[
            {
              id: 'evening-class',
              title: 'Evening Open Mat',
              start: new Date('2026-06-20T19:00:00-05:00'),
              end: new Date('2026-06-20T21:00:00-05:00'),
              location: 'Main Mat',
            },
          ]}
          windowDays={WINDOW_DAYS}
        />,
      );

      expect(screen.getByText('JUN')).toBeVisible();
      expect(screen.getByText('20')).toBeVisible();
      expect(screen.getByText('Main Mat · 7:00 - 9:00 PM')).toBeVisible();
      expect(screen.queryByText('21')).toBeNull();
      expect(screen.queryByText(/9:00 AM/)).toBeNull();
    });
  });

  it('points visitors at regular classes when no events are scheduled', () => {
    render(<ScheduleContent upcoming={[]} windowDays={WINDOW_DAYS} />);

    expect(screen.getByText(/No special events on the calendar right now/i)).toBeVisible();
    expect(screen.getByText(/Regular classes run six days a week/i)).toBeVisible();
    expect(screen.getByText(/the full weekly schedule is at the top of this page/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Book Free Trial/i })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.getByRole('link', { name: /Open announcements/i })).toHaveAttribute(
      'href',
      '/announcements',
    );
  });

  it('switches between available day tabs', async () => {
    const user = userEvent.setup();
    render(<ScheduleContent upcoming={upcoming} windowDays={WINDOW_DAYS} />);

    await user.click(screen.getByRole('tab', { name: 'Friday schedule' }));

    expect(screen.getByText('Brazilian Jiu Jitsu No-Gi')).toBeVisible();
  });

  it('keeps closed days disabled', async () => {
    const user = userEvent.setup();
    render(<ScheduleContent upcoming={upcoming} windowDays={WINDOW_DAYS} />);

    const sunday = screen.getByRole('tab', { name: 'Sunday schedule' });
    expect(sunday).toBeDisabled();
    await user.click(sunday);

    const weeklySection = screen
      .getByRole('heading', { name: 'Weekly class schedule' })
      .closest('section');
    expect(weeklySection).not.toBeNull();
    expect(
      within(weeklySection as HTMLElement).getAllByText('Brazilian Jiu Jitsu (Gi/Gi-less)').length,
    ).toBeGreaterThan(0);
  });
});
