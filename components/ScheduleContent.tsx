'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';
import { type ProgramTag } from '@/content/programs';
import {
  classDescriptions,
  printableSchedules,
  type WeeklySchedule,
  weeklySchedule,
} from '@/content/schedule';
import { parseClassTimeRange } from '@/lib/classSchedule';
import { type UpcomingEvent } from '@/lib/upcoming';
import { cn } from '@/lib/utils';

const dayShort: Record<WeeklySchedule['day'], string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const tagColors: Record<ProgramTag, string> = {
  Grappling: '#B42318',
  Striking: '#8A4B10',
  Weapons: '#5C7A1A',
  'Self-Defense': '#1A4B7A',
  Tactical: '#101214',
  Youth: '#D4A017',
};

function programToTag(program: string): ProgramTag {
  if (/jiu jitsu|bjj|grappl/i.test(program)) return 'Grappling';
  if (/muay|boxing|kick/i.test(program)) return 'Striking';
  if (/haganah|self defense|self-defense/i.test(program)) return 'Self-Defense';
  if (/i\.p\.t\.t|tactical|handgun|rifle/i.test(program)) return 'Tactical';
  if (/weapons|filipino|jkd|kali|arnis/i.test(program)) return 'Weapons';
  if (/dragon|junior|kids|tkd/i.test(program)) return 'Youth';
  return 'Striking';
}

function classCategory(coach: string, program: string): string {
  if (/Kids/i.test(coach)) return 'Kids';
  if (/junior|dragon|ages/i.test(program)) return 'Kids';
  return 'Adult';
}

function durationFromTime(time: string): string {
  const parsed = parseClassTimeRange(time);
  if (!parsed) return '';

  const diff = parsed.endMinutes - parsed.startMinutes;
  if (diff <= 0) return '';
  return `${diff}m`;
}

function startTime(time: string): string {
  const match = time.match(/^(\d+:\d+\s*(AM|PM))/i);
  return match ? match[1].replace(/\s+/g, ' ') : time;
}

type Props = {
  upcoming: UpcomingEvent[];
};

const monthShort = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

function formatEventLocation(event: UpcomingEvent): string {
  const time = event.start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  if (event.location) return `${event.location} · ${time}`;
  return time;
}

export function ScheduleContent({ upcoming }: Props) {
  const [activeDay, setActiveDay] = useState<WeeklySchedule['day']>('Monday');
  const dayData = weeklySchedule.find((d) => d.day === activeDay) ?? weeklySchedule[0];

  return (
    <>
      {/* HERO */}
      <section className="border-b border-black/10">
        <div className="mx-auto grid w-full max-w-6xl items-end gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <h1 className="display text-5xl sm:text-7xl lg:text-[88px]">Schedule</h1>
          </div>
          <p className="text-base leading-relaxed text-black/75 sm:text-lg">
            Use the weekly lineup for your routine, then check the monthly calendar for events.
          </p>
        </div>
      </section>

      {/* WEEKLY */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-2xl sm:text-3xl">Weekly class schedule</h2>
          <div className="flex flex-wrap gap-3 text-[11px] font-bold uppercase tracking-[0.14em]">
            {Object.entries(tagColors).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2"
                  style={{ background: v }}
                  aria-hidden="true"
                />
                <span className="text-black/70">{k}</span>
              </span>
            ))}
          </div>
        </div>

        {/* DAY TABS */}
        <div
          role="tablist"
          aria-label="Weekly schedule days"
          className="grid grid-cols-7 border border-black/10 bg-white"
        >
          {weeklySchedule.map((d) => {
            const active = d.day === activeDay;
            const closed = d.classes.length === 0;
            return (
              <button
                key={d.day}
                type="button"
                role="tab"
                aria-label={`${d.day} schedule`}
                aria-selected={active}
                onClick={() => !closed && setActiveDay(d.day)}
                disabled={closed}
                className={cn(
                  'border-r border-black/10 py-5 text-center last:border-r-0',
                  active ? 'bg-ink text-sand' : 'bg-transparent text-ink',
                  closed && 'cursor-not-allowed opacity-40',
                )}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70 sm:text-[11px]">
                  {dayShort[d.day]}
                </div>
                {d.note && (
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] opacity-70 sm:text-[10px]">
                    {d.note}
                  </div>
                )}
                <div className="mt-1 text-2xl font-extrabold [font-variant-numeric:tabular-nums] sm:text-[28px]">
                  {d.classes.length}
                </div>
                <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] opacity-60 sm:text-[10px]">
                  {closed ? 'Closed' : 'Classes'}
                </div>
              </button>
            );
          })}
        </div>

        {/* CLASSES */}
        <div className="mt-6 border border-black/10 bg-white">
          {dayData.classes.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-black/60">No classes scheduled.</p>
          ) : (
            dayData.classes.map((c, i) => {
              const tag = programToTag(c.program);
              const cat = classCategory(c.coach, c.program);
              const duration = durationFromTime(c.time);
              const start = startTime(c.time);
              return (
                <details
                  key={`${dayData.day}-${i}-${c.time}-${c.program}`}
                  className={cn('group', i > 0 && 'border-t border-black/10')}
                >
                  <summary className="grid cursor-pointer list-none grid-cols-[90px_1fr] items-center gap-4 px-6 py-4 sm:grid-cols-[110px_60px_1fr_140px_auto] sm:px-6">
                    <div className="text-base font-extrabold tracking-tight [font-variant-numeric:tabular-nums] sm:text-lg">
                      {start}
                    </div>
                    <div className="hidden text-xs font-semibold text-black/55 sm:block">
                      {duration}
                    </div>
                    <div>
                      <div className="text-[15px] font-bold sm:text-base">{c.program}</div>
                      <div className="mt-0.5 text-xs text-black/55">{cat} class</div>
                    </div>
                    <div className="hidden sm:block">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-black/70">
                        <span
                          className="inline-block h-2 w-2"
                          style={{ background: tagColors[tag] }}
                          aria-hidden="true"
                        />
                        {tag}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="text-xl text-black/30 transition group-open:rotate-90"
                    >
                      →
                    </span>
                  </summary>
                  <p className="border-t border-black/10 bg-sand/60 px-6 py-3 text-sm leading-relaxed text-black/75">
                    {classDescriptions[c.program] ?? 'Class details coming soon.'}
                  </p>
                </details>
              );
            })
          )}
        </div>
      </section>

      {/* PRINTABLE SCHEDULES */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Printable sheets</Eyebrow>
            <h2 className="display mt-3 text-2xl sm:text-3xl">Class schedule flyers</h2>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {printableSchedules.map((schedule) => (
            <article key={schedule.title}>
              <div className="mb-3 flex items-center justify-between gap-4">
                <h3 className="text-lg font-extrabold text-ink">{schedule.title}</h3>
                <Link
                  href={schedule.pdf}
                  className="text-sm font-bold text-ember hover:underline"
                  target="_blank"
                >
                  Open PDF
                </Link>
              </div>
              <Image
                src={schedule.image}
                alt={schedule.alt}
                width={1800}
                height={1390}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-auto w-full border border-black/10 bg-white"
              />
            </article>
          ))}
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="mt-16 bg-ink text-sand">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow variant="light">Next 60 days</Eyebrow>
              <h2 className="display mt-3 text-3xl sm:text-[44px]">Upcoming events</h2>
            </div>
            <Button href="/announcements" variant="ghost-light">
              Open monthly calendar →
            </Button>
          </div>

          {upcoming.length === 0 ? (
            <div className="max-w-xl">
              <p className="text-base leading-relaxed text-white/70 sm:text-lg">
                No special events on the calendar right now. Regular classes run six days a week,
                and the full weekly schedule is at the top of this page.
              </p>
              <Button href="/contact" size="lg" className="mt-6">
                Book Free Trial →
              </Button>
            </div>
          ) : (
            <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {upcoming.slice(0, 4).map((e) => {
                const m = monthShort[e.start.getMonth()];
                const d = String(e.start.getDate()).padStart(2, '0');
                return (
                  <div key={e.id} className="flex min-h-[200px] flex-col gap-4 bg-ink p-6">
                    <div className="flex items-baseline gap-2">
                      <div className="text-[11px] font-bold tracking-[0.22em] text-gold">{m}</div>
                      <div className="text-5xl font-extrabold leading-none tracking-tight [font-variant-numeric:tabular-nums] sm:text-[56px]">
                        {d}
                      </div>
                    </div>
                    <div className="mt-auto">
                      <h3 className="text-lg font-extrabold tracking-tight">{e.title}</h3>
                      <p className="mt-1.5 text-[13px] text-white/65">{formatEventLocation(e)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
