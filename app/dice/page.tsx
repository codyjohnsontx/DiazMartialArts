import Link from 'next/link';

import { DiceRoller } from '@/components/DiceRoller';
import { Eyebrow } from '@/components/Eyebrow';
import { dice, DIE_SIDES } from '@/content/dice';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Jiu Jitsu Dice',
  description:
    'Roll three twenty-sided dice for a starting position, a submission to hunt, and a sweep or pass to work. A drill randomizer for open mat.',
  path: '/dice',
  keywords: ['jiu jitsu dice', 'bjj dice', 'bjj drill randomizer', 'open mat drills'],
});

const steps = [
  {
    n: '01',
    t: 'Roll',
    d: 'One tap rolls all three dice. Tap a single die to re-roll just that one when a face does not fit the position.',
  },
  {
    n: '02',
    t: 'Start where the dice say',
    d: 'Set up in the position that came up. The bottom player works the sweep, the top player works the pass, and both hunt the submission.',
  },
  {
    n: '03',
    t: 'Reset and roll again',
    d: 'When someone taps, sweeps, or passes, reset to the position and go again. Roll a new set when the round ends.',
  },
];

export default function DicePage() {
  return (
    <>
      {/* HERO */}
      <section className="border-b border-black/10">
        <div className="mx-auto grid w-full max-w-6xl items-end gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <Eyebrow>Drill randomizer</Eyebrow>
            <h1 className="display mt-5 text-5xl sm:text-7xl lg:text-[88px]">Jiu Jitsu Dice</h1>
          </div>
          <p className="text-base leading-relaxed text-black/75 sm:text-lg">
            Three {DIE_SIDES}-sided dice for open mat. Roll for a starting position, a submission to
            hunt, and a sweep or pass to work, then drill whatever comes up. Works on your phone
            right off the mat.
          </p>
        </div>
      </section>

      {/* DICE */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <DiceRoller dice={dice} />
      </section>

      {/* HOW TO USE */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <div>
            <Eyebrow>How to use it</Eyebrow>
            <h2 className="display mt-3 text-3xl leading-none sm:text-4xl">
              Three dice, one round.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-black/70">
              New to the positions or the names?{' '}
              <Link href="/programs/brazilian-jiu-jitsu" className="font-bold text-ember">
                Our Brazilian Jiu Jitsu program →
              </Link>
            </p>
          </div>
          <div>
            {steps.map((s) => (
              <div
                key={s.n}
                className="grid grid-cols-[48px_1fr] gap-4 border-t border-black/10 py-5 sm:grid-cols-[60px_1fr] sm:gap-5"
              >
                <div className="text-[13px] font-extrabold tracking-[0.08em] text-ember">{s.n}</div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight sm:text-xl">{s.t}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-black/70">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
