import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalEnv = process.env;

async function loadEnv() {
  vi.resetModules();
  return import('@/lib/env');
}

function resetProcessEnv() {
  process.env = {
    ...originalEnv,
    NODE_ENV: 'test',
  };
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_ONDEMAND_URL;
  delete process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL;
  delete process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL;
  delete process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
  delete process.env.ONDEMAND_COMING_SOON;
  delete process.env.VERCEL_URL;
}

beforeEach(() => {
  resetProcessEnv();
});

afterEach(() => {
  process.env = originalEnv;
});

describe('getPublicEnv', () => {
  it('uses local defaults outside production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { getPublicEnv } = await loadEnv();

    expect(getPublicEnv()).toMatchObject({
      siteUrl: 'http://localhost:3000',
      ondemandUrl: undefined,
    });
  });

  it('normalizes configured absolute URLs', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/app';
    process.env.NEXT_PUBLIC_ONDEMAND_URL = 'https://vod.example.com';
    process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT = 'https://formspree.io/f/example';
    const { getPublicEnv } = await loadEnv();

    expect(getPublicEnv()).toMatchObject({
      siteUrl: 'https://example.com/app',
      ondemandUrl: 'https://vod.example.com/',
      formspreeEndpoint: 'https://formspree.io/f/example',
    });
  });

  it('throws for invalid configured URLs', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'diazmartialarts.test';
    const { getPublicEnv } = await loadEnv();

    expect(() => getPublicEnv()).toThrow(/NEXT_PUBLIC_SITE_URL must be a full absolute URL/);
  });
});

describe('getAppEnv', () => {
  it('parses server env flags', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://diaz.example';
    process.env.NEXT_PUBLIC_ONDEMAND_URL = 'https://vod.example.com';
    process.env.ONDEMAND_COMING_SOON = 'true';
    const { getAppEnv } = await loadEnv();

    expect(getAppEnv()).toMatchObject({
      siteUrl: 'https://diaz.example',
      ondemandUrl: 'https://vod.example.com/',
      ondemandComingSoon: true,
    });
  });

  it('treats an unset coming soon flag as false', async () => {
    const { getAppEnv } = await loadEnv();

    expect(getAppEnv().ondemandComingSoon).toBe(false);
  });

  it('leaves the on demand URL undefined when unset', async () => {
    const { getAppEnv } = await loadEnv();

    expect(getAppEnv().ondemandUrl).toBeUndefined();
  });

  it('treats the reserved .invalid placeholder as unconfigured', async () => {
    process.env.NEXT_PUBLIC_ONDEMAND_URL = 'https://replace-me.invalid';
    const { getAppEnv } = await loadEnv();

    expect(getAppEnv().ondemandUrl).toBeUndefined();
  });

  it('still throws for a malformed on demand URL', async () => {
    process.env.NEXT_PUBLIC_ONDEMAND_URL = 'vod.example.com';
    const { getAppEnv } = await loadEnv();

    expect(() => getAppEnv()).toThrow(/NEXT_PUBLIC_ONDEMAND_URL must be a full absolute URL/);
  });
});
