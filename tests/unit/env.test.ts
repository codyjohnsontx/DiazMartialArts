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
  delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  delete process.env.CLERK_SECRET_KEY;
  delete process.env.DIAZ_ENTITLEMENTS_API_URL;
  delete process.env.DIAZ_ENTITLEMENTS_API_KEY;
  delete process.env.DIAZ_ENTITLEMENTS_TIMEOUT_MS;
  delete process.env.DEV_FORCE_VOD_ENTITLEMENT;
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
      ondemandUrl: 'https://ondemand.diazmartialarts.com',
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
  it('parses server env flags and timeout values', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://diaz.example';
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_example';
    process.env.CLERK_SECRET_KEY = 'sk_test_example';
    process.env.DIAZ_ENTITLEMENTS_API_URL = 'https://api.example.com/base';
    process.env.DIAZ_ENTITLEMENTS_API_KEY = 'secret';
    process.env.DIAZ_ENTITLEMENTS_TIMEOUT_MS = '2500';
    process.env.DEV_FORCE_VOD_ENTITLEMENT = 'true';
    process.env.ONDEMAND_COMING_SOON = 'true';
    const { getAppEnv } = await loadEnv();

    expect(getAppEnv()).toMatchObject({
      clerkPublishableKeyPresent: true,
      clerkSecretKeyPresent: true,
      entitlementsApiUrl: 'https://api.example.com/base',
      entitlementsApiKey: 'secret',
      entitlementsTimeoutMs: 2500,
      devForceVodEntitlement: true,
      ondemandComingSoon: true,
    });
  });

  it('throws for non-positive timeout values', async () => {
    process.env.DIAZ_ENTITLEMENTS_TIMEOUT_MS = '0';
    const { getAppEnv } = await loadEnv();

    expect(() => getAppEnv()).toThrow(/DIAZ_ENTITLEMENTS_TIMEOUT_MS must be a positive integer/);
  });
});

describe('getRequiredClerkEnv', () => {
  it('requires both Clerk keys', async () => {
    const { getRequiredClerkEnv } = await loadEnv();

    expect(() => getRequiredClerkEnv()).toThrow(/Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/);
  });

  it('returns the publishable key when both keys are present', async () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_example';
    process.env.CLERK_SECRET_KEY = 'sk_test_example';
    const { getRequiredClerkEnv } = await loadEnv();

    expect(getRequiredClerkEnv()).toEqual({ publishableKey: 'pk_test_example' });
  });
});
