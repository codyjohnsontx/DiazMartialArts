import 'server-only';

import { getAppEnv } from '@/lib/env';

export type Entitlements = {
  gymMember: boolean;
  vod: boolean;
};

const isDebugLoggingEnabled = process.env.NODE_ENV !== 'production';

export async function getEntitlements(clerkUserId: string): Promise<Entitlements> {
  const {
    entitlementsApiUrl: apiUrl,
    entitlementsApiKey: apiKey,
    entitlementsTimeoutMs,
    devForceVodEntitlement,
  } = getAppEnv();

  if (apiUrl && apiKey) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), entitlementsTimeoutMs);

    try {
      const response = await fetch(
        `${apiUrl.replace(/\/$/, '')}/users/${encodeURIComponent(clerkUserId)}/entitlements`,
        {
          method: 'GET',
          headers: {
            'x-diaz-api-key': apiKey,
          },
          cache: 'no-store',
          signal: controller.signal,
        },
      );

      if (response.ok) {
        const data = (await response.json()) as Partial<Entitlements>;
        return {
          gymMember: Boolean(data.gymMember),
          vod: Boolean(data.vod),
        };
      }

      const body = await response.text();
      const logDetails: Record<string, unknown> = {
        status: response.status,
        statusText: response.statusText,
        bodyLength: body.length,
        bodyTruncated: body.length > 500,
      };

      if (isDebugLoggingEnabled) {
        const bodyPreview = body.length > 500 ? `${body.slice(0, 500)}...` : body;
        logDetails.bodyPreview = bodyPreview;
      }

      console.warn('[entitlements] API returned a non-OK response; using local fallback.', logDetails);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn(
          `[entitlements] API request timed out after ${entitlementsTimeoutMs}ms; using local fallback.`,
        );
      } else {
        const logDetails: Record<string, unknown> = {
          errorName: err instanceof Error ? err.name : 'UnknownError',
        };

        if (isDebugLoggingEnabled) {
          logDetails.errorMessage = err instanceof Error ? err.message : 'Unknown entitlement fetch error';
          logDetails.error = err;
        }

        console.warn('[entitlements] Failed to fetch entitlements from API; using local fallback.', logDetails);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  const forceVod = process.env.NODE_ENV === 'development' ? devForceVodEntitlement : false;

  return {
    gymMember: false,
    vod: forceVod,
  };
}
