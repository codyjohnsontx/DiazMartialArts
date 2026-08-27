import { act, render, screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
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

  // The home page is prerendered, so the HTML a visitor receives carries the
  // build's clock and hydration always happens later. Rendering with React's
  // server renderer at one time and hydrating at another is that situation in
  // the unit harness: React reports any mismatch through onRecoverableError,
  // exactly as the browser does, so `render()` alone would never see it.
  it('hydrates a build-time render at a later time without a mismatch', () => {
    vi.setSystemTime(new Date(2026, 4, 26, 15, 32));
    const serverHtml = renderToString(<HomeUpcomingClasses />);

    expect(serverHtml).toContain('Coming up');
    expect(serverHtml).toContain('href="/schedule"');
    expect(serverHtml).not.toContain('Starts in');

    // the visitor arrives the next morning
    vi.setSystemTime(new Date(2026, 4, 27, 6, 45));
    const container = document.createElement('div');
    container.innerHTML = serverHtml;
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onRecoverableError = vi.fn();

    let root: ReturnType<typeof hydrateRoot> | undefined;
    act(() => {
      root = hydrateRoot(container, <HomeUpcomingClasses />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();

    // after mount the card follows the visitor's clock, not the build's
    expect(container).toHaveTextContent('Starts in 15m');
    expect(container).toHaveTextContent('Today');
    expect(container).toHaveTextContent('7:00 AM');
    expect(container).toHaveTextContent('Brazilian Jiu Jitsu (Gi/Gi-less)');

    // and keeps following it
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(container).toHaveTextContent('Starts in 14m');

    act(() => {
      root?.unmount();
    });
    container.remove();
  });
});
