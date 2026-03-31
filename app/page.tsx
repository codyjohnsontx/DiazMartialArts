import Link from 'next/link';

import { Button } from '@/components/Button';
import { LocalBusinessSchema } from '@/components/LocalBusinessSchema';
import { Section } from '@/components/Section';
import { programs } from '@/content/programs';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Martial Arts in San Marcos',
  description:
    'Train at Diaz Martial Arts with Brazilian Jiu Jitsu, Muay Thai, Karate, self-defense, and youth programs in San Marcos, TX.',
  path: '/',
  keywords: [
    'martial arts san marcos',
    'bjj san marcos',
    'muay thai san marcos',
    'kids martial arts san marcos',
  ],
});

export default function HomePage() {
  return (
    <>
      <LocalBusinessSchema />

      <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-16 text-center sm:px-6 lg:px-8 lg:pt-20">
        <div className="reveal mx-auto max-w-3xl">
          <h1 className="font-[var(--font-heading)] text-5xl uppercase leading-none text-ink sm:text-7xl">
            Martial Arts for Real <span className="text-ember">Progress</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-black/75">
            {site.tagline}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button href={site.ctas.primary.href}>{site.ctas.primary.label}</Button>
            <Button href={site.ctas.secondary.href} variant="secondary">
              {site.ctas.secondary.label}
            </Button>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Programs"
        title="Classes for every stage"
        className="pt-10"
      >
        <ul className="divide-y divide-black/10">
          {programs.map((program) => (
            <li key={program.title} className="flex gap-4 py-5 first:pt-0 last:pb-0">
              <span
                className="mt-1.5 h-3 w-0.5 shrink-0 rounded-full bg-ember"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-base font-bold text-ink">{program.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-black/70">
                  {program.description}
                </p>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-bronze">
                  {program.age} · {program.level}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/programs"
          className="mt-8 inline-flex items-center text-sm font-semibold text-ember hover:text-[#941f15]"
        >
          View all programs →
        </Link>
      </Section>
    </>
  );
}
