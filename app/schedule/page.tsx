import { ScheduleContent } from '@/components/ScheduleContent';
import { UpcomingEventsSchema } from '@/components/UpcomingEventsSchema';
import { pageMetadata } from '@/lib/seo';
import { getUpcomingEvents, MAX_SHOWN_EVENTS, UPCOMING_WINDOW_DAYS } from '@/lib/upcoming';

// The upcoming list is filtered against the current time, so a page frozen at build
// time keeps announcing an event that is already over until someone redeploys.
// Matches the cadence the ICS branch already revalidates its fetch on.
export const revalidate = 1800;

export const metadata = pageMetadata({
  title: 'Schedule',
  description: `View the weekly class schedule and upcoming events for the next ${UPCOMING_WINDOW_DAYS} days at Diaz Martial Arts.`,
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
  // Cut once, here, so the cards and the Event markup describe the same events.
  const shown = events.slice(0, MAX_SHOWN_EVENTS);
  return (
    <>
      <UpcomingEventsSchema events={shown} />
      <ScheduleContent upcoming={shown} windowDays={UPCOMING_WINDOW_DAYS} />
    </>
  );
}
