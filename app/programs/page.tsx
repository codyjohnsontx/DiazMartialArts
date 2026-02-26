import { ProgramCard } from '@/components/ProgramCard';
import { Section } from '@/components/Section';
import { programs } from '@/content/programs';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Programs',
  description:
    'Explore Brazilian Jiu Jitsu, Muay Thai, Karate, self-defense, tactical, and youth programs at Diaz Martial Arts.',
  path: '/programs',
  keywords: [
    'martial arts programs',
    'kids martial arts',
    'bjj classes',
    'muay thai classes',
    'karate classes',
  ],
});

export default function ProgramsPage() {
  return (
    <Section
      title="Programs"
      titleAs="h1"
      eyebrow="Training Path"
      description="Choose a class track that matches your age, experience level, and goals."
    >
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="surface-card rounded-2xl p-5 text-sm text-black/75">
          Beginner-friendly onboarding and coach-guided progression.
        </div>
        <div className="surface-card rounded-2xl p-5 text-sm text-black/75">
          Separate youth and adult tracks with age-appropriate curriculum.
        </div>
        <div className="surface-card rounded-2xl p-5 text-sm text-black/75">
          Gi, no-gi, striking, and self-defense pathways under one roof.
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {programs.map((program) => (
          <ProgramCard key={program.title} {...program} />
        ))}
      </div>
    </Section>
  );
}
