// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = process.env;

const SITE = 'https://diaz.example';
const DEPLOYMENT = 'https://diaz-abc123.vercel.app';

/**
 * lib/env and content/site each read the environment once at module load and
 * cache the result, so every case needs a fresh module graph. The node
 * environment (see the docblock above) leaves `window` undefined, which is what
 * puts readSiteUrl on the server-side VERCEL_URL branch production runs today.
 */
async function load({ siteUrl, vercelUrl }: { siteUrl?: string; vercelUrl?: string } = {}) {
  vi.resetModules();
  process.env = { ...originalEnv, NODE_ENV: 'production' };
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_URL;
  if (siteUrl) process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
  if (vercelUrl) process.env.VERCEL_URL = vercelUrl;

  const { getPublicEnv } = await import('@/lib/env');
  const { default: sitemap } = await import('@/app/sitemap');
  const { default: robots } = await import('@/app/robots');

  return {
    siteUrl: getPublicEnv().siteUrl,
    sitemapUrls: sitemap().map((entry) => entry.url),
    sitemapEntries: sitemap(),
    robots: robots(),
  };
}

/** URLs whose path begins with a second slash, e.g. `https://host//programs`. */
function withDoubleSlash(urls: string[]): string[] {
  return urls.filter((url) => /^https?:\/\/[^/]+\/\//.test(url));
}

afterEach(() => {
  process.env = originalEnv;
});

describe('siteUrl normalisation', () => {
  it('strips the trailing slash new URL() appends to a bare origin', async () => {
    expect((await load({ siteUrl: SITE })).siteUrl).toBe(SITE);
  });

  it('strips a trailing slash the operator configured', async () => {
    expect((await load({ siteUrl: `${SITE}/` })).siteUrl).toBe(SITE);
  });

  it('keeps a configured base path but drops its trailing slash', async () => {
    expect((await load({ siteUrl: `${SITE}/app/` })).siteUrl).toBe(`${SITE}/app`);
  });

  it('strips repeated trailing slashes, not just the final one', async () => {
    expect((await load({ siteUrl: `${SITE}///` })).siteUrl).toBe(SITE);
  });

  it('strips repeated trailing slashes from a configured base path', async () => {
    expect((await load({ siteUrl: `${SITE}/app///` })).siteUrl).toBe(`${SITE}/app`);
  });

  /**
   * A query or fragment is meaningless on a site base URL and would corrupt
   * every URL built from it, so it must be rejected outright. Trimming the
   * serialised string instead would silently edit the query itself, turning
   * `?source=/` into `?source=`.
   */
  it('rejects a query string rather than silently editing it', async () => {
    await expect(load({ siteUrl: `${SITE}/?source=/` })).rejects.toThrow(
      /no query string or fragment/,
    );
  });

  it('rejects a fragment rather than silently editing it', async () => {
    await expect(load({ siteUrl: `${SITE}/#section` })).rejects.toThrow(
      /no query string or fragment/,
    );
  });
});

describe('sitemap', () => {
  it('gives every entry exactly one slash after the host', async () => {
    const { sitemapUrls } = await load({ siteUrl: SITE });

    expect(withDoubleSlash(sitemapUrls)).toEqual([]);
    for (const url of sitemapUrls) {
      expect(url.startsWith(`${SITE}/`)).toBe(true);
    }
  });

  it('publishes the home page as the host with a single trailing slash', async () => {
    const { sitemapEntries } = await load({ siteUrl: SITE });

    const home = sitemapEntries.filter((entry) => entry.url === `${SITE}/`);
    expect(home).toHaveLength(1);
    expect(home[0].changeFrequency).toBe('weekly');
    expect(home[0].priority).toBe(1);
  });

  it('stays single-slash when the operator configures repeated trailing slashes', async () => {
    const { sitemapUrls, robots } = await load({ siteUrl: `${SITE}///` });

    expect(withDoubleSlash(sitemapUrls)).toEqual([]);
    expect(sitemapUrls).toContain(`${SITE}/schedule`);
    expect(robots.sitemap).toBe(`${SITE}/sitemap.xml`);
  });

  it('publishes content routes and program pages at single-slash paths', async () => {
    const { sitemapUrls } = await load({ siteUrl: SITE });

    expect(sitemapUrls).toContain(`${SITE}/schedule`);
    expect(sitemapUrls).toContain(`${SITE}/programs`);
    expect(sitemapUrls).toContain(`${SITE}/programs/brazilian-jiu-jitsu`);
  });
});

describe('robots', () => {
  it('names a single-slash sitemap URL', async () => {
    expect((await load({ siteUrl: SITE })).robots.sitemap).toBe(`${SITE}/sitemap.xml`);
  });
});

describe('deployment URL fallback', () => {
  it('still resolves from VERCEL_URL when NEXT_PUBLIC_SITE_URL is unset', async () => {
    const { siteUrl, sitemapUrls, robots } = await load({
      vercelUrl: 'diaz-abc123.vercel.app',
    });

    expect(siteUrl).toBe(DEPLOYMENT);
    expect(withDoubleSlash(sitemapUrls)).toEqual([]);
    expect(sitemapUrls).toContain(`${DEPLOYMENT}/`);
    expect(sitemapUrls).toContain(`${DEPLOYMENT}/schedule`);
    expect(robots.sitemap).toBe(`${DEPLOYMENT}/sitemap.xml`);
  });
});
