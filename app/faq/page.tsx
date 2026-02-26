import { FaqSchema } from '@/components/FaqSchema';
import { Section } from '@/components/Section';
import { faq } from '@/content/faq';
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
      <Section
        title="FAQ"
        titleAs="h1"
        eyebrow="Common Questions"
        description="Everything you need before your first class."
      >
        <div className="space-y-3">
          {faq.map((item) => (
            <details key={item.question} className="surface-card rounded-2xl p-0" name="faq-item">
              <summary className="cursor-pointer list-none px-5 py-4 text-lg font-semibold text-ink">
                {item.question}
              </summary>
              <div className="border-t border-black/10 px-5 pb-4 pt-3">
                <p className="text-sm leading-relaxed text-black/75">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
