import 'server-only';

import { getAppEnv } from '@/lib/env';

export type Entitlements = {
  gymMember: boolean;
  vod: boolean;
};

export async function getEntitlements(clerkUserId: string): Promise<Entitlements> {
  const { entitlementsApiUrl: apiUrl, entitlementsApiKey: apiKey, devForceVodEntitlement } =
    getAppEnv();

  if (apiUrl && apiKey) {
    try {
      const response = await fetch(
        `${apiUrl.replace(/\/$/, '')}/users/${encodeURIComponent(clerkUserId)}/entitlements`,
        {
          method: 'GET',
          headers: {
            'x-diaz-api-key': apiKey,
          },
          cache: 'no-store',
        },
      );

      if (response.ok) {
        const data = (await response.json()) as Partial<Entitlements>;
        return {
          gymMember: Boolean(data.gymMember),
          vod: Boolean(data.vod),
        };
      }
    } catch (err) {
      console.warn('[entitlements] Failed to fetch entitlements from API; using local fallback.', err);
    }
  }

  const forceVod = process.env.NODE_ENV === 'development' ? devForceVodEntitlement : false;

  return {
    gymMember: false,
    vod: forceVod,
  };
}
