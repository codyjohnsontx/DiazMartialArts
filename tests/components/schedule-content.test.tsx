import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import SchedulePage from '@/app/schedule/page';
import { ScheduleContent } from '@/components/ScheduleContent';
import { type UpcomingEvent, UPCOMING_WINDOW_DAYS } from '@/lib/upcoming';

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
    render(await SchedulePage());

    expect(screen.getByText(`Next ${UPCOMING_WINDOW_DAYS} days`)).toBeVisible();
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

  it('points visitors at regular classes when no events are scheduled', () => {
    render(<ScheduleContent upcoming={[]} windowDays={WINDOW_DAYS} />);

    expect(screen.getByText(/No special events on the calendar right now/i)).toBeVisible();
    expect(screen.getByText(/Regular classes run six days a week/i)).toBeVisible();
    expect(screen.getByText(/the full weekly schedule is at the top of this page/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Book Free Trial/i })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.getByRole('link', { name: /Open monthly calendar/i })).toHaveAttribute(
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
