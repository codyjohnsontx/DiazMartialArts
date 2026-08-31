'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { formatCountdown, getScheduleLabel, getUpcomingClassBlocks } from '@/lib/classSchedule';

// The card shell without any time-derived content. It is what the server
// renders, what the client renders first, and what a visitor without
// JavaScript keeps, so the copy has to stay true on its own.
function UpcomingClassesShell({ headline }: { headline: string }) {
  return (
    <div className="relative w-[min(92vw,390px)] border border-black/10 bg-sand p-5 shadow-lift">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-bronze">Coming up</div>
      <div className="mt-2 text-lg font-extrabold tracking-tight">{headline}</div>
      <Link href="/schedule" className="mt-4 inline-block text-[13px] font-bold text-ember">
        View full schedule →
      </Link>
    </div>
  );
}

export function HomeUpcomingClasses() {
  // The home page is prerendered at build time, so a `new Date()` taken during
  // render is the build's clock on the server and the visitor's clock in the
  // browser. The two agree only within the build's own minute; at any other
  // time the countdown text differs and React reports a hydration mismatch
  // (error 425) and drops the whole page to client rendering (error 422). The
  // clock is therefore read only after mount, and the first render on both
  // sides is the same time-free shell. tests/components/home-upcoming-classes.test.tsx
  // hydrates a build-time render at a later time to keep it that way.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    const interval = window.setInterval(update, 60_000);
    update();

    return () => window.clearInterval(interval);
  }, []);

  const blocks = useMemo(() => (now ? getUpcomingClassBlocks(now, { limit: 4 }) : []), [now]);
  const nextBlock = blocks[0];
  const laterBlocks = blocks.slice(1);

  if (!now) {
    return <UpcomingClassesShell headline="Classes six days a week" />;
  }

  if (!nextBlock) {
    return <UpcomingClassesShell headline="Schedule updates soon" />;
  }

  return (
    <div className="relative w-[min(92vw,390px)] border border-black/10 bg-sand p-5 shadow-lift">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-bronze">
          Coming up
        </div>
        <div className="shrink-0 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ember">
          {formatCountdown(nextBlock.start, now)}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[74px_1fr] gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-bronze">
            {getScheduleLabel(nextBlock)}
          </div>
          <div className="mt-1 text-2xl font-extrabold tracking-tight [font-variant-numeric:tabular-nums]">
            {nextBlock.startLabel}
          </div>
          <div className="mt-0.5 text-xs font-semibold text-black/50">
            {nextBlock.durationLabel}
          </div>
        </div>

        <div>
          <ul className="space-y-1.5">
            {nextBlock.classes.slice(0, 3).map((classBlock) => (
              <li
                key={`${classBlock.time}-${classBlock.program}`}
                className="text-sm font-bold leading-snug"
              >
                {classBlock.program}
              </li>
            ))}
          </ul>
          {nextBlock.classes.length > 3 && (
            <div className="mt-1 text-xs font-semibold text-black/55">
              +{nextBlock.classes.length - 3} more at this time
            </div>
          )}
        </div>
      </div>

      {laterBlocks.length > 0 && (
        <div className="mt-4 border-t border-black/10 pt-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-bronze">
            Later
          </div>
          {/* These rows are the narrowest layout on the site: the card is
              w-[min(92vw,390px)], so at a 320px viewport each row has very
              little width to divide between a class name and a time. Getting
              that wrong scrolls the whole page sideways rather than spilling
              quietly, because a grid track sized `auto` may not shrink below its
              items' min-content and an `li` with the default `min-width: auto`
              reports its own min-content as that minimum. `truncate` used to set
              the name `white-space: nowrap`, which made that min-content the
              entire name, and the row that would not shrink widened the document
              instead of clipping: document.scrollWidth 350 against a 320px
              viewport. Clipping the overflow is not the fix either - the hero
              tried it and cut times to `Tuesday 7:0` with no way to reveal the
              rest - so the row is made to fit instead. Two changes do it: the
              name wraps rather than truncating, which drops its floor from the
              whole name to its longest unbreakable run, and the day is
              abbreviated to three letters, which hands the difference back to
              the name - enough that all 21 class names in content/schedule.ts
              wrap to at most two lines. The two `min-w-0` are what keep that a
              bound rather than a coincidence: they release the grid track and
              the flex item from their content-based minimums, so a longer class
              name added later wraps harder instead of pushing the page wider.
              None of that is stated as a per-cell pixel figure, deliberately:
              those are machine-local, so a number belongs only where a test
              reproduces it. The abbreviation is visual only: the three letters
              are `aria-hidden` and the `sr-only` span beside them carries the
              full day, so a screen reader still reads `Wednesday 10:00 AM`
              while the row pays nothing for it - `sr-only` is out of flow and
              adds no layout width. An `aria-label` on the visible span is not
              the shorter way to write that: a bare span is `role=generic`,
              which ARIA prohibits naming, so user agents ignore the label. The
              one at ScheduleContent.tsx sits on a `role=tab` button and does
              not transfer. tests/e2e/home.spec.ts holds the 320px check and
              asserts both strings. */}
          <ul className="grid gap-1.5">
            {laterBlocks.map((block) => (
              <li
                key={`${block.day}-${block.start.toISOString()}`}
                className="flex min-w-0 items-baseline justify-between gap-3 text-xs"
              >
                <span className="min-w-0 font-semibold text-black/70">
                  {block.classes[0]?.program}
                </span>
                <span className="shrink-0 font-extrabold text-ink [font-variant-numeric:tabular-nums]">
                  {block.dayOffset === 0 ? (
                    block.startLabel
                  ) : (
                    <>
                      <span aria-hidden="true">{`${block.day.slice(0, 3)} ${block.startLabel}`}</span>
                      <span className="sr-only">{`${block.day} ${block.startLabel}`}</span>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/10 pt-3">
        <Link href="/schedule" className="text-[13px] font-bold text-ember">
          Full schedule →
        </Link>
        <Link href="/contact" className="text-[13px] font-bold text-ink">
          Try a class →
        </Link>
      </div>
    </div>
  );
}
