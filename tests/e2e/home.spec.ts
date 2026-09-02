import { test, expect, type Page } from '@playwright/test';

import { formatCountdown, getUpcomingClassBlocks } from '@/lib/classSchedule';
import { imageSize } from '../fixtures/imageSize';
import { fetchServedImage } from '../fixtures/servedImage';

/**
 * Every `goto` in this file stops at `domcontentloaded` rather than Playwright's
 * default `load`.
 *
 * `load` does not fire until every subresource has, and on this page the last
 * one is always the hero photo: `next/image` routes `/bjj.jpg` through the
 * on-demand optimizer, which re-encodes it per request in `next start` as well
 * as `next dev` - `next build` pre-generates no variants - and with the
 * optional `sharp` package absent that work falls to a WebAssembly encoder.
 * Measured on this page with a cold image cache: the hero request took 1179ms
 * of an 1181ms `load` at a load average of 18, and 4134ms of a 4206ms `load` at
 * 39, against a `domcontentloaded` of 131ms either way. So the default `goto`
 * quietly put a decode deadline on every test in this file, exactly one of
 * which is about the photo, and what that deadline measures is how busy the box
 * is - the cold-start `goto` timeout seen while validating PR #35, which passed
 * on rerun.
 *
 * This is not a shortened wait but a removed one: nothing here needs the photo
 * decoded, and the one test that is about the photo now checks the bytes the
 * site serves instead. tests/e2e/public-pages.spec.ts reached the same
 * conclusion for the flyer feed and owns the fuller reasoning.
 */
const DOM_READY = { waitUntil: 'domcontentloaded' } as const;

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', DOM_READY);
  });

  test('title contains site name', async ({ page }) => {
    await expect(page).toHaveTitle(/Diaz Martial Arts/);
  });

  test('h1 contains "Martial arts for real progress"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Martial arts/i);
    await expect(page.locator('h1')).toContainText(/progress/i);
  });

  test('hero shows core ctas', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Book a Free Trial/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /View Schedule/i }).first()).toBeVisible();
  });

  test('hero renders the gym photo through the Next image optimizer', async ({ page, request }) => {
    const heroImage = page.locator('section:has(h1) img').first();

    await expect(heroImage).toHaveAttribute('src', /\/_next\/image\?url=%2Fbjj\.jpg/);
    // the hero photo is the LCP element, so it is preloaded rather than lazy
    await expect(heroImage).toHaveAttribute('fetchpriority', 'high');

    // Deliberately not `complete`/`naturalWidth`: those wait on the optimizer's
    // WebAssembly encoder, whose cost is the box's rather than the page's (see
    // the note at the top of this file). Fetch the underlying file instead,
    // which says that the hero's source is served and really is an image, and
    // says which file when it is not.
    //
    // That is less than the decode check covered, and knowingly so: it says
    // nothing about whether /_next/image itself answers. Asking that here would
    // put a cold encode back on this test's critical path, which is the defect
    // this file was just fixed for - so it is asked where it costs nothing, in
    // tests/e2e/image-optimizer.spec.ts, which loads no page at all.
    const { source, body } = await fetchServedImage(
      request,
      (await heroImage.getAttribute('src'))!,
    );
    const actual = imageSize(body);
    expect(actual, `${source} is not a readable image`).not.toBeNull();
    // Not redundant: only the WebP branches derive a size that is always at
    // least 1, so a truncated JPEG or PNG can still parse to a zero here.
    expect(actual!.width, `${source} declares no width`).toBeGreaterThan(0);
  });

  test('hero inverts to light-on-dark and clips the photo on the image layer', async ({ page }) => {
    const hero = page.locator('section:has(h1)').first();
    const clipLayer = hero.locator('> div').first();

    // the copy is only legible over the photo because the section is inverted
    await expect(hero).toHaveCSS('background-color', 'rgb(16, 18, 20)');
    await expect(page.locator('h1')).toHaveCSS('color', 'rgb(247, 243, 237)');

    // the oversized image box is held inside a layer of its own, so the section
    // clips nothing and the photo is the only thing cropped
    await expect(hero).toHaveCSS('overflow', 'visible');
    await expect(clipLayer).toHaveCSS('overflow', 'hidden');
    const clip = await clipLayer.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(clip.scrollHeight).toBeGreaterThan(clip.clientHeight);
    expect(clip.scrollWidth).toBe(clip.clientWidth);
  });

  test('hero parallax actually moves the framing box on scroll', async ({ page }, testInfo) => {
    const box = page.locator('section:has(h1) .hero-parallax');

    // The Mobile project asserts the other side: the scoping guard is what
    // keeps the narrow hero exactly as it shipped, so it is worth a check too
    if (testInfo.project.name === 'Mobile') {
      await expect(box).toHaveCSS('animation-name', 'none');
      return;
    }

    // Asserting animation-name alone proves the rule is wired, not that
    // scrolling moves anything: it still passes with animation-timeline
    // dropped, with a time-based timeline, or with the keyframes inverted, all
    // of which leave the hero looking correct at rest. So drive the real
    // scroller and watch the framing box travel instead.
    const translateY = () =>
      box.evaluate((el) => {
        const t = getComputedStyle(el).transform;
        return t === 'none' ? 0 : new DOMMatrixReadOnly(t).f;
      });

    const atRest = await translateY();
    expect(atRest).toBe(0);

    await page.evaluate(() => window.scrollTo(0, window.innerHeight));

    // a scroll-driven animation settles on a later frame, so poll rather than
    // read once
    await expect.poll(translateY).toBeGreaterThan(atRest);
    expect(await translateY()).toBeGreaterThan(0);

    // Scrolling back must take the travel with it. A time-based timeline also
    // "increases" while the test waits, so without this it could pass on
    // elapsed time alone; only a scroll-driven one returns to rest.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(translateY).toBe(0);
  });

  test('hero parallax does not run under reduced motion', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'Mobile', 'Already static at this width.');

    // Parallax is a vestibular trigger, and the global reduce block in
    // app/globals.css only neutralises animation-duration, which does not stop
    // a scroll-driven animation. The hero carries its own no-preference guard,
    // and losing it would be invisible to every other test here. The media is
    // emulated on the page rather than through test.use, which does not reach
    // the page from a nested describe in this config.
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await expect(page.locator('section:has(h1) .hero-parallax')).toHaveCSS(
      'animation-name',
      'none',
    );
  });

  test('coming-up classes widget visible with schedule link', async ({ page }) => {
    await expect(page.getByText(/Coming up/i).first()).toBeVisible();
    await expect(page.getByText(/Starts in|Starting now/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Full schedule/i })).toBeVisible();
  });

  test('programs section visible', async ({ page }) => {
    await expect(page.getByText('Classes for every stage')).toBeVisible();
  });

  test('cta banner visible', async ({ page }) => {
    await expect(page.getByText(/Your first class/i).first()).toBeVisible();
    await expect(page.getByText(/is on us/i).first()).toBeVisible();
  });

  test('header home link is visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Diaz Martial Arts home' })).toBeVisible();
  });

  test('footer present with copyright text', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/All rights reserved/i)).toBeVisible();
  });
});

test.describe('Home page hydration', () => {
  test('coming-up card hydrates without a mismatch after the page was rendered', async ({
    page,
  }) => {
    // In production the page is prerendered, so its HTML carries the build's
    // clock and every visitor hydrates later. Against `next dev` the server
    // renders per request and shares the clock, so the bug never shows there.
    // Moving the browser's clock ahead of the server's reproduces the deployed
    // condition on either server.
    const visitTime = new Date(Date.now() + 30 * 60_000);
    await page.clock.setFixedTime(visitTime);

    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto('/', DOM_READY);

    // React reports a mismatch while hydrating, so the errors are only in by
    // the time the card shows a countdown computed from the browser's clock;
    // the server's own countdown, if it sent one, is on screen before that.
    const [nextBlock] = getUpcomingClassBlocks(visitTime, { limit: 1 });
    await expect(
      page.getByText(formatCountdown(nextBlock.start, visitTime), { exact: true }),
    ).toBeVisible();
    // .first(): the Later list repeats a block's first program, so the same
    // name can appear twice when consecutive blocks share it
    await expect(
      page.getByText(nextBlock.classes[0].program, { exact: true }).first(),
    ).toBeVisible();

    expect(
      errors.filter((text) => /hydrat|did not match|Minified React error/i.test(text)),
    ).toEqual([]);
  });
});

/**
 * The upcoming-classes card at the narrowest widths a phone actually has.
 *
 * Each row of the card's "Later" list pairs a class name with a time, and the
 * name used to carry `truncate`, which sets `white-space: nowrap`. A row is a
 * grid item whose track is sized `auto`, and neither that track nor the row's
 * own `min-width: auto` may shrink below the row's min-content, so a name that
 * refuses to wrap made the whole row wider than the card had to give it at a
 * 320px viewport. Nothing clipped it, so it pushed the document out
 * instead: `document.scrollWidth` came back 350 against a 320px viewport and
 * the home page scrolled sideways on the narrowest common phones. At 360px the
 * document stayed put and the rows still painted out through the side of the
 * sand card, which is why the second test here measures against the card and
 * not the viewport - one of these failures does not imply the other.
 *
 * Clipping is not the fix, and the first two tests here would pass if someone
 * reintroduced it: the hero briefly clipped this overflow and cut times to
 * `Tuesday 7:0`, with the AM/PM gone and no way to reveal it, which is worse
 * than a scrollbar. The third test holds that line inside the card, by reading
 * the times back and checking the name cell is not squeezed. The hero's own
 * clip was an ancestor of the card rather than anything in it, so what holds
 * that is the `overflow: visible` assertion in the hero test further up.
 *
 * These are relations - a scroll width against a client width, an edge against
 * an edge - rather than pixel counts, so they do not depend on the platform's
 * text shaping the way a wrap boundary would. That is also why neither this
 * block nor components/HomeUpcomingClasses.tsx records a per-cell width: a
 * number belongs only where a test reproduces it, and a machine-local one
 * leaves the next reader unable to tell an environment from a regression. See
 * the note in tests/e2e/header-widths.spec.ts for what that cost to learn.
 */
test.describe('Coming-up card fits the narrowest phones', () => {
  // Tuesday night, after the last class of the day: every upcoming block is
  // Wednesday, so the rows carry both the longest day name and the widest class
  // names in content/schedule.ts. That is the worst case the week can produce.
  const visitTime = new Date('2026-09-01T21:30:00');

  // This spec drives the viewport itself, so running it under both configured
  // projects would just do the same work twice.
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'Mobile', 'This spec sets its own viewports.');
    await page.clock.setFixedTime(visitTime);
  });

  /** The "Later" list inside the card, once the clock-driven card is up. */
  async function openCard(page: Page, width: number) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', DOM_READY);
    // The card renders a time-free shell until it has mounted and read the
    // clock, and that shell has no rows at all, so measuring before the
    // countdown is on screen would measure the wrong markup.
    await expect(page.getByText(/Starts in|Starting now/).first()).toBeVisible();
    const card = page.locator('section:has(h1) .shadow-lift').first();
    const list = card.locator('ul').filter({ hasText: /:\d\d/ }).last();
    await expect(list.locator('li').first()).toBeVisible();
    // Measuring before webfonts settle would size the rows off fallback
    // metrics rather than off the Manrope the page actually renders in.
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    return list;
  }

  for (const width of [320, 360, 390]) {
    test(`the home page does not scroll sideways at ${width}px`, async ({ page }) => {
      await openCard(page, width);
      const doc = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(doc.scrollWidth, `home scrolls sideways at ${width}px`).toBe(doc.clientWidth);
    });
  }

  for (const width of [320, 360]) {
    test(`every Later row stays inside the card at ${width}px`, async ({ page }) => {
      const list = await openCard(page, width);
      const overhang = await list.evaluate((ul) => {
        const card = ul.closest('.shadow-lift') as HTMLElement;
        const style = getComputedStyle(card);
        // The card's content edge, not its border-box edge: it is `p-5` inside a
        // 1px border, so measuring to the outside would let a row paint 21px of
        // overflow across the padding and still read as inside the card.
        const limit =
          card.getBoundingClientRect().right -
          parseFloat(style.paddingRight) -
          parseFloat(style.borderRightWidth);
        // The spans as well as the rows: a row can sit inside the card while
        // the text it refuses to shrink paints out through the side of it.
        // Only what paints, though - the screen-reader copy is out of flow and
        // invisible, so measuring it could only fail for a reason this guard
        // does not mean.
        return Math.max(
          ...[...ul.querySelectorAll('li, span:not(.sr-only)')].map(
            (el) => el.getBoundingClientRect().right - limit,
          ),
        );
      });
      // A relation, not a pixel count - the tolerance is only the sub-pixel
      // rounding between a laid-out edge and one recomputed from two lengths.
      expect(overhang, `Later rows paint past the card at ${width}px`).toBeLessThanOrEqual(0.5);
    });
  }

  test('every Later row still shows its whole time at 320px', async ({ page }) => {
    const list = await openCard(page, 320);
    const [, ...later] = getUpcomingClassBlocks(visitTime, { limit: 4 });
    expect(later.length).toBeGreaterThan(0);

    for (const [index, block] of later.entries()) {
      const row = list.locator('li').nth(index);
      // The row's two cells, named by what each holds rather than by position:
      // a positional index is what quietly followed the markup when the time
      // cell gained children, and it would do so again.
      const marker = page.locator('[aria-hidden="true"]');
      const timeCell = row.locator('> span').filter({ has: marker });
      const nameCell = row.locator('> span').filter({ hasNot: marker });
      // The three-letter day is what buys the row the width its class name
      // needs to wrap into; restoring the full day name takes that back off it.
      await expect(timeCell.locator('[aria-hidden="true"]')).toHaveText(
        `${block.day.slice(0, 3)} ${block.startLabel}`,
      );
      // What the abbreviation costs a screen reader is paid back here, so
      // dropping this copy fails rather than passing quietly.
      await expect(row.locator('.sr-only')).toHaveText(`${block.day} ${block.startLabel}`);
      // toHaveText reads the DOM, which a clipped element still fills, so the
      // name cell has to say separately that it is showing all of it. That cell
      // is where the `truncate` which started all this actually lived, and it
      // is still squeezable: it carries `min-w-0` and the default
      // `flex-shrink: 1`, so putting a nowrap utility back on it forces far
      // more text through the cell than the row can give it and this relation
      // goes red. It is a flex item and so blockified, which is the only reason
      // there is a layout box here to read at all.
      //
      // There is deliberately no matching relation on the time cell. While that
      // cell is `shrink-0` with `flex-basis: auto`, its used width IS its
      // max-content width, so its content cannot exceed its box and
      // `scrollWidth <= clientWidth` holds whatever it contains - an assertion
      // that cannot fail, which this file's own rule says to remove rather than
      // keep, because a green test gets read as proof. See the note at
      // tests/e2e/header-widths.spec.ts:30-32. Reinstate one there the moment a
      // future edit drops that `shrink-0` or gives the cell a width: it becomes
      // squeezable then, and the relation starts meaning what it says.
      //
      // A cell-level relation was never what held the `Tuesday 7:0` line
      // anyway. That was an ancestor clipping the whole card, which nothing
      // measured inside the card can see; the assertion that catches it is
      // `expect(hero).toHaveCSS('overflow', 'visible')` in "hero inverts to
      // light-on-dark and clips the photo on the image layer" above.
      //
      // The client width is read first because an inline box reports 0 on both
      // sides and would compare equal whatever it held. A measurement that
      // cannot fail has to fail loudly rather than pass quietly.
      const box = await nameCell.evaluate((el) => ({
        scroll: el.scrollWidth,
        client: el.clientWidth,
      }));
      expect(
        box.client,
        'the class name has no layout box, so nothing measured on it can fail',
      ).toBeGreaterThan(0);
      expect(box.scroll, 'the class name is clipped rather than shown in full').toBeLessThanOrEqual(
        box.client,
      );
    }
  });
});
