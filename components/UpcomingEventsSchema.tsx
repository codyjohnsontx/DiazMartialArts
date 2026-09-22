import { toEventSchema } from '@/lib/eventSchema';
import type { UpcomingEvent } from '@/lib/upcoming';

/**
 * schema.org Event markup for the events /schedule shows. Hand it the same
 * list the card grid renders, and nothing more: markup for an event a reader
 * cannot see on the page is markup a search engine is told not to trust.
 */
export function UpcomingEventsSchema({ events }: { events: UpcomingEvent[] }) {
  if (events.length === 0) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(events.map(toEventSchema)),
      }}
    />
  );
}
