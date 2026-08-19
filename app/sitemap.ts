import type { MetadataRoute } from 'next';

import { programs } from '@/content/programs';
import { site } from '@/content/site';

// `site.url` never carries a trailing slash, so an empty home route would emit
// the bare origin instead of a path. '/' publishes the home page as
// `https://host/`, which crawlers treat as equivalent to the bare origin.
const routes = [
  '/',
  '/programs',
  '/schedule',
  '/coaches',
  '/announcements',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }));

  for (const p of programs) {
    pages.push({
      url: `${site.url}/programs/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return pages;
}
