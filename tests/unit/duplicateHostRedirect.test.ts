import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RedirectRule } from '../../next.config.mjs';

const DUPLICATE_HOST = 'diaz-martial-arts.vercel.app';

async function loadRedirects(siteUrl?: string): Promise<RedirectRule[]> {
  vi.resetModules();
  if (siteUrl) process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
  else delete process.env.NEXT_PUBLIC_SITE_URL;
  const config = (await import('../../next.config.mjs')).default;
  return config.redirects();
}

function hostRule(rules: RedirectRule[]) {
  return rules.find((r) => r.has?.some((h) => h.type === 'host' && h.value === DUPLICATE_HOST));
}

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

/**
 * The Vercel project host served the same production deployment as the custom
 * domain: 200 on both, byte-identical HTML down to the ETag, an open robots.txt
 * and no X-Robots-Tag, so every page of the site existed twice for a crawler.
 * The canonical tag named the right domain, but that is a hint rather than a
 * directive and it does nothing for a person who lands on the wrong host.
 *
 * The rule lives in next.config.mjs rather than in the Vercel dashboard so that
 * it is reviewable, survives the project being re-created, and is testable -
 * this file being the point. Nothing else in the repository would notice it
 * disappearing: the symptom is a duplicate that only a search engine sees.
 */
describe('duplicate production host', () => {
  it('sends every path on the duplicate host to the canonical origin', async () => {
    const rule = hostRule(await loadRedirects('https://www.diazmartialarts.com'));

    expect(rule).toBeDefined();
    expect(rule?.source).toBe('/:path*');
    expect(rule?.destination).toBe('https://www.diazmartialarts.com/:path*');
  });

  it('is matched before the path rules, so one hop leaves the duplicate host', async () => {
    // Next matches redirects in array order and the first match wins, and every
    // other rule here has a relative destination, which resolves back onto the
    // host the request arrived on. Ordered last, this rule never saw
    // https://<duplicate>/sign-in at all: that answered 307 /ondemand on the
    // duplicate host, and with NEXT_PUBLIC_ONDEMAND_URL set the next hop leaves
    // for the member app, so the duplicate URL was never collapsed.
    const rules = await loadRedirects('https://www.diazmartialarts.com');
    const hostAgnostic = rules.findIndex((r) => !r.has?.length);

    expect(rules.indexOf(hostRule(rules)!)).toBe(0);
    expect(hostAgnostic).toBeGreaterThan(0);
  });

  it('is permanent, because the duplicate is being retired rather than moved', async () => {
    // A 307 asks a search engine to keep the duplicate URL on file, which is
    // the state this rule exists to close.
    expect(hostRule(await loadRedirects('https://www.diazmartialarts.com'))?.permanent).toBe(true);
  });

  it('builds the destination from the canonical origin, not a second copy of it', async () => {
    const rule = hostRule(await loadRedirects('https://example.test'));

    expect(rule?.destination).toBe('https://example.test/:path*');
  });

  it('tolerates a trailing slash on the configured origin', async () => {
    // The destination is built by concatenation, so an unstripped slash would
    // emit https://host//:path* and redirect every page to a doubled path.
    const rule = hostRule(await loadRedirects('https://www.diazmartialarts.com/'));

    expect(rule?.destination).toBe('https://www.diazmartialarts.com/:path*');
  });

  it('emits no rule when there is no canonical origin to send anyone to', async () => {
    expect(hostRule(await loadRedirects())).toBeUndefined();
  });

  it('emits no rule when the duplicate host IS the canonical origin', async () => {
    // What a deployment with no custom domain looks like. Redirecting that host
    // to itself would loop.
    expect(hostRule(await loadRedirects(`https://${DUPLICATE_HOST}`))).toBeUndefined();
  });
});
