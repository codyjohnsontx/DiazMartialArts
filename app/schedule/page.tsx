import { ScheduleContent } from '@/components/ScheduleContent';
import { pageMetadata } from '@/lib/seo';
import { getUpcomingEvents } from '@/lib/upcoming';

export const metadata = pageMetadata({
  title: 'Schedule',
  description:
    'View the weekly class schedule and upcoming events for the next 60 days at Diaz Martial Arts.',
  path: '/schedule',
  keywords: [
    'martial arts schedule',
    'bjj class schedule',
    'muay thai schedule',
    'san marcos martial arts',
  ],
});

export default async function SchedulePage() {
  const { events } = await getUpcomingEvents();
  return <ScheduleContent upcoming={events} />;
}
