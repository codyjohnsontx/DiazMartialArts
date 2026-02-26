import { Button } from '@/components/Button';
import { CTABanner } from '@/components/CTABanner';
import { LocalBusinessSchema } from '@/components/LocalBusinessSchema';
import { ProgramCard } from '@/components/ProgramCard';
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

const disciplines = ['Brazilian Jiu Jitsu', 'Muay Thai', 'Karate'];

export default function HomePage() {
  return (
    <>
      <LocalBusinessSchema />

      <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="page-hero rounded-3xl p-6 shadow-soft sm:p-8 lg:p-10">
          <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8">
            <div className="reveal">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-bronze">
                Diaz Martial Arts
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {disciplines.map((d) => (
                  <span
                    key={d}
                    className="rounded-full border border-ember/35 bg-ember/10 px-3 py-1 text-xs font-semibold text-ember"
                  >
                    {d}
                  </span>
                ))}
              </div>

              <h1 className="mt-5 font-[var(--font-heading)] text-5xl uppercase leading-none text-ink sm:text-7xl">
                Martial Arts for Real <span className="text-ember">Progress</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-black/75">
                {site.tagline}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button href={site.ctas.primary.href}>{site.ctas.primary.label}</Button>
                <Button href={site.ctas.secondary.href} variant="secondary">
                  {site.ctas.secondary.label}
                </Button>
              </div>
            </div>

            <aside
              className="reveal surface-card mx-auto flex w-full max-w-[440px] flex-col self-center rounded-2xl p-5 [animation-delay:120ms] sm:p-6 lg:justify-self-end"
              aria-label="Hero call to action"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-bronze">
                Start Today
              </p>
              <h2 className="mt-3 text-2xl font-bold text-ink">
                Try your first class with our coaching team.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-black/75">
                New students get guided onboarding and a clear plan from day one.
              </p>
              <Button href="/contact" className="mt-5 w-full">
                Book a Free Trial
              </Button>
              <p className="mt-3 text-xs text-black/60">
                No long-term commitment required to get started.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Programs"
        title="Classes for every stage"
        description="From your first day on the mat to advanced skill development, every class has clear goals and coaching."
        className="pt-10"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {programs.map((program) => (
            <ProgramCard key={program.title} {...program} />
          ))}
        </div>
      </Section>

      <CTABanner />
    </>
  );
}
