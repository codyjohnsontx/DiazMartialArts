import { describe, expect, it } from 'vitest';

import { site } from '@/content/site';
import { toEventSchema } from '@/lib/eventSchema';
import type { UpcomingEvent } from '@/lib/upcoming';

/**
 * Event markup is only useful if a consumer can read the values, and a
 * validator run says nothing about that: schema.org types most of these
 * properties loosely enough that a wrong value passes clean. So these read the
 * emitted values themselves - the exact date string, the exact offer shape -
 * rather than asserting that the properties are present.
 */
describe('toEventSchema', () => {
  const timed: UpcomingEvent = {
    id: 'seminar',
    title: 'Master Cleber Luciano',
    start: new Date('2026-10-08T19:00:00-05:00'),
    end: new Date('2026-10-08T21:00:00-05:00'),
    location: 'Diaz Martial Arts',
    priceUsd: 125,
  };

  it("writes a timed event's dates on the gym's clock with its offset", () => {
    const schema = toEventSchema(timed);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Event');
    expect(schema.name).toBe('Master Cleber Luciano');
    // Not the `Z` form: `2026-10-09T00:00:00.000Z` is the same instant, but a
    // listing built from it needs the venue's zone to show 7:00 PM again.
    expect(schema.startDate).toBe('2026-10-08T19:00:00-05:00');
    expect(schema.endDate).toBe('2026-10-08T21:00:00-05:00');
  });

  it("writes a winter event with the gym's winter offset", () => {
    const schema = toEventSchema({
      id: 'winter',
      title: 'Winter Open Mat',
      start: new Date('2026-12-12T10:00:00-06:00'),
    });

    expect(schema.startDate).toBe('2026-12-12T10:00:00-06:00');
    expect(schema).not.toHaveProperty('endDate');
  });

  it('marks the event as a scheduled, in-person event at the gym', () => {
    const schema = toEventSchema(timed);

    expect(schema.eventStatus).toBe('https://schema.org/EventScheduled');
    expect(schema.eventAttendanceMode).toBe('https://schema.org/OfflineEventAttendanceMode');
    expect(schema.location).toEqual({
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
    });
    expect(schema.organizer).toEqual({
      '@type': 'Organization',
      name: site.name,
      url: site.url,
    });
  });

  it('keeps the gym Place when the location names the gym in other casing or spacing', () => {
    const schema = toEventSchema({ ...timed, location: '  diaz MARTIAL arts ' });

    expect(schema.location).toMatchObject({ '@type': 'Place', name: site.name });
    expect(schema.location).toHaveProperty('address.streetAddress', site.address.street);
  });

  it('names an off-site venue without giving it the gym address', () => {
    const schema = toEventSchema({ ...timed, location: 'Austin Convention Center' });

    expect(schema.location).toEqual({ '@type': 'Place', name: 'Austin Convention Center' });
  });

  it('emits an Offer in US dollars from the structured price', () => {
    const schema = toEventSchema(timed);

    expect(schema.offers).toEqual({
      '@type': 'Offer',
      price: 125,
      priceCurrency: 'USD',
    });
  });

  it('emits no Offer when no price is known, even if the notes mention money', () => {
    // A price only in free text is not one a machine can read, and inventing
    // an Offer from it would publish a number nobody set.
    const schema = toEventSchema({
      ...timed,
      priceUsd: undefined,
      notes: 'Cost: $125 at the door',
    });

    expect(schema).not.toHaveProperty('offers');
    expect(schema.description).toBe('Cost: $125 at the door');
  });

  it('leaves the description out when the event carries no notes', () => {
    expect(toEventSchema(timed)).not.toHaveProperty('description');
  });

  it("writes an all-day event as the flyer's calendar dates, with no time", () => {
    // A floating date stored at UTC midnight, read back in UTC: the same day
    // the card prints, whatever zone the server or a visitor runs in. `end` is
    // already the last day the event runs, which is what endDate means here.
    const schema = toEventSchema({
      id: 'stripe-testing',
      title: 'Stripe Testing',
      start: new Date('2026-08-26T00:00:00Z'),
      end: new Date('2026-08-27T00:00:00Z'),
      allDay: true,
    });

    expect(schema.startDate).toBe('2026-08-26');
    expect(schema.endDate).toBe('2026-08-27');
  });

  it('omits endDate for a timed event that ends where it starts', () => {
    const schema = toEventSchema({ ...timed, end: timed.start });

    expect(schema).not.toHaveProperty('endDate');
  });
});
