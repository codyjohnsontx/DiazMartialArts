import type { Metadata } from 'next';

import { site } from '@/content/site';

type PageMetadataInput = {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
  ogType?: 'website' | 'article';
  image?: string;
};

const defaultImage = '/og-default.svg';

export function pageMetadata({
  title,
  description,
  path = '/',
  noIndex = false,
  keywords,
  ogType = 'website',
  image = defaultImage,
}: PageMetadataInput): Metadata {
  const fullTitle = `${title} | ${site.name}`;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = new URL(normalizedPath, site.url).toString();
  const imageUrl = new URL(image, site.url).toString();

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: site.name,
      type: ogType,
      images: [{ url: imageUrl, alt: `${site.name} preview` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}
