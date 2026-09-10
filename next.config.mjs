import { resolveOndemandComingSoon, resolveOndemandUrl } from './lib/ondemand-url.mjs';

// Same rules lib/env.ts applies at request time, so the redirect below and the
// /ondemand page component can never disagree about whether the member app is
// reachable. Reading them here makes both a build-time input for the redirect
// specifically: changing either env var needs a rebuild for the redirect to
// follow, which is fine on Vercel where an env change triggers a redeploy. The
// page component still reads them at request time, so it stays correct in the
// window between an env change and the next build.
const ondemandUrl = resolveOndemandUrl(process.env.NEXT_PUBLIC_ONDEMAND_URL);
const ondemandComingSoon = resolveOndemandComingSoon(process.env.ONDEMAND_COMING_SOON);

/**
 * The Vercel-assigned project host that serves the same production deployment
 * as the custom domain. Both answered 200 with byte-identical HTML - same
 * ETag, same Content-Length - over an open robots.txt and no X-Robots-Tag, so
 * every page of this site existed twice for a crawler. The canonical tag names
 * the custom domain, but that is a hint a search engine may disregard, not a
 * directive, and it does nothing for a visitor who lands on the wrong host.
 *
 * Only the exact production alias is listed. Per-deployment preview hosts
 * (diaz-martial-arts-<hash>-<scope>.vercel.app) do not match it and keep
 * serving previews normally, which is what makes a literal host safer here
 * than "any host that is not the canonical one".
 */
const DUPLICATE_PRODUCTION_HOST = 'diaz-martial-arts.vercel.app';

/**
 * NEXT_PUBLIC_SITE_URL is the single source of the canonical origin, so the
 * redirect below reads it rather than restating the domain. Trailing slashes
 * come off because the destination is built by concatenation and Next would
 * emit `https://host//:path*` otherwise; the fuller validation lives in
 * `normaliseConfiguredSiteUrl` (lib/env.ts), which cannot be imported here
 * because next.config is loaded before any TypeScript is compiled.
 *
 * When the variable is unset there is no canonical origin to send anyone to,
 * so no rule is emitted at all - the same shape as the /ondemand rule below.
 */
const canonicalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Member login moved to the separate Diaz on Demand app. These paths are kept
  // as real HTTP redirects so old links and bookmarks do not 404.
  //
  // They point at the local /ondemand route rather than the member app itself so
  // that NEXT_PUBLIC_ONDEMAND_URL stays the single source of that destination,
  // resolved at request time in one place. Redirecting straight to the member
  // app would bake a build-time copy of the URL in here, and would have nowhere
  // to go while that app is still unconfigured.
  //
  // This lives in config rather than in a page because the root app/loading.tsx
  // makes pages stream, which downgrades a page-level redirect() to a
  // client-side one that crawlers and non-JS clients never follow.
  async redirects() {
    const redirects = [
      { source: '/sign-in', destination: '/ondemand', permanent: false },
      { source: '/sign-in/:path*', destination: '/ondemand', permanent: false },
      { source: '/sign-up', destination: '/ondemand', permanent: false },
      { source: '/sign-up/:path*', destination: '/ondemand', permanent: false },
    ];

    // /ondemand is the one member entry point, so its hand-off to the member app
    // has to be a real HTTP redirect for the same reason the paths above do. The
    // rule is only emitted when there is somewhere to forward to; otherwise
    // /ondemand falls through to the page component, which renders coming soon.
    if (ondemandUrl && !ondemandComingSoon) {
      redirects.push({ source: '/ondemand', destination: ondemandUrl, permanent: false });
    }

    // Collapse the duplicate host onto the canonical one. Permanent (308)
    // rather than temporary because the point is to retire the copy: a
    // temporary redirect asks a search engine to keep the duplicate URL on
    // file, which is the state being closed. It matches every path, robots.txt
    // and sitemap.xml included, so nothing on the duplicate host answers 200.
    //
    // The guard skips the rule when the canonical origin IS the duplicate host,
    // which is what a deployment with no custom domain would look like;
    // redirecting that host to itself would loop.
    if (canonicalSiteUrl && !canonicalSiteUrl.includes(`//${DUPLICATE_PRODUCTION_HOST}`)) {
      redirects.push({
        source: '/:path*',
        has: [{ type: 'host', value: DUPLICATE_PRODUCTION_HOST }],
        destination: `${canonicalSiteUrl}/:path*`,
        permanent: true,
      });
    }

    return redirects;
  },
};

export default nextConfig;
