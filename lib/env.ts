import { resolveOndemandComingSoon, resolveOndemandUrl } from './ondemand-url.mjs';

export type AppEnv = {
  siteUrl: string;
  /**
   * Base URL of the separate Diaz on Demand app, which owns member accounts.
   * Undefined until that app is deployed and NEXT_PUBLIC_ONDEMAND_URL points at
   * it, so callers must handle its absence rather than link somewhere dead.
   */
  ondemandUrl?: string;
  googleCalendarEmbedUrl?: string;
  googleCalendarIcsUrl?: string;
  formspreeEndpoint?: string;
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

function readPublicEnv(): PublicEnv {
  if (cachedPublicEnv) return cachedPublicEnv;

  cachedPublicEnv = {
    siteUrl: readSiteUrl(),
    ondemandUrl: resolveOndemandUrl(process.env.NEXT_PUBLIC_ONDEMAND_URL),
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

export function getPublicEnv(): PublicEnv {
  return readPublicEnv();
}

export function getAppEnv(): AppEnv {
  if (cachedAppEnv) return cachedAppEnv;

  cachedAppEnv = {
    ...readPublicEnv(),
    ondemandComingSoon: resolveOndemandComingSoon(process.env.ONDEMAND_COMING_SOON),
  };

  return cachedAppEnv;
}
