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

    return redirects;
  },
};

export default nextConfig;
