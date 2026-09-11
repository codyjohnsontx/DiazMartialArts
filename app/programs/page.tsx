import { Suspense } from 'react';

import { ProgramsContent, ProgramsContentWithFilter } from '@/components/ProgramsContent';
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

/**
 * The fallback is the same page with no filter applied, so the HTML this route
 * prerenders is the full unfiltered program list - every heading, every
 * description, and a link to each of the twelve program pages - rather than the
 * loading shell it used to serve. The Suspense child resolves on the client and
 * re-renders with the real `?tag=`, which only ever narrows that list.
 *
 * See the ProgramsContentWithFilter docblock for why the boundary has to be
 * here rather than around the whole route.
 */
export default function ProgramsPage() {
  return (
    <Suspense fallback={<ProgramsContent tag={null} />}>
      <ProgramsContentWithFilter />
    </Suspense>
  );
}
