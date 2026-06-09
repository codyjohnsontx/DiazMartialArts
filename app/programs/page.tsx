import { ProgramsContent } from '@/components/ProgramsContent';
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
  return <ProgramsContent />;
}
