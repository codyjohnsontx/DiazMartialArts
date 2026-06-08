import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

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

describe('ScheduleContent', () => {
  it('renders Monday classes and upcoming events by default', () => {
    render(<ScheduleContent upcoming={upcoming} />);

    expect(screen.getByRole('heading', { name: 'Schedule' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Weekly class schedule' })).toBeVisible();
    expect(screen.getByText('Open Mat')).toBeVisible();
    expect(screen.getAllByText('Brazilian Jiu Jitsu (Gi/Gi-less)').length).toBeGreaterThan(0);
  });

  it('switches between available day tabs', async () => {
    const user = userEvent.setup();
    render(<ScheduleContent upcoming={upcoming} />);

    await user.click(screen.getByRole('tab', { name: 'Friday schedule' }));

    expect(screen.getByText('Brazilian Jiu Jitsu No-Gi')).toBeVisible();
  });

  it('keeps closed days disabled', async () => {
    const user = userEvent.setup();
    render(<ScheduleContent upcoming={upcoming} />);

    const sunday = screen.getByRole('tab', { name: 'Sunday schedule' });
    expect(sunday).toBeDisabled();
    await user.click(sunday);

    const weeklySection = screen.getByRole('heading', { name: 'Weekly class schedule' }).closest('section');
    expect(weeklySection).not.toBeNull();
    expect(
      within(weeklySection as HTMLElement).getAllByText('Brazilian Jiu Jitsu (Gi/Gi-less)').length,
    ).toBeGreaterThan(0);
  });
});
