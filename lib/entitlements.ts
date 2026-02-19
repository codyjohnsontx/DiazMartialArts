import 'server-only';

export type Entitlements = {
  gymMember: boolean;
  vod: boolean;
};

function toBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true';
}

export async function getEntitlements(clerkUserId: string): Promise<Entitlements> {
  const apiUrl = process.env.DIAZ_ENTITLEMENTS_API_URL;
  const apiKey = process.env.DIAZ_ENTITLEMENTS_API_KEY;

  if (apiUrl && apiKey) {
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/me/entitlements`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'x-clerk-user-id': clerkUserId,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = (await response.json()) as Partial<Entitlements>;
        return {
          gymMember: Boolean(data.gymMember),
          vod: Boolean(data.vod),
        };
      }
    } catch {
      // Fall through to local fallback.
    }
  }

  const forceVod = process.env.NODE_ENV === 'development' ? toBoolean(process.env.DEV_FORCE_VOD_ENTITLEMENT) : false;

  return {
    // TODO: Replace with real gym membership lookup from your business system.
    gymMember: true,
    vod: forceVod,
  };
}
