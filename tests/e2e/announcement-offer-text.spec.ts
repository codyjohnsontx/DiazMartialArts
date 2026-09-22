import { test, expect } from '@playwright/test';

/**
 * That the offer on each /announcements card - the price, what it includes,
 * the ages, the phone number - is in the HTML the server sends, before any
 * script runs.
 *
 * That is the whole point of putting those fields on the card: a crawler and a
 * no-JS client are handed the served markup and nothing else, and until this
 * change the offer existed only as pixels inside the flyer image. So the
 * property under test is what comes off the wire, which is why this drives the
 * `request` fixture and never opens a page. A rendered DOM cannot fail here:
 * AnnouncementFlyerGallery is a client component, and per the /programs failure
 * this repo already paid for once, a route that stops prerendering still
 * hydrates and fills the cards in - every DOM-level assertion, and every one of
 * the component tests in tests/components/announcement-flyer-gallery.test.tsx,
 * would stay green while the shipped HTML carried none of this text.
 *
 * It is a file of its own, modelled on tests/e2e/image-optimizer.spec.ts, and
 * it is in the `test:smoke` list in package.json, because it is blind anywhere
 * else: `next dev`, which the ordinary `test:e2e` run uses, renders every
 * request dynamically, so a prerendering bailout resolves during SSR and this
 * passes on the very tree that would ship an empty card. Only the build-backed
 * run (`npm run build` plus PLAYWRIGHT_USE_START=1) can fail it. Adding it to
 * tests/e2e/public-pages.spec.ts would have meant putting that file's thirteen
 * navigations and its whole flyer feed through the image optimizer on every
 * smoke run; package.json cannot carry a comment, so the pairing is written
 * down here.
 *
 * The expected lines are written out rather than read back from
 * app/announcements/page.tsx on purpose, the same way the head coach's copy is
 * in tests/e2e/public-pages.spec.ts: each one is transcribed from a flyer
 * image, and a guard that re-read the page's own source would pass any silent
 * loss or reword of it.
 *
 * Each amount is pinned together with the words the flyer prints beside it,
 * because that pair is the claim: `$60` alone under a kids karate heading
 * reads as a monthly rate, and it is the served HTML a crawler indexes.
 *
 * Read against the served markup with every `<script>` block removed, because
 * the document carries a second copy of some of this text that no visitor ever
 * sees. The flyer feed is a prop of a client component, so Next serialises it
 * verbatim into the `self.__next_f` flight payload in the same response, and
 * any pinned line that happens to be a whole prop value is satisfied by that
 * payload whether or not a card rendered. Measured on this build: the two age
 * brackets appear twice each - once as `<p>Lil Dragons Karate, ages 4-6</p>`
 * and once inside `\"ages\":[...]` - while every other line appears once,
 * because the rest are composed at render time from `formatPriceUsd`,
 * `formatList` and `CALL_LABEL` rather than passed through. Without the strip,
 * deleting the age rendering outright would leave this spec green, and so
 * would the client-side-rendering bailout the spec exists to catch, since the
 * payload survives it.
 *
 * One candidate is deliberately absent, because finding it would say nothing
 * about whether the card rendered: the phone number itself now comes from
 * content/site.ts, which the footer renders on every page of the site in the
 * same spelling and behind the same `tel:` href - so neither the number nor
 * its link can distinguish this card from the footer below it, and what is
 * pinned is the line's own words instead. That was measured rather than
 * assumed: with the offer fields removed from app/announcements/page.tsx, a
 * raw `href="tel:+15123924763"` assertion passed on the served HTML of the
 * very page this guards.
 */
const OFFER_LINES = [
  // Master Cleber Luciano: "Cost: $125", the whole fee, with no qualifier.
  '$125',
  // Back to School Special: "SPECIAL! $60 TO GET THEM STARTED!"
  '$60 to get them started',
  'Includes uniform and belt',
  'Lil Dragons Karate, ages 4-6',
  'Karate Kids, ages 7-11',
  // Jiu Jitsu Special: "ONLY $130 TO GET STARTED!"
  '$130 to get started',
  'Includes a jiu jitsu gi and two private lessons',
  // Muay Thai Special: "$60 TO GET STARTED!"
  '$60 to get started',
  'Includes 16 oz gloves and two private lessons',
  // Both specials print "CALL TO MAKE AN APPOINTMENT" above the gym's number.
  'Call to make an appointment:',
];

test.describe('the announcements offer is served as text', () => {
  test('/announcements serves each flyer price, inclusion, age bracket and phone', async ({
    request,
  }) => {
    const response = await request.get('/announcements');
    expect(response.status()).toBe(200);
    const html = await response.text();
    const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

    // A bailout serves the root app/loading.tsx shell instead of the page, so
    // say which failure this is when every line below is missing at once.
    expect(markup, '/announcements serves a loading shell rather than the page').toContain('<h1');

    const missing = OFFER_LINES.filter((line) => !markup.includes(line));
    expect(missing, 'the served /announcements HTML is missing offer text').toEqual([]);
  });
});
