import Image from 'next/image';

import { Card } from '@/components/Card';
import { Section } from '@/components/Section';
import { coaches } from '@/content/coaches';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Coaches',
  description:
    'Meet the Diaz Martial Arts coaching team leading youth and adult martial arts instruction.',
  path: '/coaches',
  keywords: ['martial arts coaches', 'bjj instructors san marcos', 'kids martial arts instructors'],
});

export default function CoachesPage() {
  return (
    <Section
      title="Coaches"
      titleAs="h1"
      eyebrow="Instruction"
      description="Experienced instructors focused on technical growth, safety, and long-term student development."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {coaches.map((coach) => (
          <Card key={coach.name} className="overflow-hidden p-0">
            <Image
              src={coach.image}
              alt={coach.name}
              width={600}
              height={400}
              className="h-56 w-full object-cover"
            />
            <div className="p-5">
              <h2 className="text-xl font-bold text-ink">{coach.name}</h2>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-bronze">
                {coach.rank}
              </p>
              <div className="mt-3 space-y-3">
                {coach.bio.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-sm leading-relaxed text-black/75">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
