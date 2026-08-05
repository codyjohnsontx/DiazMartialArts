import Link from 'next/link';

import { Eyebrow } from '@/components/Eyebrow';
import { FaqAccordion } from '@/components/FaqAccordion';
import { FaqSchema } from '@/components/FaqSchema';
import { faqGroups } from '@/content/faq';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'FAQ',
  description:
    'Answers to common questions about classes, trial sessions, memberships, and first-day expectations.',
  path: '/faq',
  keywords: ['martial arts faq', 'bjj beginner questions', 'diaz martial arts trial class'],
});

export default function FaqPage() {
  return (
    <>
      <FaqSchema />

      {/* HERO */}
      <section className="border-b border-black/10">
        <div className="mx-auto grid w-full max-w-6xl items-end gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <Eyebrow>Common questions</Eyebrow>
            <h1 className="display mt-5 text-5xl sm:text-7xl lg:text-[88px]">FAQ</h1>
          </div>
          <p className="text-base leading-relaxed text-black/75 sm:text-lg">
            Everything you need before your first class. Still have questions?{' '}
            <Link href="/contact" className="font-bold text-ember">
              Contact us →
            </Link>
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <FaqAccordion groups={faqGroups} />
      </section>
    </>
  );
}
