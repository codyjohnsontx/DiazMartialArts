import { describe, expect, it } from 'vitest';

import { site } from '@/content/site';
import { formatOpeningHours, toOpeningHoursSpecification } from '@/lib/openingHours';

/**
 * Opening hours are published twice - as the lines the footer and the contact
 * page print, and as the markup a search engine reads - and the two must say
 * the same thing. They are derived from one list for that reason, so what needs
 * guarding is that the derivation still produces both correctly.
 *
 * The markup half is the half that failed silently. schema.org types
 * `openingHours` as Text, so the display strings this site used to emit into it
 * ("Mon-Fri: 7:00 AM - 9:00 PM") pass validator.schema.org with zero errors and
 * zero warnings while carrying nothing a consumer can parse: the documented
 * format is `Mo-Fr 07:00-21:00`. A validator run is therefore not evidence of
 * anything here, and neither is the property being present - which is the whole
 * trap. These assertions read the values instead.
 */
describe('opening hours', () => {
  it('renders the visible lines the site has always shown', () => {
    expect(site.hours).toEqual([
      'Mon-Fri: 7:00 AM - 9:00 PM',
      'Sat: 8:00 AM - 1:00 PM',
      'Sun: Closed',
    ]);
  });

  it('renders midnight and noon boundaries as a reader writes them', () => {
    expect(
      formatOpeningHours([
        { days: ['Monday'], label: 'Mon', hours: { opens: '00:00', closes: '12:00' } },
        { days: ['Tuesday'], label: 'Tue', hours: { opens: '12:30', closes: '23:45' } },
      ]),
    ).toEqual(['Mon: 12:00 AM - 12:00 PM', 'Tue: 12:30 PM - 11:45 PM']);
  });

  it('emits 24-hour times and full day names for every rule', () => {
    const spec = toOpeningHoursSpecification(site.openingHours);

    expect(spec).toHaveLength(site.openingHours.length);
    for (const entry of spec) {
      expect(entry['@type']).toBe('OpeningHoursSpecification');
      expect(entry.dayOfWeek.length).toBeGreaterThan(0);
      // The format is the point: 24-hour HH:MM, never "7:00 AM".
      expect(entry.opens).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      expect(entry.closes).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    }
  });

  it('states a closed day as 00:00 to 00:00 rather than omitting it', () => {
    const spec = toOpeningHoursSpecification(site.openingHours);
    const sunday = spec.find((entry) => entry.dayOfWeek.includes('Sunday'));

    expect(sunday).toMatchObject({ opens: '00:00', closes: '00:00' });
  });

  it('says the same thing on the page and in the markup for every rule', () => {
    // The two halves are published separately - the footer prints one, a search
    // engine reads the other - so the guard is that no rule can make them
    // disagree. A day the page calls Closed must be 00:00-00:00 in the markup,
    // and an open day's markup times must be the ones the line names.
    const rules = [
      { days: ['Monday' as const], label: 'Mon', hours: { opens: '10:00', closes: '19:30' } },
      { days: ['Sunday' as const], label: 'Sun', hours: null },
    ];
    const lines = formatOpeningHours(rules);
    const spec = toOpeningHoursSpecification(rules);

    expect(lines).toEqual(['Mon: 10:00 AM - 7:30 PM', 'Sun: Closed']);
    expect(spec[0]).toMatchObject({ opens: '10:00', closes: '19:30' });
    expect(spec[1]).toMatchObject({ opens: '00:00', closes: '00:00' });
  });

  it('covers all seven days exactly once, so no day is left unstated', () => {
    const days = toOpeningHoursSpecification(site.openingHours).flatMap((e) => e.dayOfWeek);

    expect([...days].sort()).toEqual(
      ['Friday', 'Monday', 'Saturday', 'Sunday', 'Thursday', 'Tuesday', 'Wednesday'].sort(),
    );
  });
});
