import { site } from '@/content/site';

import { Button } from './Button';
import { Section } from './Section';

export function CTABanner() {
  return (
    <Section className="pb-0">
      <div className="rounded-3xl bg-gradient-to-r from-ink via-[#191d23] to-ink p-8 shadow-[0_0_80px_rgba(180,35,24,0.2)] sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f5d8b9]">
          San Marcos, TX
        </p>
        <h3 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          Classes 6 days a week.
        </h3>
        <div className="mt-5 border-l-2 border-ember pl-4">
          <p className="text-sm text-white/80">{site.address.street}</p>
          <p className="mt-0.5 text-sm text-white/80">
            {site.address.city}, {site.address.state} {site.address.zip}
          </p>
          <p className="mt-1 text-xs text-white/55">
            {site.hours[0]} · {site.hours[1]}
          </p>
        </div>
        <p className="mt-4 max-w-2xl text-base text-white/75">
          Drop in for a free first class or check the schedule to find the right session for you.
        </p>
        <div className="mt-6 flex gap-3">
          <Button href={site.ctas.secondary.href}>{site.ctas.secondary.label}</Button>
          <Button href="/coaches" variant="ghost">
            Meet the Coaches
          </Button>
        </div>
      </div>
    </Section>
  );
}
