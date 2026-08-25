import type { Metadata } from 'next';
import { accumulateMetadata, type MetadataItems } from 'next/dist/lib/metadata/resolve-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// app/layout.tsx loads its Google font through next/font/google, whose module is
// empty outside the Next build pipeline, so give it the shape the layout reads.
vi.mock('next/font/google', () => ({
  Manrope: () => ({ variable: '--font-body' }),
}));

async function loadSeo() {
  vi.resetModules();
  process.env.NEXT_PUBLIC_SITE_URL = 'https://diaz.example';
  const mod = await import('@/lib/seo');
  return mod.pageMetadata;
}

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

describe('pageMetadata', () => {
  it('builds canonical and social metadata from a route path', async () => {
    const pageMetadata = await loadSeo();

    const metadata = pageMetadata({
      title: 'Programs',
      description: 'Train BJJ, Muay Thai, and self-defense.',
      path: 'programs',
      keywords: ['bjj', 'muay thai'],
      image: '/custom-og.svg',
    });

    expect(metadata.title).toBe('Programs | Diaz Martial Arts');
    expect(metadata.description).toBe('Train BJJ, Muay Thai, and self-defense.');
    expect(metadata.keywords).toEqual(['bjj', 'muay thai']);
    expect(metadata.alternates?.canonical).toBe('https://diaz.example/programs');
    expect(metadata.openGraph?.url).toBe('https://diaz.example/programs');
    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://diaz.example/custom-og.svg', alt: 'Diaz Martial Arts preview' },
    ]);
    expect(metadata.twitter?.images).toEqual(['https://diaz.example/custom-og.svg']);
  });

  it('adds noindex robots metadata when requested', async () => {
    const pageMetadata = await loadSeo();

    const metadata = pageMetadata({
      title: 'Account',
      description: 'Private member account.',
      noIndex: true,
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

describe('pricing page metadata', () => {
  it('keeps the page served but tells search engines not to index or follow it', async () => {
    // /pricing stays live for anyone holding the link, but nothing links to it
    // and app/sitemap.ts leaves it out, so it must not surface in search either.
    vi.resetModules();
    process.env.NEXT_PUBLIC_SITE_URL = 'https://diaz.example';
    const { metadata } = await import('@/app/pricing/page');

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe('https://diaz.example/pricing');
  });
});

describe('rendered page titles', () => {
  const siteNameSuffix = ' | Diaz Martial Arts';

  async function loadRootLayoutMetadata(): Promise<Metadata> {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SITE_URL = 'https://diaz.example';
    const { metadata } = await import('@/app/layout');
    return metadata;
  }

  /**
   * Resolves a route's <title> the way Next renders it: every segment's metadata
   * export is folded in from the root layout down to the page, and a layout's
   * title.template is applied to the segments below it, never to its own layer.
   * A nested route such as /pricing is therefore [root layout, route segment
   * with no module of its own, page], while the home page shares the root
   * segment and is just [root layout, page].
   */
  async function renderTitle(layout: Metadata, page: Metadata, pathname: string) {
    const items: MetadataItems =
      pathname === '/'
        ? [
            [layout, null, null],
            [page, null, null],
          ]
        : [
            [layout, null, null],
            [null, null, null],
            [page, null, null],
          ];
    const resolved = await accumulateMetadata(items, {
      pathname,
      trailingSlash: false,
      isStandaloneMode: false,
    });
    return resolved.title?.absolute ?? '';
  }

  it('carries the site name exactly once on a nested page', async () => {
    const layout = await loadRootLayoutMetadata();
    const { metadata } = await import('@/app/pricing/page');

    const title = await renderTitle(layout, metadata, '/pricing');

    expect(title.split(siteNameSuffix).length - 1).toBe(1);
    expect(title).toBe('Pricing | Diaz Martial Arts');
  });

  it('keeps the home page title as its own headline plus the site name', async () => {
    const layout = await loadRootLayoutMetadata();
    const { metadata } = await import('@/app/page');

    const title = await renderTitle(layout, metadata, '/');

    expect(title.split(siteNameSuffix).length - 1).toBe(1);
    expect(title).toBe('Martial Arts in San Marcos | Diaz Martial Arts');
  });
});
