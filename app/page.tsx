import Link from 'next/link';

import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';
import { HomeUpcomingClasses } from '@/components/HomeUpcomingClasses';
import { LocalBusinessSchema } from '@/components/LocalBusinessSchema';
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

const why = [
  {
    n: '01',
    t: 'Clear coaching, not chaos',
    d: 'Defined tracks, age groups, and coach-guided progression — instead of expecting people to figure it out alone.',
  },
  {
    n: '02',
    t: 'One gym, multiple paths',
    d: `Train across ${programs.length} program tracks — BJJ, Muay Thai, karate, self-defense, tactical, weapons, and youth — without bouncing between gyms.`,
  },
  {
    n: '03',
    t: 'Built for families and busy adults',
    d: 'Morning, lunch, evening, and weekend options to stay consistent through real schedules.',
  },
];

export default function HomePage() {
  return (
    <>
      <LocalBusinessSchema />

      {/* HERO */}
      <section className="border-b border-black/10">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8 lg:py-16">
          <div>
            <Eyebrow>
              {site.address.city} · Texas · Est. 1998
            </Eyebrow>
            <h1 className="display mt-5 text-5xl sm:text-7xl lg:text-[96px]">
              Martial arts
              <br />
              for real <span className="text-ember">progress.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-black/75 sm:text-lg">
              Coach-led structure, a welcoming gym culture, and class options for kids,
              teens, and adults — six days a week.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={site.ctas.primary.href} size="lg">
                {site.ctas.primary.label} →
              </Button>
              <Button href={site.ctas.secondary.href} variant="ghost" size="lg">
                {site.ctas.secondary.label}
              </Button>
            </div>
          </div>
          <div className="relative flex min-h-[520px] items-center justify-center">
            <HomeUpcomingClasses />
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:grid lg:grid-cols-[1fr_2fr] lg:gap-20 lg:px-8 lg:py-24">
        <div>
          <Eyebrow>Why Diaz</Eyebrow>
          <h2 className="display mt-4 text-3xl leading-[1.05] sm:text-4xl lg:text-[44px]">
            A better first step for beginners. A better long-term home for committed
            students.
          </h2>
        </div>
        <div className="mt-10 lg:mt-0">
          {why.map((row, i) => (
            <div
              key={row.n}
              className={`grid grid-cols-[60px_1fr] gap-6 py-7 ${
                i === 0 ? 'border-t border-black/18' : 'border-t border-black/10'
              } ${i === why.length - 1 ? 'border-b border-black/18' : ''}`}
            >
              <div className="text-[13px] font-extrabold tracking-[0.08em] text-ember">
                {row.n}
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight sm:text-[22px]">
                  {row.t}
                </h3>
                <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-black/72">
                  {row.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="border-t border-black/8 bg-sand">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
            <div>
              <Eyebrow>Programs</Eyebrow>
              <h2 className="display mt-4 text-4xl sm:text-5xl lg:text-[56px]">
                Classes for every stage
              </h2>
            </div>
            <Link
              href="/programs"
              className="border-b-2 border-ember pb-1 text-[13px] font-bold text-ink"
            >
              VIEW ALL PROGRAMS →
            </Link>
          </div>
          <div className="grid border border-black/10 bg-white sm:grid-cols-2">
            {programs.map((p, i) => {
              const lastRow = i >= programs.length - 2;
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={p.title}
                  className={`grid grid-cols-[40px_1fr_auto] items-start gap-4 p-7 ${
                    isLeft ? 'sm:border-r sm:border-black/10' : ''
                  } ${lastRow ? '' : 'border-b border-black/10'}`}
                >
                  <div className="text-[11px] font-extrabold text-ember [font-variant-numeric:tabular-nums]">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-bronze">
                      {p.tag}
                    </div>
                    <h3 className="mt-1.5 text-xl font-extrabold tracking-tight">
                      {p.title}
                    </h3>
                    <div className="mt-0.5 text-[13px] font-semibold text-bronze">
                      {p.sub}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-black/72">
                      {p.description}
                    </p>
                  </div>
                  <div
                    className="text-2xl font-light text-black/30"
                    aria-hidden="true"
                  >
                    →
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative overflow-hidden bg-ink text-sand">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 80% 20%, rgba(180,35,24,0.20), transparent 50%)',
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:gap-16 lg:px-8">
          <div>
            <Eyebrow variant="light">Get started</Eyebrow>
            <h2 className="display mt-4 text-4xl sm:text-5xl lg:text-[64px]">
              Your first class
              <br />
              is on us.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/72 sm:text-lg">
              Athletic clothes are enough. Arrive 15 minutes early — we&apos;ll handle the
              rest.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button href="/contact" size="lg" className="justify-between">
              Book a free trial <span aria-hidden="true">→</span>
            </Button>
            <Button
              href={site.phoneHref}
              variant="ghost-light"
              size="lg"
              className="justify-between"
            >
              Call {site.phone} <span aria-hidden="true">→</span>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
