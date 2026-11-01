import { site } from '@/content/site';

import { Button } from './Button';
import { Section } from './Section';

export function CTABanner() {
  return (
    <Section className="pb-0">
      <div className="rounded-3xl bg-gradient-to-r from-ink via-[#191d23] to-ink p-8 shadow-[0_0_80px_rgba(180,35,24,0.2)] sm:p-12">
        <h3 className="text-3xl font-bold text-white sm:text-4xl">Classes 6 days a week.</h3>
        <p className="mt-4 max-w-2xl text-base text-white/75">
          Drop in for a free first class or check the schedule to find the right session for you.
        </p>
        <div className="mt-6 flex gap-3">
          <Button href={site.ctas.secondary.href} variant="primary-light">
            {site.ctas.secondary.label}
          </Button>
          <Button href={site.ctas.coaches.href} variant="ghost-light">
            {site.ctas.coaches.label}
          </Button>
        </div>
      </div>
    </Section>
  );
}
