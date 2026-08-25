import { beforeEach, describe, expect, it, vi } from 'vitest';

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
