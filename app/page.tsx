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

      <section className="relative overflow-hidden border-b border-black/10 bg-[linear-gradient(180deg,#f7f3ed_0%,#f3ede4_52%,#efe6dc_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.68),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(180,35,24,0.16),transparent_28%)]" />
        <div className="relative mx-auto flex min-h-[calc(100svh-9rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="reveal mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-bronze">
              {site.address.city}, {site.address.state}
            </p>
            <h1 className="mt-4 font-[var(--font-heading)] text-5xl uppercase leading-none text-ink sm:text-7xl">
              Martial Arts for Real <span className="text-ember">Progress</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-black/72 sm:text-lg">
              Train with coach-led structure, a welcoming gym culture, and class options for kids,
              teens, and adults six days a week.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button href={site.ctas.primary.href}>{site.ctas.primary.label}</Button>
              <Button href={site.ctas.secondary.href} variant="secondary">
                {site.ctas.secondary.label}
              </Button>
            </div>

            <ul className="mx-auto mt-8 grid max-w-3xl gap-3 text-left text-sm text-black/68 sm:grid-cols-3">
              <li className="border-l border-black/12 pl-3">
                Youth and adult tracks with coach-guided progression.
              </li>
              <li className="border-l border-black/12 pl-3">
                Gi, no-gi, striking, self-defense, and kids classes.
              </li>
              <li className="border-l border-black/12 pl-3">
                First class is easy to start. Athletic clothes are enough.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Why Diaz Martial Arts"
        title="A better first step for beginners and a better long-term home for committed students"
        className="[&>header]:mx-auto [&>header]:text-center [&>header>p]:justify-center"
      >
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          <div className="border-b border-black/10 pb-5">
            <h2 className="text-xl font-bold text-ink">Clear coaching, not chaos</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-black/72">
              New students do better when the room feels structured. The class lineup here is built
              around defined tracks, age groups, and coach-guided progression instead of expecting
              people to figure it out on their own.
            </p>
          </div>
          <div className="border-b border-black/10 pb-5">
            <h2 className="text-xl font-bold text-ink">One gym, multiple training paths</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-black/72">
              Train across {programs.length} program tracks including BJJ, Muay Thai, karate,
              self-defense, tactical work, and youth classes without bouncing between separate gyms.
            </p>
          </div>
          <div className="pb-1">
            <h2 className="text-xl font-bold text-ink">Built for families and busy adults</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-black/72">
              Morning, lunch, evening, and weekend options make it easier to stay consistent for
              students from {site.serviceArea.join(', ')} and the surrounding area.
            </p>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Programs"
        title="Classes for every stage"
        className="pt-6 text-center [&>header]:mx-auto [&>header]:text-center [&>header>p]:justify-center"
      >
        <ul className="mx-auto max-w-4xl divide-y divide-black/10">
          {programs.map((program) => (
            <li key={program.title} className="py-5 first:pt-0 last:pb-0">
              <span
                className="mx-auto mb-3 block h-0.5 w-5 rounded-full bg-ember"
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
