/** Shared Playwright fetch for the file behind a rendered `<img src>`. No Next.js imports. */

import { expect, type APIRequestContext } from '@playwright/test';

/**
 * Fetches the file a rendered `src` really points at and asserts the site
 * serves it as an image, handing the bytes back so each caller keeps its own
 * assertion about what is in them.
 *
 * `next/image` rewrites a src into `/_next/image?url=<path>&w=..&q=..`, so the
 * path the site is actually responsible for is that `url` parameter; anything
 * else is already the path. Fetching that rather than the optimized URL is what
 * keeps this check off the optimizer's WebAssembly encoder, whose throughput is
 * a property of the box rather than of the page - see the notes at the top of
 * tests/e2e/home.spec.ts and in tests/e2e/public-pages.spec.ts.
 *
 * It lives here because both of those specs need exactly this, down to the
 * wording of the failures, and the wording drifted apart once already while it
 * was written out twice.
 */
export async function fetchServedImage(
  request: APIRequestContext,
  src: string,
): Promise<{ source: string; body: Buffer }> {
  const rendered = new URL(src, 'http://localhost');
  const source =
    (rendered.pathname === '/_next/image' ? rendered.searchParams.get('url') : null) ??
    rendered.pathname;

  const response = await request.get(source);
  expect(response.status(), `${source} is not served`).toBe(200);
  expect(response.headers()['content-type'], `${source} is not served as an image`).toMatch(
    /^image\//,
  );

  return { source, body: await response.body() };
}
