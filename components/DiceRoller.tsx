'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { type Die, type Face } from '@/content/dice';
import { describeRoll, rollDie, type Random } from '@/lib/dice';
import { cn } from '@/lib/utils';
import { youtubeEmbedUrl, youtubeThumbnailUrl } from '@/lib/youtube';

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
  // Which dice have their video open, by position. A roll closes the player
  // on every die it touches, so a video never outlives the face it was for.
  const [playing, setPlaying] = useState<readonly boolean[]>(() => dice.map(() => false));
  const [announcement, setAnnouncement] = useState({ text: '', id: 0 });
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

    setPlaying((current) => current.map((open, i) => (positions.includes(i) ? false : open)));
    // The result is decided now; the tumble that follows is only a picture of it.
    const final = shown.map((face, i) => (positions.includes(i) ? rollDie(dice[i], random) : face));
    const settle = () => {
      setShown(final);
      setRolling([]);
      setAnnouncement((previous) => ({ text: describeRoll(dice, final), id: previous.id + 1 }));
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
                aria-disabled={isRolling}
                className={cn(
                  'surface-card card-hover flex min-h-[172px] w-full flex-col rounded-2xl p-5 text-left focus-visible:outline-ember aria-disabled:cursor-wait sm:min-h-[200px]',
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
                  {face === null ? 'Not rolled yet' : die.faces[face].label}
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
              {face !== null && (
                <FaceMedia
                  face={die.faces[face]}
                  tumbling={tumbling}
                  playing={playing[i]}
                  onToggle={(open) =>
                    setPlaying((current) => current.map((was, j) => (j === i ? open : was)))
                  }
                />
              )}
            </li>
          );
        })}
      </ul>

      <Button
        onClick={() => roll(dice.map((_, i) => i))}
        size="lg"
        className="mt-6 w-full sm:w-auto"
      >
        {isRolling ? 'Rolling…' : hasRolled ? 'Roll again' : 'Roll the dice'}
      </Button>

      {/* The whole result in one sentence, announced once the dice settle, so a
          screen reader does not read every face the tumble passes through. */}
      <p className="sr-only" role="status">
        <span key={announcement.id}>{announcement.text}</span>
      </p>
    </div>
  );
}

type FaceMediaProps = {
  face: Face;
  /** True while the die above is still tumbling; the block holds its shape and shows nothing. */
  tumbling: boolean;
  playing: boolean;
  onToggle: (open: boolean) => void;
};

/**
 * What the rolled face looks like, under its die: the video's own YouTube
 * still, and the video itself once asked for. Nothing from YouTube loads
 * before then except that one image - the player is an iframe, and an iframe
 * per die on every roll would fetch YouTube's whole player three times over
 * on a phone off the mat. A face with no video says so in a line rather than
 * leaving a broken image or an empty player; `content/dice.ts` is where a
 * coach adds the id.
 *
 * The block is rendered from the first roll on, including during a tumble,
 * so the page does not jump by a thumbnail's height every time a die is
 * re-rolled. The still is a plain <img> on purpose: next/image would route a
 * YouTube-hosted file through this site's optimiser, which the project notes
 * record as the slowest thing on the box, for an image YouTube already serves
 * at the size it is shown.
 */
function FaceMedia({ face, tumbling, playing, onToggle }: FaceMediaProps) {
  const id = face.youtubeId;
  return (
    <div className="surface-card mt-3 overflow-hidden rounded-2xl">
      {tumbling || !id ? (
        <p className="px-4 py-3 text-xs leading-relaxed text-black/60">
          {tumbling ? '\u00a0' : 'No video for this one yet. Ask a coach to show it on the mat.'}
        </p>
      ) : playing ? (
        <div>
          <iframe
            className="aspect-video w-full"
            src={youtubeEmbedUrl(id)}
            title={`${face.label} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <button
            type="button"
            onClick={() => onToggle(false)}
            className="block w-full px-4 py-2.5 text-left text-[11px] font-bold text-ember hover:bg-black/5 focus-visible:outline-ember"
          >
            Hide video
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onToggle(true)}
          className="group flex w-full items-center gap-3 p-2 text-left hover:bg-black/5 focus-visible:outline-ember sm:block sm:p-0"
        >
          <span className="relative block w-[132px] shrink-0 overflow-hidden rounded-xl sm:w-full sm:rounded-none">
            {/* eslint-disable-next-line @next/next/no-img-element -- YouTube serves this still at display size; see the docblock. */}
            <img
              src={youtubeThumbnailUrl(id)}
              alt=""
              width={480}
              height={270}
              loading="lazy"
              decoding="async"
              className="aspect-video w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center bg-black/20 transition group-hover:bg-black/30"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ember text-white shadow-soft sm:h-12 sm:w-12">
                <svg
                  viewBox="0 0 24 24"
                  className="ml-0.5 h-4 w-4 sm:h-5 sm:w-5"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </span>
          <span className="block min-w-0 sm:px-4 sm:py-3">
            <span className="block text-sm font-extrabold leading-tight tracking-tight">
              Watch: {face.label}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-black/60">
              Plays here on YouTube when you tap.
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
