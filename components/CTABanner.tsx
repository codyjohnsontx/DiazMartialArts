import { site } from '@/content/site';

import { Button } from './Button';
import { Section } from './Section';

export function CTABanner() {
  return (
    <Section className="pb-0">
      <div className="rounded-3xl bg-gradient-to-r from-ink via-[#191d23] to-ink p-8 shadow-[0_0_80px_rgba(180,35,24,0.2)] sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f5d8b9]">Start This Week</p>
        <h3 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Train with purpose at {site.name}.</h3>
        {/* Pull-quote stat with left ember accent border */}
        <div className="mt-5 border-l-2 border-ember pl-4">
          <p className="text-sm font-semibold text-white">First class is free.</p>
          <p className="mt-0.5 text-xs text-white/55">No commitment — come try it out.</p>
        </div>
        <p className="mt-4 max-w-2xl text-base text-white/75">
          Meet the team, take your first class, and get a program built around your goals.
        </p>
        <div className="mt-6 flex gap-3">
          <Button href={site.ctas.primary.href}>{site.ctas.primary.label}</Button>
          <Button href={site.ctas.secondary.href} variant="ghost">
            {site.ctas.secondary.label}
          </Button>
        </div>
      </div>
    </Section>
  );
}
