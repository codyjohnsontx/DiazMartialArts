import Link from 'next/link';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Section } from '@/components/Section';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Pricing',
  description: 'Membership options for adults and kids at Diaz Martial Arts in San Marcos, Texas.',
  path: '/pricing',
  keywords: ['martial arts pricing', 'bjj membership cost', 'kids martial arts pricing san marcos'],
});

const plans = [
  {
    name: 'Essentials',
    price: '$159/mo',
    notes: '2 classes per week',
    features: ['Adult class access', 'Flexible scheduling', 'Month-to-month billing'],
  },
  {
    name: 'Unlimited',
    price: '$199/mo',
    notes: 'Most popular',
    features: ['Unlimited class access', 'Open mat access', 'Priority workshop registration'],
  },
  {
    name: 'Kids Program',
    price: '$139/mo',
    notes: 'Ages 6-14',
    features: ['2-3 youth classes weekly', 'Progress tracking', 'Belt promotion support'],
  },
];

export default function PricingPage() {
  return (
    <Section
      title="Pricing"
      titleAs="h1"
      eyebrow="Membership"
      description="Straightforward plans with clear options for families and adult students."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="h-full">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-bronze">
              {plan.notes}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink">{plan.name}</h2>
            <p className="mt-2 text-3xl font-bold text-ink">{plan.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-black/75">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href={site.ctas.primary.href}>{site.ctas.primary.label}</Button>
        <Link
          href="/contact"
          className="inline-flex items-center text-sm font-semibold text-ink hover:text-ember"
        >
          Questions about plans? Contact us →
        </Link>
      </div>
    </Section>
  );
}
