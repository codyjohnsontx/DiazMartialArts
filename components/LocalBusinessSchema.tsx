import { site } from '@/content/site';
import { toOpeningHoursSpecification } from '@/lib/openingHours';

export function LocalBusinessSchema() {
  const sameAs = [site.socials.instagram, site.socials.facebook, site.socials.youtube].filter(
    Boolean,
  );

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': `${site.url}#localbusiness`,
    name: site.name,
    description: site.description,
    // The dialable form, not the formatted one the page prints. Google asks for
    // the country and area code here, and this is the value a machine matches
    // against the same number listed elsewhere; the visible NAP is unchanged.
    telephone: site.phoneHref.replace(/^tel:/, ''),
    email: site.email,
    url: site.url,
    image: new URL('/og-default.svg', site.url).toString(),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: site.address.country,
    },
    sameAs,
    openingHoursSpecification: toOpeningHoursSpecification(site.openingHours),
  };

  if (site.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    };
  }

  if (site.serviceArea?.length) {
    schema.areaServed = site.serviceArea.map((area) => ({
      '@type': 'AdministrativeArea',
      name: area,
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
