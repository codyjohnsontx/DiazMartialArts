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
          <ul className="grid gap-1.5">
            {laterBlocks.map((block) => (
              <li
                key={`${block.day}-${block.start.toISOString()}`}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="truncate font-semibold text-black/70">
                  {block.classes[0]?.program}
                </span>
                <span className="shrink-0 font-extrabold text-ink [font-variant-numeric:tabular-nums]">
                  {block.dayOffset === 0 ? block.startLabel : `${block.day} ${block.startLabel}`}
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
