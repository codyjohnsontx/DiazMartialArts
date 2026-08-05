import type { MetadataRoute } from 'next';

import { programs } from '@/content/programs';
import { site } from '@/content/site';

const routes = [
  '',
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
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
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
