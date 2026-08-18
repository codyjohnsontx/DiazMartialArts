import { redirect } from 'next/navigation';

import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';
import { OndemandWaitlistForm } from '@/components/OndemandWaitlistForm';
import { Placeholder } from '@/components/Placeholder';
import { getAppEnv } from '@/lib/env';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Diaz on Demand',
  description: 'Diaz on Demand is coming soon. Join the waitlist for launch updates.',
  path: '/ondemand',
});

export const dynamic = 'force-dynamic';

const features = [
  {
    n: '01',
    t: 'Structured video curriculum',
    d: 'Coach-led lessons grouped into clear progression paths: fundamentals, advanced techniques, drills, and conditioning.',
  },
  {
    n: '02',
    t: 'Track your progress',
    d: 'Mark techniques as learned, drilled, and tested. Sync your at-home reps with what you train in person.',
  },
  {
    n: '03',
    t: 'Member access included',
    d: 'Diaz on Demand unlocks free for Unlimited members. Solo subscriptions available for students outside the gym.',
  },
];

const samples = [
  { t: 'Closed Guard Fundamentals', d: '12:48', n: '01' },
  { t: 'Hip Escape · Shrimp Drill', d: '08:22', n: '02' },
  { t: 'Frame from Side Control', d: '14:05', n: '03' },
  { t: 'Triangle from Guard', d: '18:40', n: '04' },
];

export default async function OndemandRoutePage() {
  const { ondemandComingSoon, ondemandUrl } = getAppEnv();

  // Show the coming-soon page whenever there is nowhere to forward people to,
  // so this route never dead-ends on an unconfigured member app.
  if (ondemandComingSoon || !ondemandUrl) {
    return (
      <>
        {/* HERO */}
        <section className="relative overflow-hidden bg-ink text-sand">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 20% 100%, rgba(180,35,24,0.25), transparent 50%), radial-gradient(circle at 90% 0%, rgba(212,160,23,0.12), transparent 40%)',
            }}
            aria-hidden="true"
          />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8">
            <div>
              <div className="inline-flex items-center gap-2 border border-gold/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                Coming soon · Q3 2026
              </div>
              <h1 className="display mt-6 text-5xl sm:text-7xl lg:text-[88px]">
                Diaz
                <br />
                <span className="text-ember">On Demand.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                A structured video library for students training outside class. Coach-led
                curriculum, progress tracking, and the same standards we run on the mat.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="#waitlist" size="lg">
                  Join the waitlist →
                </Button>
                <Button href="#samples" variant="ghost-light" size="lg">
                  Watch trailer ▸
                </Button>
              </div>
            </div>
            <div className="relative">
              <Placeholder label="Hero video · BJJ technique reel" tint="ember" height={420} />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sand shadow-lift">
                  <span
                    className="ml-1.5 inline-block h-0 w-0 border-y-[14px] border-l-[22px] border-y-transparent border-l-ink"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES + WAITLIST */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div>
              <Eyebrow>What&apos;s coming</Eyebrow>
              <h2 className="display mt-3 text-3xl leading-none sm:text-4xl lg:text-[44px]">
                Train anywhere. Same standards.
              </h2>
              <div className="mt-8">
                {features.map((f) => (
                  <div
                    key={f.n}
                    className="grid grid-cols-[60px_1fr] gap-5 border-t border-black/10 py-6"
                  >
                    <div className="text-[13px] font-extrabold tracking-[0.08em] text-ember">
                      {f.n}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight">{f.t}</h3>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed text-black/70">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="waitlist" className="self-start bg-ink p-8 text-sand sm:p-9">
              <Eyebrow variant="light">Waitlist</Eyebrow>
              <h3 className="display mt-3 text-2xl sm:text-3xl">Be first in line.</h3>
              <p className="mb-5 mt-2 text-sm leading-relaxed text-white/70">
                We&apos;ll email you when access opens, plus a 30-day intro at launch.
              </p>
              <OndemandWaitlistForm />
              <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-4 text-xs text-white/60">
                <span>2,400+ already on the list</span>
                <span>No spam. Unsubscribe anytime.</span>
              </div>
            </div>
          </div>
        </section>

        {/* SAMPLE LIBRARY */}
        <section id="samples" className="border-t border-black/10 bg-sand">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 className="display text-2xl sm:text-3xl">Sample lessons · BJJ track</h2>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-bronze">
                Locked until launch
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {samples.map((v, i) => (
                <article key={v.t} className="border border-black/10 bg-white">
                  <div className="relative">
                    <Placeholder
                      label={`Lesson · ${v.t}`}
                      tint={i % 2 ? 'ink' : 'clay'}
                      ratio="16/9"
                    />
                    <div className="absolute bottom-2.5 right-2.5 bg-ink/85 px-2 py-0.5 text-[11px] font-bold text-sand [font-variant-numeric:tabular-nums]">
                      {v.d}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-ember">
                      BJJ · {v.n}
                    </div>
                    <h3 className="mt-1.5 text-[15px] font-bold tracking-tight">{v.t}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  // The Diaz on Demand app owns members and their access, so hand every visitor
  // straight to it rather than checking anything here. next.config.mjs normally
  // handles this as a real HTTP redirect before the request reaches this page;
  // this covers the window where the env changed but nothing has rebuilt yet.
  redirect(ondemandUrl);
}
