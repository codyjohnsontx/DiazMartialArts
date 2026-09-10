// Types the config so tests/unit/duplicateHostRedirect.test.ts can call
// redirects() directly, in the sibling-declaration style lib/ondemand-url.d.mts
// already uses for the repository's other .mjs module. Only the parts a test
// reads are declared; Next itself validates the rest.
export type RedirectRule = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: { type: string; key?: string; value: string }[];
};

declare const nextConfig: {
  reactStrictMode: boolean;
  redirects(): Promise<RedirectRule[]>;
};

export default nextConfig;
