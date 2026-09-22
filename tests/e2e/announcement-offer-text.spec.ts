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
 * Two lines are deliberately absent, because finding them would say nothing
 * about whether the card rendered: `$125`, which the Cleber Luciano card also
 * prints as its `tag` badge, and a bare `href="tel:+15123924763"`, which the
 * footer puts on every page of the site. The phone is checked as the anchor's
 * own text instead - the footer spells the same number `(512) 392-4763`, so
 * only the card can satisfy it, and matching it closed against `</a>` is what
 * makes it a dialable link rather than a loose run of digits. Both were
 * measured: with the offer fields removed from app/announcements/page.tsx, the
 * raw `href` line passed on the served HTML of the very page this guards.
 */
const OFFER_LINES = [
  // Back to School Special
  '$60',
  'Includes uniform and belt',
  'Lil Dragons Karate, ages 4-6',
  'Karate Kids, ages 7-11',
  // Jiu Jitsu Special
  '$130',
  'Includes a jiu jitsu gi and two private lessons',
  // Muay Thai Special
  'Includes 16 oz gloves and two private lessons',
  // Both specials print the gym's number, and the card makes it dialable.
  '>512-392-4763</a>',
];

test.describe('the announcements offer is served as text', () => {
  test('/announcements serves each flyer price, inclusion, age bracket and phone', async ({
    request,
  }) => {
    const response = await request.get('/announcements');
    expect(response.status()).toBe(200);
    const html = await response.text();

    // A bailout serves the root app/loading.tsx shell instead of the page, so
    // say which failure this is when every line below is missing at once.
    expect(html, '/announcements serves a loading shell rather than the page').toContain('<h1');

    const missing = OFFER_LINES.filter((line) => !html.includes(line));
    expect(missing, 'the served /announcements HTML is missing offer text').toEqual([]);
  });
});
