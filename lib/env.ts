export type AppEnv = {
  siteUrl: string;
  ondemandUrl: string;
  clerkPublishableKeyPresent: boolean;
  clerkSecretKeyPresent: boolean;
  googleCalendarEmbedUrl?: string;
  googleCalendarIcsUrl?: string;
  formspreeEndpoint?: string;
  entitlementsApiUrl?: string;
  entitlementsApiKey?: string;
  entitlementsTimeoutMs: number;
  devForceVodEntitlement: boolean;
  ondemandComingSoon: boolean;
};

type PublicEnv = Pick<
  AppEnv,
  | 'siteUrl'
  | 'ondemandUrl'
  | 'googleCalendarEmbedUrl'
  | 'googleCalendarIcsUrl'
  | 'formspreeEndpoint'
>;

const DEFAULT_LOCAL_SITE_URL = 'http://localhost:3000';
const DEFAULT_ONDEMAND_URL = 'https://ondemand.diazmartialarts.com';
const DEFAULT_ENTITLEMENTS_TIMEOUT_MS = 5000;

let cachedPublicEnv: PublicEnv | undefined;
let cachedAppEnv: AppEnv | undefined;

function parseAbsoluteUrl(name: string, value: string): string {
  try {
    return new URL(value).toString();
  } catch {
    throw new Error(
      `[env] ${name} must be a full absolute URL including protocol. Example: https://diazmartialarts.vercel.app`,
    );
  }
}

function readSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (value) return parseAbsoluteUrl('NEXT_PUBLIC_SITE_URL', value);

  if (process.env.NODE_ENV !== 'production') {
    return DEFAULT_LOCAL_SITE_URL;
  }

  // Server-side: Vercel sets VERCEL_URL automatically on all deployments (without protocol).
  if (typeof window === 'undefined') {
    const vercelUrl = process.env.VERCEL_URL?.trim();
    if (vercelUrl) return `https://${vercelUrl}`;
  }

  // Client-side browser: derive origin from the current page.
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  throw new Error(
    '[env] Missing NEXT_PUBLIC_SITE_URL. Set it to the public site URL, for example https://diazmartialarts.vercel.app',
  );
}

function readOptionalUrl(name: string, value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return parseAbsoluteUrl(name, trimmed);
}

function readPositiveInteger(name: string, value: string | undefined, fallback: number): number {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;

  const parsed = Number(trimmed);
  if (Number.isInteger(parsed) && parsed > 0) return parsed;

  throw new Error(`[env] ${name} must be a positive integer. Example: ${fallback}`);
}

function readPublicEnv(): PublicEnv {
  if (cachedPublicEnv) return cachedPublicEnv;

  cachedPublicEnv = {
    siteUrl: readSiteUrl(),
    ondemandUrl: readOptionalUrl('NEXT_PUBLIC_ONDEMAND_URL', process.env.NEXT_PUBLIC_ONDEMAND_URL)
      ?? DEFAULT_ONDEMAND_URL,
    googleCalendarEmbedUrl: readOptionalUrl(
      'NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL',
      process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL,
    ),
    googleCalendarIcsUrl: readOptionalUrl(
      'NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL',
      process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL,
    ),
    formspreeEndpoint: readOptionalUrl(
      'NEXT_PUBLIC_FORMSPREE_ENDPOINT',
      process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT,
    ),
  };

  return cachedPublicEnv;
}

export function readRequiredString(name: string, example: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`[env] Missing ${name}. Example: ${example}`);
  }

  return value;
}

export function getPublicEnv(): PublicEnv {
  return readPublicEnv();
}

export function getAppEnv(): AppEnv {
  if (cachedAppEnv) return cachedAppEnv;

  const publicEnv = readPublicEnv();
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  const clerkSecretKey = process.env.CLERK_SECRET_KEY?.trim();
  const entitlementsApiUrl = readOptionalUrl(
    'DIAZ_ENTITLEMENTS_API_URL',
    process.env.DIAZ_ENTITLEMENTS_API_URL,
  );
  const entitlementsApiKey = process.env.DIAZ_ENTITLEMENTS_API_KEY?.trim() || undefined;

  cachedAppEnv = {
    ...publicEnv,
    clerkPublishableKeyPresent: Boolean(clerkPublishableKey),
    clerkSecretKeyPresent: Boolean(clerkSecretKey),
    entitlementsApiUrl,
    entitlementsApiKey,
    entitlementsTimeoutMs: readPositiveInteger(
      'DIAZ_ENTITLEMENTS_TIMEOUT_MS',
      process.env.DIAZ_ENTITLEMENTS_TIMEOUT_MS,
      DEFAULT_ENTITLEMENTS_TIMEOUT_MS,
    ),
    devForceVodEntitlement: process.env.DEV_FORCE_VOD_ENTITLEMENT?.toLowerCase() === 'true',
    ondemandComingSoon: process.env.ONDEMAND_COMING_SOON?.trim().toLowerCase() === 'true',
  };

  return cachedAppEnv;
}

export function getRequiredClerkEnv(): { publishableKey: string } {
  const publishableKey = readRequiredString(
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'pk_test_xxx or pk_live_xxx from your Clerk dashboard',
  );
  readRequiredString(
    'CLERK_SECRET_KEY',
    'sk_test_xxx or sk_live_xxx from your Clerk dashboard',
  );

  return { publishableKey };
}
