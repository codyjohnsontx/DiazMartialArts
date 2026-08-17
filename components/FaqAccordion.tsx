'use client';

import { useState } from 'react';

import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';
import { type FaqGroup } from '@/content/faq';
import { cn } from '@/lib/utils';

type Props = {
  groups: FaqGroup[];
};

export function FaqAccordion({ groups }: Props) {
  const [open, setOpen] = useState<string | null>('0-0');
  const [activeGroup, setActiveGroup] = useState(0);

  return (
    <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
      {/* SIDEBAR */}
      <nav className="self-start lg:sticky lg:top-28">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-bronze">Topics</div>
        <ul className="mt-4 grid gap-1">
          {groups.map((g, i) => {
            const active = i === activeGroup;
            return (
              <li key={g.name}>
                <a
                  href={`#g-${i}`}
                  onClick={() => setActiveGroup(i)}
                  className={cn(
                    'block py-2.5 pl-3.5 pr-2 text-sm font-semibold transition',
                    active
                      ? 'border-l-2 border-ember text-ink'
                      : 'border-l-2 border-transparent text-black/65 hover:text-ink',
                  )}
                >
                  {g.name}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 bg-ink p-5 text-sand">
          <Eyebrow variant="light">Need help?</Eyebrow>
          <p className="my-3 text-sm leading-relaxed text-white/70">
            Front desk responds in under 24h.
          </p>
          <Button href="/contact" variant="ghost-light">
            Contact →
          </Button>
        </div>
      </nav>

      {/* GROUPS */}
      <div className="grid gap-12">
        {groups.map((g, gi) => (
          <div key={g.name} id={`g-${gi}`}>
            <h2 className="display border-b-2 border-ember pb-3 text-2xl sm:text-3xl">{g.name}</h2>
            <div className="mt-4">
              {g.items.map((item, ii) => {
                const key = `${gi}-${ii}`;
                const isOpen = open === key;
                return (
                  <div key={item.question} className="border-b border-black/10">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : key)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    >
                      <span className="text-base font-bold sm:text-lg">{item.question}</span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'text-2xl font-light text-ember transition-transform duration-200',
                          isOpen && 'rotate-45',
                        )}
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <p className="max-w-3xl pb-6 text-[15px] leading-relaxed text-black/70">
                        {item.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
