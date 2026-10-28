'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { type Die } from '@/content/dice';
import { describeRoll, rollDie, type Random } from '@/lib/dice';
import { cn } from '@/lib/utils';

type Props = {
  dice: readonly Die[];
  /** Source of randomness, `Math.random` by default. Tests inject one to pin a roll. */
  random?: Random;
};

// How long the faces tumble before settling, and how often they change while
// they do. Short on purpose: teammates roll this between rounds on the mat.
export const TUMBLE_MS = 480;
const TUMBLE_STEP_MS = 60;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function DiceRoller({ dice, random = Math.random }: Props) {
  // The face each die shows, by position in `dice`; null until that die is
  // rolled. Nothing random is picked during render, so the prerendered HTML
  // and the first client render agree - the same rule HomeUpcomingClasses
  // follows for the clock.
  const [shown, setShown] = useState<readonly (number | null)[]>(() => dice.map(() => null));
  // Positions of the dice in flight. Empty when nothing is tumbling.
  const [rolling, setRolling] = useState<readonly number[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const timers = useRef<{ step?: number; settle?: number }>({});

  useEffect(() => {
    const pending = timers.current;
    return () => {
      window.clearInterval(pending.step);
      window.clearTimeout(pending.settle);
    };
  }, []);

  const hasRolled = shown.some((face) => face !== null);
  const isRolling = rolling.length > 0;

  function roll(positions: readonly number[]) {
    if (isRolling) return;

    // The result is decided now; the tumble that follows is only a picture of it.
    const final = shown.map((face, i) => (positions.includes(i) ? rollDie(dice[i], random) : face));
    const settle = () => {
      setShown(final);
      setRolling([]);
      setAnnouncement(describeRoll(dice, final));
    };

    if (prefersReducedMotion()) {
      settle();
      return;
    }

    setRolling(positions);
    timers.current.step = window.setInterval(() => {
      setShown((current) =>
        current.map((face, i) => (positions.includes(i) ? rollDie(dice[i], random) : face)),
      );
    }, TUMBLE_STEP_MS);
    timers.current.settle = window.setTimeout(() => {
      window.clearInterval(timers.current.step);
      settle();
    }, TUMBLE_MS);
  }

  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {dice.map((die, i) => {
          const face = shown[i];
          const tumbling = rolling.includes(i);
          return (
            <li key={die.id} className="min-w-0">
              <button
                type="button"
                onClick={() => roll([i])}
                disabled={isRolling}
                className={cn(
                  'surface-card card-hover flex min-h-[172px] w-full flex-col rounded-2xl p-5 text-left focus-visible:outline-ember disabled:cursor-wait sm:min-h-[200px]',
                  tumbling && 'motion-safe:animate-tumble',
                )}
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-bronze">
                  {die.name}
                </span>
                <span
                  className={cn(
                    'mt-3 block text-2xl font-extrabold leading-tight tracking-tight sm:text-[26px]',
                    face === null ? 'text-black/35' : 'text-ink',
                  )}
                >
                  {face === null ? 'Not rolled yet' : die.faces[face]}
                </span>
                <span className="mt-auto block pt-4 text-xs leading-relaxed text-black/60">
                  {die.prompt}
                </span>
                {face !== null && (
                  <span className="mt-1.5 block text-[11px] font-bold text-ember">
                    Tap to re-roll this die
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <Button
        onClick={() => roll(dice.map((_, i) => i))}
        size="lg"
        disabled={isRolling}
        className="mt-6 w-full sm:w-auto"
      >
        {isRolling ? 'Rolling…' : hasRolled ? 'Roll again' : 'Roll the dice'}
      </Button>

      {/* The whole result in one sentence, announced once the dice settle, so a
          screen reader does not read every face the tumble passes through. */}
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </div>
  );
}
