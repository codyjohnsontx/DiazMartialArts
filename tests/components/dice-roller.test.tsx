import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DiceRoller, TUMBLE_MS } from '@/components/DiceRoller';
import { dice, type Die } from '@/content/dice';

// A source that deals the given values in order, then repeats the last one.
// `rollDie` floors value x faces, so 0 is the first face and 0.999 the last.
function dealing(...values: number[]) {
  let n = 0;
  return () => values[Math.min(n++, values.length - 1)];
}

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' && matches,
      media: query,
    })),
  );
}

const dieButton = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}`) });

describe('DiceRoller', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows every die unrolled until the first tap, with no result in the live region', () => {
    render(<DiceRoller dice={dice} />);

    for (const die of dice) {
      expect(dieButton(die.name)).toHaveTextContent('Not rolled yet');
      expect(dieButton(die.name)).toHaveTextContent(die.prompt);
    }
    expect(screen.getByRole('button', { name: 'Roll the dice' })).toBeEnabled();
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('');
  });

  // jsdom has no matchMedia at all, so this is also the path a browser without
  // it takes: the roller must not throw before it can roll.
  it('rolls when matchMedia is missing', () => {
    render(<DiceRoller dice={dice} random={dealing(0)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));
    act(() => {
      vi.advanceTimersByTime(TUMBLE_MS);
    });

    expect(dieButton('Position')).toHaveTextContent(dice[0].faces[0].label);
  });

  it('tumbles briefly and then settles every die on the result decided at the tap', () => {
    stubReducedMotion(false);
    // The first three values decide the result; everything after is the tumble.
    render(<DiceRoller dice={dice} random={dealing(0, 0.5, 0.999, 0.25)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));

    expect(screen.getByRole('button', { name: 'Rolling…' })).toBeEnabled();
    // Mid-tumble the faces are the tumble's, not the result's, and nothing has
    // been announced yet.
    act(() => {
      vi.advanceTimersByTime(TUMBLE_MS / 2);
    });
    expect(dieButton('Position')).toHaveTextContent(dice[0].faces[5].label);
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('');

    act(() => {
      vi.advanceTimersByTime(TUMBLE_MS / 2);
    });
    expect(dieButton('Position')).toHaveTextContent(dice[0].faces[0].label);
    expect(dieButton('Submission')).toHaveTextContent(dice[1].faces[10].label);
    expect(dieButton('Sweep or pass')).toHaveTextContent(dice[2].faces[19].label);
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent(
      `Position: ${dice[0].faces[0].label}. Submission: ${dice[1].faces[10].label}. Sweep or pass: ${dice[2].faces[19].label}.`,
    );
    expect(screen.getByRole('button', { name: 'Roll again' })).toBeEnabled();
  });

  it('settles at once, with no tumble, when the visitor prefers reduced motion', () => {
    stubReducedMotion(true);
    render(<DiceRoller dice={dice} random={dealing(0.999)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));

    for (const die of dice) {
      expect(dieButton(die.name)).toHaveTextContent(die.faces[19].label);
    }
    expect(screen.getByRole('button', { name: 'Roll again' })).toBeEnabled();
  });

  it('re-rolls one die on its own when that die is tapped', () => {
    stubReducedMotion(true);
    render(<DiceRoller dice={dice} random={dealing(0, 0, 0, 0.999)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));
    fireEvent.click(dieButton('Submission'));

    expect(dieButton('Position')).toHaveTextContent(dice[0].faces[0].label);
    expect(dieButton('Submission')).toHaveTextContent(dice[1].faces[19].label);
    expect(dieButton('Sweep or pass')).toHaveTextContent(dice[2].faces[0].label);
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent(
      `Submission: ${dice[1].faces[19].label}.`,
    );
  });

  it('ignores a tap that lands while the dice are still tumbling', () => {
    stubReducedMotion(false);
    render(<DiceRoller dice={dice} random={dealing(0, 0, 0, 0.999)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));
    fireEvent.click(dieButton('Position'));
    act(() => {
      vi.advanceTimersByTime(TUMBLE_MS);
    });

    expect(dieButton('Position')).toHaveTextContent(dice[0].faces[0].label);
    expect(screen.getByRole('button', { name: 'Roll again' })).toBeEnabled();
  });

  // A disabled control drops keyboard focus to <body>, so the button that was
  // just pressed has to stay enabled and focused through the tumble.
  it('keeps focus on the pressed control while the dice tumble', () => {
    stubReducedMotion(false);
    render(<DiceRoller dice={dice} random={dealing(0)} />);

    const rollAll = screen.getByRole('button', { name: 'Roll the dice' });
    rollAll.focus();
    fireEvent.click(rollAll);

    expect(rollAll).toHaveTextContent('Rolling…');
    expect(rollAll).toBeEnabled();
    expect(rollAll).toHaveFocus();
    for (const die of dice) {
      expect(dieButton(die.name)).toBeEnabled();
      expect(dieButton(die.name)).toHaveAttribute('aria-disabled', 'true');
    }

    act(() => {
      vi.advanceTimersByTime(TUMBLE_MS);
    });
    expect(rollAll).toHaveFocus();
    expect(dieButton('Position')).toHaveAttribute('aria-disabled', 'false');
  });

  it('announces a re-roll that lands on the faces already shown', () => {
    stubReducedMotion(true);
    render(<DiceRoller dice={dice} random={dealing(0)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));
    const status = screen.getByRole('status', { hidden: true });
    const first = status.firstChild;
    fireEvent.click(screen.getByRole('button', { name: 'Roll again' }));

    expect(status).toHaveTextContent(
      `Position: ${dice[0].faces[0].label}. Submission: ${dice[1].faces[0].label}. Sweep or pass: ${dice[2].faces[0].label}.`,
    );
    expect(status.firstChild).not.toBe(first);
  });

  // The page is prerendered, so the HTML a visitor receives must be the same
  // markup the client renders first: no face may be picked during render.
  it('server-renders every die unrolled, so the prerender cannot disagree with the client', () => {
    const html = renderToString(<DiceRoller dice={dice} />);

    expect(html.match(/Not rolled yet/g)).toHaveLength(dice.length);
    for (const die of dice) {
      for (const { label } of die.faces) {
        expect(html).not.toContain(`>${label}<`);
      }
    }
  });

  // The media under each die. A two-face die, one face with a video and one
  // without, so a single `random` value picks which case shows.
  const technique: Die = {
    id: 'technique',
    name: 'Technique',
    prompt: 'Drill it.',
    faces: [{ label: 'Armbar', youtubeId: 'dQw4w9WgXcQ' }, { label: 'Kimura' }],
  };
  const stillOf = (label: string) =>
    screen.getByRole('button', { name: new RegExp(`^Watch: ${label}`) });

  describe('media', () => {
    it('loads nothing from YouTube until a die has been rolled', () => {
      render(<DiceRoller dice={[technique]} />);

      expect(document.querySelector('img, iframe')).toBeNull();
      expect(screen.queryByRole('button', { name: /^Watch:/ })).toBeNull();
    });

    it("shows the face's own YouTube still and opens the player only when asked", () => {
      stubReducedMotion(true);
      render(<DiceRoller dice={[technique]} random={dealing(0)} />);
      fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));

      const still = document.querySelector('img');
      expect(still).toHaveAttribute('src', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
      expect(still).toHaveAttribute('alt', '');
      expect(document.querySelector('iframe')).toBeNull();

      fireEvent.click(stillOf('Armbar'));

      const player = document.querySelector('iframe');
      expect(player).toHaveAttribute(
        'src',
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&autoplay=1',
      );
      expect(player).toHaveAttribute('title', 'Armbar video');
      expect(player).toHaveAttribute('allowfullscreen');
      expect(document.querySelector('img')).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: 'Hide video' }));
      expect(document.querySelector('iframe')).toBeNull();
      expect(stillOf('Armbar')).toBeInTheDocument();
    });

    it('says so for a face with no video, with no image and no player', () => {
      stubReducedMotion(true);
      render(<DiceRoller dice={[technique]} random={dealing(0.999)} />);
      fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));

      expect(dieButton('Technique')).toHaveTextContent('Kimura');
      expect(screen.getByText(/No video for this one yet/)).toBeInTheDocument();
      expect(document.querySelector('img, iframe')).toBeNull();
      expect(screen.queryByRole('button', { name: /^Watch:/ })).toBeNull();
    });

    it('closes the player when its die is re-rolled, even onto the same face', () => {
      stubReducedMotion(true);
      render(<DiceRoller dice={[technique]} random={dealing(0)} />);
      fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));
      fireEvent.click(stillOf('Armbar'));
      expect(document.querySelector('iframe')).not.toBeNull();

      fireEvent.click(dieButton('Technique'));

      expect(dieButton('Technique')).toHaveTextContent('Armbar');
      expect(document.querySelector('iframe')).toBeNull();
      expect(stillOf('Armbar')).toBeInTheDocument();
    });

    // Re-rolling must not bounce the page: the block keeps the face the die
    // last settled on through the tumble, so it keeps that face's shape, and
    // loads no still for the faces flying by.
    it('keeps the last settled still in place, inert, while the die tumbles', () => {
      stubReducedMotion(false);
      render(<DiceRoller dice={[technique]} random={dealing(0, 0.999, 0.999, 0.999)} />);
      fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));
      act(() => {
        vi.advanceTimersByTime(TUMBLE_MS);
      });
      const still = document.querySelector('img');
      expect(still).toHaveAttribute('src', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');

      fireEvent.click(dieButton('Technique'));
      act(() => {
        vi.advanceTimersByTime(TUMBLE_MS / 2);
      });

      expect(dieButton('Technique')).toHaveTextContent('Kimura');
      expect(document.querySelector('img')).toBe(still);
      expect(stillOf('Armbar')).toBeDisabled();
      act(() => {
        vi.advanceTimersByTime(TUMBLE_MS / 2);
      });
      expect(document.querySelector('img')).toBeNull();
      expect(screen.getByText(/No video for this one yet/)).toBeInTheDocument();
    });

    // Opening the player replaces the Watch control, and closing it replaces
    // Hide video, so without a hand-off focus falls to <body>.
    it('moves focus to the player when it opens and back to Watch when it closes', () => {
      stubReducedMotion(true);
      render(<DiceRoller dice={[technique]} random={dealing(0)} />);
      fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));

      stillOf('Armbar').focus();
      fireEvent.click(stillOf('Armbar'));
      expect(document.querySelector('iframe')).toHaveFocus();

      fireEvent.click(screen.getByRole('button', { name: 'Hide video' }));
      expect(stillOf('Armbar')).toHaveFocus();
    });

    it('leaves focus on the die when a re-roll closes the player', () => {
      stubReducedMotion(true);
      render(<DiceRoller dice={[technique]} random={dealing(0)} />);
      fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));
      fireEvent.click(stillOf('Armbar'));

      dieButton('Technique').focus();
      fireEvent.click(dieButton('Technique'));

      expect(document.querySelector('iframe')).toBeNull();
      expect(dieButton('Technique')).toHaveFocus();
    });
  });
});
