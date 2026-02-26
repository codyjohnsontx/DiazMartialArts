import { site } from '@/content/site';

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
    telephone: site.phone,
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
    openingHours: site.hours,
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
