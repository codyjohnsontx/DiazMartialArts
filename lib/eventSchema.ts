import { site } from '@/content/site';
import { formatSchoolIso } from '@/lib/schoolTime';
import type { UpcomingEvent } from '@/lib/upcoming';

// An all-day entry is a floating calendar date stored at UTC midnight, so its
// date is read back in UTC - the same rule /schedule prints it by. `end` on such
// an entry is the last day the event runs, which is also what schema.org means
// by `endDate` on a date-only value, so it goes out as written.
function floatingDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * One upcoming event as schema.org Event markup, built from the same
 * `UpcomingEvent` the card renders so the two cannot disagree. A timed event's
 * dates carry the gym's offset (`2026-10-08T19:00:00-05:00`) rather than the
 * `Z` form, because a listing shows the venue's local time and the offset is
 * what tells it which that is. The location is always the gym's own Place:
 * every event here happens at the gym, and `event.location` is free text such
 * as "Main Mat" that names a spot inside it, not a different address.
 *
 * `offers` is emitted only from `priceUsd`, never parsed out of `notes`: a
 * price a reader can see but a machine cannot read is the failure mode
 * `lib/openingHours.ts` records, and an Offer with a made-up price is worse
 * than none.
 */
export function toEventSchema(event: UpcomingEvent): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.allDay ? floatingDate(event.start) : formatSchoolIso(event.start.getTime()),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: site.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressRegion: site.address.state,
        postalCode: site.address.zip,
        addressCountry: site.address.country,
      },
    },
    organizer: {
      '@type': 'Organization',
      name: site.name,
      url: site.url,
    },
  };

  if (event.allDay && event.end) {
    schema.endDate = floatingDate(event.end);
  } else if (event.end && event.end.getTime() > event.start.getTime()) {
    schema.endDate = formatSchoolIso(event.end.getTime());
  }

  if (event.notes) {
    schema.description = event.notes;
  }

  if (event.priceUsd !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      price: event.priceUsd,
      priceCurrency: 'USD',
    };
  }

  return schema;
}
