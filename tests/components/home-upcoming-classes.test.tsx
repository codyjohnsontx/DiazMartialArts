import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeUpcomingClasses } from '@/components/HomeUpcomingClasses';

describe('HomeUpcomingClasses', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the next Tuesday evening block with a countdown', () => {
    const now = new Date(2026, 4, 26, 15, 32);
    vi.setSystemTime(now);

    render(<HomeUpcomingClasses />);

    expect(screen.getByText('Coming up')).toBeVisible();
    expect(screen.getByText('Starts in 1h 28m')).toBeVisible();
    expect(screen.getByText('Tonight')).toBeVisible();
    expect(screen.getByText('5:00 PM')).toBeVisible();
    expect(screen.getByText('Advanced Juniors Weapons (Ages 7-13)')).toBeVisible();
    expect(screen.getByText('Teen/Adult TKD Korean Karate - Weapons')).toBeVisible();
    expect(screen.getByText('Junior Black Belts Weapons (Ages 10-13)')).toBeVisible();
    expect(screen.getByRole('link', { name: /Full schedule/i })).toHaveAttribute(
      'href',
      '/schedule',
    );
    expect(screen.getByRole('link', { name: /Try a class/i })).toHaveAttribute('href', '/contact');
  });

  it('shows the next available day after classes end', () => {
    const now = new Date(2026, 4, 26, 21, 30);
    vi.setSystemTime(now);

    render(<HomeUpcomingClasses />);

    expect(screen.getByText('Tomorrow')).toBeVisible();
    expect(screen.getByText('7:00 AM')).toBeVisible();
    expect(screen.getByText('Starts in 9h 30m')).toBeVisible();
  });
});
