'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Eyebrow } from '@/components/Eyebrow';
import { Placeholder } from '@/components/Placeholder';
import { type Program, type ProgramTag, programs } from '@/content/programs';
import { cn } from '@/lib/utils';

const filters: ('All' | ProgramTag)[] = [
  'All',
  'Grappling',
  'Striking',
  'Self-Defense',
  'Weapons',
  'Tactical',
  'Youth',
];

function parseTag(raw: string | null): 'All' | ProgramTag {
  if (!raw) return 'All';
  const match = filters.find((f) => f.toLowerCase() === raw.toLowerCase());
  return match ?? 'All';
}

const onboardingSteps = [
  {
    n: 'Week 1',
    t: 'Trial class',
    d: "Athletic clothes are enough. We'll match you with the right intro session.",
  },
  {
    n: 'Week 2',
    t: 'Onboarding',
    d: 'Coach-guided fundamentals. Learn falling, framing, base, and gym etiquette.',
  },
  {
    n: 'Week 3',
    t: 'Pick a track',
    d: 'Settle into 1–2 disciplines. Most students start with BJJ or kids program.',
  },
  {
    n: 'Week 4',
    t: 'Full schedule',
    d: 'Train 2–4× per week. Open mat unlocks for unlimited members.',
  },
];

export function ProgramsContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = parseTag(searchParams.get('tag'));
  const [filter, setFilter] = useState<'All' | ProgramTag>(initial);

  useEffect(() => {
    setFilter(parseTag(searchParams.get('tag')));
  }, [searchParams]);

  const filtered = useMemo<Program[]>(
    () => (filter === 'All' ? programs : programs.filter((p) => p.tag === filter)),
    [filter],
  );

  function updateFilter(next: 'All' | ProgramTag) {
    const params = new URLSearchParams(searchParams.toString());

    if (next === 'All') {
      params.delete('tag');
    } else {
      params.set('tag', next);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <>
      {/* PAGE HEADER */}
      <section className="border-b border-black/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="display text-5xl sm:text-7xl lg:text-[88px]">Programs</h1>
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-black/10 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {filters.map((t) => {
              const active = filter === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={active}
                  onClick={() => updateFilter(t)}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-[0.06em] transition',
                    active
                      ? 'border border-ink bg-ink text-sand'
                      : 'border border-black/18 bg-transparent text-black/70 hover:border-black/40',
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CARDS */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {filtered.map((p, i) => (
            <Link
              key={p.title}
              href={`/programs/${p.slug}`}
              className="grid border border-black/10 bg-white transition hover:border-black/25 hover:shadow-sm sm:grid-cols-[180px_1fr]"
            >
              <Placeholder
                label={p.tag}
                tint={i % 2 ? 'clay' : 'ink'}
                ratio="1/1"
                src={p.image}
                alt={`${p.title} class at Diaz Martial Arts`}
              />
              <div className="flex flex-col p-7">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-bronze">
                  {p.tag}
                </div>
                <h3 className="mt-2 text-xl font-extrabold leading-tight tracking-tight sm:text-[22px]">
                  {p.title}
                </h3>
                <div className="text-[13px] font-semibold text-bronze">{p.sub}</div>
                <p className="my-4 flex-1 text-sm leading-relaxed text-black/72">{p.description}</p>
                <div className="flex gap-4 border-t border-black/10 pt-3 text-xs font-semibold">
                  <span>
                    <span className="text-black/50">Ages</span> · {p.age}
                  </span>
                  <span>
                    <span className="text-black/50">Level</span> · {p.level}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* HOW IT WORKS */}
        <div className="mt-20 border-y border-black/10 py-12">
          <Eyebrow>Getting started</Eyebrow>
          <h2 className="display mt-3 text-3xl sm:text-4xl">What your first month looks like</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {onboardingSteps.map((s) => (
              <div key={s.n} className="border-t-2 border-ember pt-4">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ember">
                  {s.n}
                </div>
                <h3 className="mt-2 text-lg font-extrabold">{s.t}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-black/72">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
