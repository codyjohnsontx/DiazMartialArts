import { test, expect } from '@playwright/test';

import { programs } from '@/content/programs';
import { waitForHydration } from '../fixtures/hydration';

const FILTER_BUTTON = 'button[aria-pressed]';

/**
 * That a crawler can find every program page.
 *
 * The school's commercial position is breadth - twelve disciplines under one
 * roof - and each one needs its own door, because "kids karate san marcos" and
 * "muay thai san marcos" are different searches by different people. All twelve
 * doors existed as pages. None of them was reachable.
 *
 * /programs was the whole hub, and it shipped an empty shell: ProgramsContent
 * is a client component calling `useSearchParams`, which opts a static route
 * out of prerendering up to the nearest Suspense boundary, and with no boundary
 * of its own the nearest was the root app/loading.tsx wrapping all of <main>.
 * The served HTML was the header, the word "Loading...", and the footer - 601
 * characters, no <h1>. The home page rendered the same twelve programs as plain
 * divs carrying a decorative `→`, so it linked to none of them either. Between
 * them that left every program page with zero internal inbound links, reachable
 * only through sitemap.xml.
 *
 * The first block reads the HTML off the wire through the `request` fixture and
 * never opens a page, which is the only thing that can fail there. A rendered
 * DOM proves nothing: the client component hydrates and fills the grid in, so
 * `page.goto` plus `getByRole('link')` passed happily throughout the whole
 * period the served markup was empty, and would pass again the moment someone
 * reintroduces the bailout. What a crawler is handed before it runs any script
 * is the property under test, so that test has to be a fetch.
 *
 * The second block is the other half of the same change and does need a
 * browser: prerendering the unfiltered grid as the Suspense fallback means the
 * filter buttons now render outside the boundary, where no navigation hands
 * them a new `tag` prop, so ProgramsContent has to set its own state as well as
 * push the URL. Deleting that one line looks like a tidy-up and silently leaves
 * a row of buttons that do nothing.
 *
 * The list comes from content/programs.ts rather than being written out here so
 * that a thirteenth program is covered the day it is added - a new discipline
 * with no route to it is the same defect as the twelve.
 *
 * HALF OF THIS FILE IS BLIND AGAINST `next dev`, which is what the default
 * `test:e2e` run uses, and that is why it is also in the `test:smoke` list in
 * package.json. The bailout is a STATIC RENDERING failure: `next dev` renders
 * every request dynamically, so `useSearchParams` resolves during SSR and the
 * /programs assertions pass on the very code that shipped an empty page. Both
 * were measured on the pre-fix tree - against `next dev` the two /programs
 * tests passed and only the home-page one failed; against `npm run build` plus
 * PLAYWRIGHT_USE_START=1 all six failed. A guard that cannot fail is not a
 * guard, so the build-backed run is where this file earns its place, and
 * package.json cannot carry a comment saying so.
 */
test.describe('program pages are reachable without JavaScript', () => {
  const slugs = programs.map((p) => p.slug);

  for (const source of ['/', '/programs']) {
    test(`${source} serves a link to every program page`, async ({ request }) => {
      const response = await request.get(source);
      expect(response.status()).toBe(200);
      const html = await response.text();

      const linked = slugs.filter((slug) => html.includes(`href="/programs/${slug}"`));
      expect(linked).toEqual(slugs);
    });
  }

  test('/programs serves its heading and program copy, not a loading shell', async ({
    request,
  }) => {
    const raw = await (await request.get('/programs')).text();
    // React escapes the apostrophe in "Lil' Dragons" to &#x27;, so a raw
    // substring search for the name as content/programs.ts spells it misses a
    // page that does render it. Decoding is better than picking needles without
    // apostrophes: the program names are the thing under test, and the next one
    // added is as likely to carry one.
    const html = raw.replace(/&#x27;|&#39;/g, "'");

    expect(html).toContain('<h1');
    // One name per discipline family, each of which only appears in the grid
    // this page failed to render. Haganah and I.P.T.T. are the two nobody would
    // search for by name, which is exactly why their page has to be findable
    // from a page that ranks.
    for (const name of [
      'Brazilian Jiu Jitsu',
      'Muay Thai',
      'Haganah',
      'I.P.T.T.',
      "Lil' Dragons",
    ]) {
      expect(html).toContain(name);
    }
  });
});

test.describe('the program filter still works on the prerendered page', () => {
  const cards = 'a[href^="/programs/"]';
  const youthCount = programs.filter((p) => p.tag === 'Youth').length;

  test('narrows the grid and reflects the choice in the URL', async ({ page }) => {
    await page.goto('/programs', { waitUntil: 'domcontentloaded' });
    await expect(page.locator(cards)).toHaveCount(programs.length);
    // The grid is in the HTML before React runs now, so the count above is
    // satisfied by markup alone and is no longer evidence that the buttons are
    // live. click() checks visibility and stability but not whether a handler
    // is attached, so without this the click is swallowed and the grid simply
    // stays at twelve - which is how this failed against `next dev` on both
    // projects while passing against `next start`.
    await waitForHydration(page, FILTER_BUTTON);

    await page.getByRole('button', { name: 'Youth', exact: true }).click();

    await expect(page.locator(cards)).toHaveCount(youthCount);
    // Waited for rather than read off page.url(). The grid is redrawn by local
    // state the instant the button is clicked and the URL is pushed a moment
    // later, so reading it straight after the count assertion is a race that
    // resolves differently on each project - it passed on Desktop Chrome and
    // failed on Mobile. waitForURL still fails if the push never happens.
    await page.waitForURL(/\?tag=Youth$/);

    await page.getByRole('button', { name: 'All', exact: true }).click();

    await expect(page.locator(cards)).toHaveCount(programs.length);
    await page.waitForURL((url) => url.search === '');
  });

  test('applies a filter entered cold as a URL', async ({ page }) => {
    // The half the Suspense child is responsible for: a shared link has to
    // arrive filtered, not show all twelve.
    await page.goto('/programs?tag=Youth', { waitUntil: 'domcontentloaded' });

    await expect(page.locator(cards)).toHaveCount(youthCount);
  });
});
