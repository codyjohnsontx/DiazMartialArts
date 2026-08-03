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
    return [
      { source: '/sign-in', destination: '/ondemand', permanent: false },
      { source: '/sign-in/:path*', destination: '/ondemand', permanent: false },
      { source: '/sign-up', destination: '/ondemand', permanent: false },
      { source: '/sign-up/:path*', destination: '/ondemand', permanent: false },
    ];
  },
};

export default nextConfig;
