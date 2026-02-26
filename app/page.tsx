import { CTABanner } from '@/components/CTABanner';
import { LocalBusinessSchema } from '@/components/LocalBusinessSchema';
import { ProgramCard } from '@/components/ProgramCard';
import { Section } from '@/components/Section';
import { Testimonial } from '@/components/Testimonial';
import { programs } from '@/content/programs';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

import { Button } from '@/components/Button';

export const metadata = pageMetadata({
  title: 'Martial Arts in San Marcos',
  description:
    'Train at Diaz Martial Arts with Brazilian Jiu Jitsu, Muay Thai, Karate, self-defense, and youth programs.',
  path: '/',
});

const disciplines = ['Brazilian Jiu Jitsu', 'Muay Thai', 'Karate'];

const whyTrainHere = [
  'Structured beginner pathways so new students never feel lost.',
  'Experienced coaches balancing technical precision and safety.',
  'Strong team culture for hobbyists, kids, and competitors.',
  'Morning, lunch, and evening classes to fit real schedules.',
];

export default function HomePage() {
  return (
    <>
      <LocalBusinessSchema />

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left column */}
          <div className="reveal">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-bronze">Diaz Martial Arts</p>
            {/* Discipline pills */}
            <div className="mt-3 flex flex-wrap gap-2">
              {disciplines.map((d) => (
                <span
                  key={d}
                  className="rounded-full border border-ember/30 bg-ember/10 px-3 py-1 text-xs font-semibold text-ember"
                >
                  {d}
                </span>
              ))}
            </div>
            <h1 className="mt-5 font-[var(--font-heading)] text-5xl uppercase leading-none text-ink sm:text-7xl">
              Martial Arts for Real{' '}
              <span className="text-ember">Progress</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-black/75">{site.tagline}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href={site.ctas.primary.href}>{site.ctas.primary.label}</Button>
              <Button href={site.ctas.secondary.href} variant="secondary">
                {site.ctas.secondary.label}
              </Button>
            </div>
          </div>

          {/* Right column — Why Train Here */}
          <div className="reveal rounded-3xl border border-black/10 bg-white/80 p-7 shadow-ring backdrop-blur [animation-delay:120ms]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-bronze">Why Train Here</p>
            <ul className="mt-4 space-y-4">
              {whyTrainHere.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-black/75">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-ember"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8l3.5 3.5L13 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-black/10 pt-6 text-sm font-medium text-black/55">
          <span>10+ Years</span>
          <span className="text-black/20" aria-hidden="true">
            ·
          </span>
          <span>3 Programs</span>
          <span className="text-black/20" aria-hidden="true">
            ·
          </span>
          <span>San Marcos, TX</span>
        </div>
      </section>

      <Section
        eyebrow="Programs"
        title="Classes for every stage"
        description="From your first day on the mat to competition prep, every class has clear goals and coaching."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {programs.map((program) => (
            <ProgramCard key={program.title} {...program} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Student Results"
        title="What members say"
        description="Real outcomes from people training consistently at Diaz Martial Arts."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <Testimonial
            quote="I started with zero grappling experience. The fundamentals system made it click fast."
            name="Jordan T."
            detail="Member, 11 months"
          />
          <Testimonial
            quote="Our son is more focused and confident. The kids coaching is top tier."
            name="Samantha R."
            detail="Parent"
          />
          <Testimonial
            quote="Best training environment I've had in 10 years. Strong rounds, no ego."
            name="Mike L."
            detail="Competition team"
          />
        </div>
      </Section>

      <CTABanner />
    </>
  );
}
