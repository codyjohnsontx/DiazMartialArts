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

/**
 * Site URLs are composed both by concatenation (`${site.url}/sitemap.xml`) and
 * by `new URL(path, siteUrl)`, so the base must never carry a trailing slash.
 * `new URL(value).toString()` appends one to a bare origin, which turned every
 * non-root sitemap entry and the robots.txt sitemap line into a double slash
 * the moment NEXT_PUBLIC_SITE_URL was set. Normalising the single value here
 * keeps both idioms correct, so a new call site cannot pick the wrong one.
 *
 * Trailing slashes come off the parsed pathname rather than off the serialised
 * string, because chopping one final character is not the same operation: it
 * leaves `https://host///` still malformed, and on a value carrying a query it
 * edits the query instead of the path (`https://host/?source=/` silently
 * becomes `?source=`). A query or fragment is meaningless on a site base URL
 * and would corrupt every URL built from it, so it is rejected here rather than
 * carried along - a build that fails loudly beats a sitemap full of bad URLs.
 */
function normaliseSiteUrl(name: string, value: string): string {
  const url = new URL(parseAbsoluteUrl(name, value));

  if (url.search || url.hash) {
    throw new Error(
      `[env] ${name} must be a bare site URL with no query string or fragment. Example: https://diazmartialarts.vercel.app`,
    );
  }

  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
}

function readSiteUrl(): string {
  return normaliseSiteUrl('NEXT_PUBLIC_SITE_URL', resolveSiteUrl());
}

function resolveSiteUrl(): string {
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
