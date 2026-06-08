import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalEnv = process.env;

async function loadEntitlements() {
  vi.resetModules();
  vi.doMock('server-only', () => ({}));
  return import('@/lib/entitlements');
}

function resetProcessEnv() {
  process.env = {
    ...originalEnv,
    NODE_ENV: 'test',
    NEXT_PUBLIC_SITE_URL: 'https://diaz.example',
  };
  delete process.env.DIAZ_ENTITLEMENTS_API_URL;
  delete process.env.DIAZ_ENTITLEMENTS_API_KEY;
  delete process.env.DIAZ_ENTITLEMENTS_TIMEOUT_MS;
  delete process.env.DEV_FORCE_VOD_ENTITLEMENT;
}

beforeEach(() => {
  resetProcessEnv();
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  process.env = originalEnv;
});

describe('getEntitlements', () => {
  it('maps a successful API response to boolean entitlements', async () => {
    process.env.DIAZ_ENTITLEMENTS_API_URL = 'https://api.example.com/';
    process.env.DIAZ_ENTITLEMENTS_API_KEY = 'secret';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ gymMember: 1, vod: '' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { getEntitlements } = await loadEntitlements();

    await expect(getEntitlements('user/123')).resolves.toEqual({
      gymMember: true,
      vod: false,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/users/user%2F123/entitlements',
      expect.objectContaining({
        method: 'GET',
        headers: { 'x-diaz-api-key': 'secret' },
        cache: 'no-store',
      }),
    );
  });

  it('uses the local fallback when the API is not configured', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    process.env.DEV_FORCE_VOD_ENTITLEMENT = 'true';
    const { getEntitlements } = await loadEntitlements();

    await expect(getEntitlements('user_123')).resolves.toEqual({
      gymMember: false,
      vod: true,
    });
  });

  it('falls back when the API returns a non-OK response', async () => {
    process.env.DIAZ_ENTITLEMENTS_API_URL = 'https://api.example.com';
    process.env.DIAZ_ENTITLEMENTS_API_KEY = 'secret';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        text: async () => 'failed',
      }),
    );
    const { getEntitlements } = await loadEntitlements();

    await expect(getEntitlements('user_123')).resolves.toEqual({
      gymMember: false,
      vod: false,
    });
  });

  it('falls back when the API request times out', async () => {
    vi.useFakeTimers();
    process.env.DIAZ_ENTITLEMENTS_API_URL = 'https://api.example.com';
    process.env.DIAZ_ENTITLEMENTS_API_KEY = 'secret';
    process.env.DIAZ_ENTITLEMENTS_TIMEOUT_MS = '50';
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            const error = new Error('aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
      ),
    );
    const { getEntitlements } = await loadEntitlements();

    const result = getEntitlements('user_123');
    await vi.advanceTimersByTimeAsync(50);

    await expect(result).resolves.toEqual({
      gymMember: false,
      vod: false,
    });
    vi.useRealTimers();
  });
});
