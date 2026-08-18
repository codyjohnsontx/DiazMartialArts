import Image from 'next/image';
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
    d: 'Defined tracks, age groups, and coach-guided progression. Nobody is left to figure it out alone.',
  },
  {
    n: '02',
    t: 'One gym, multiple paths',
    d: `Train across ${programs.length} program tracks: BJJ, Muay Thai, karate, self-defense, tactical, weapons, and youth. No bouncing between gyms.`,
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
      <section className="relative overflow-hidden bg-ink text-sand">
        {/* The photo is framed through a box a quarter taller than the section
            and anchored to its top, so the section only ever shows the top 80%
            of the image: object-cover cannot reach past row 0.8 x 639 = 511.
            That is what keeps the Diaz crest baked into the photo's
            bottom-right corner (rows 531-630) out of frame at every width
            rather than half-cut and fighting the header logo. A plain
            object-position could not do it: from about 1280px down the section
            is tall enough that object-cover scales to the height and the whole
            image is in frame, so every row is reachable. Within that window
            55% keeps the students' faces (rows 280-360) framed from 320px to
            4K and 38% holds a face plus the standing coach in the narrow slice
            a 320px hero can show. saturate is the arbitrary form because 125 is
            off Tailwind's saturate scale and would emit no rule. */}
        <div className="absolute inset-x-0 top-0 h-[125%]">
          <Image
            src="/bjj.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[38%_55%] saturate-[1.25]"
          />
        </div>
        {/* Scrim. `bjj.jpg` is a bright gym interior whose top third is a white
            wall holding genuine 255,255,255 pixels, so the hero is inverted to
            light-on-dark and the photo is carried by a scrim that never drops
            below 82% coverage anywhere in the section. That floor is what makes
            the contrast figures a guarantee rather than a reading off one crop:
            even directly over a white pixel the lightest backdrop the section
            can produce is rgb(65,59,60), clearing AA for sand (9.9:1), gold
            (4.6:1) and white/70 (6.3:1). The floor is a bound on how much photo
            survives, and it does not depend on layer order: what reaches the
            eye from the photo is the product of every layer's (1 - alpha),
            which commutes. Order does matter to hue. CSS paints the first
            listed layer on top, so the ember radial sits above the ink and
            tints rather than darkens, lifting the red channel; the rgb(65,59,60)
            figure is computed with that tint applied. The stops live here rather
            than in Tailwind gradient utilities, which only offer three fixed
            positions, and match the inline-gradient scrim the /ondemand hero
            already uses. */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              'radial-gradient(circle at 78% 16%, rgba(180,35,24,0.18), transparent 58%)',
              'radial-gradient(115% 95% at 50% 62%, rgba(16,18,20,0) 42%, rgba(16,18,20,0.4) 100%)',
              'linear-gradient(180deg, rgba(16,18,20,0.94) 0%, rgba(16,18,20,0.86) 28%, rgba(16,18,20,0.82) 64%, rgba(16,18,20,0.95) 100%)',
            ].join(', '),
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8">
          <div>
            <h1 className="display text-5xl sm:text-7xl lg:text-[96px]">
              Martial arts
              <br />
              for real <span className="text-gold">progress.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Coach-led structure, a welcoming gym culture, and class options for kids, teens, and
              adults. Six days a week.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={site.ctas.primary.href} variant="primary-light" size="lg">
                {site.ctas.primary.label} →
              </Button>
              <Button href={site.ctas.secondary.href} variant="outline-light" size="lg">
                {site.ctas.secondary.label}
              </Button>
            </div>
          </div>
          {/* HomeUpcomingClasses is an opaque sand card whose headings carry no
              colour of their own, so they inherit. Restating ink here keeps the
              card readable now that the section around it is dark.
              min-w-0 restores what the card's "Later" rows need to stay inside
              it: that list is a grid, so each li is a grid item whose default
              min-width:auto resolves to its min-content (a nowrap label plus a
              shrink-0 time, 303px), overflowing its own 252px track. The card
              already asks for `truncate`; without this the ellipsis never
              engages and at 320px the hero's overflow-hidden clips the times
              mid-character instead. Scoped to this column, and removable once
              HomeUpcomingClasses carries its own min-w-0 (PR #24 owns it). */}
          <div className="relative flex items-center justify-start text-ink [&_li]:min-w-0 lg:min-h-[520px] lg:justify-center">
            <HomeUpcomingClasses />
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:grid lg:grid-cols-[1fr_2fr] lg:gap-20 lg:px-8 lg:py-24">
        <div>
          <Eyebrow>Why Diaz</Eyebrow>
          <h2 className="display mt-4 text-3xl leading-[1.05] sm:text-4xl lg:text-[44px]">
            A better first step for beginners. A better long-term home for committed students.
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
              <div className="text-[13px] font-extrabold tracking-[0.08em] text-ember">{row.n}</div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight sm:text-[22px]">{row.t}</h3>
                <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-black/72">{row.d}</p>
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
                    <h3 className="mt-1.5 text-xl font-extrabold tracking-tight">{p.title}</h3>
                    <div className="mt-0.5 text-[13px] font-semibold text-bronze">{p.sub}</div>
                    <p className="mt-3 text-sm leading-relaxed text-black/72">{p.description}</p>
                  </div>
                  <div className="text-2xl font-light text-black/30" aria-hidden="true">
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
            background: 'radial-gradient(circle at 80% 20%, rgba(180,35,24,0.20), transparent 50%)',
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
              Athletic clothes are enough. Arrive 15 minutes early. We&apos;ll handle the rest.
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
