import { test, expect } from '@playwright/test';

import { imageSize } from '../fixtures/imageSize';
import { PUBLIC_PAGES } from '../fixtures/site';

test.describe('Public pages - HTTP 200 + heading + footer', () => {
  for (const { path, heading } of PUBLIC_PAGES) {
    test(`${path} returns 200 and shows heading`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole('heading', { name: new RegExp(heading, 'i') }).first(),
      ).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });
  }
});

// The head instructor's rank line, bio and rank list, written out here in full
// and on purpose. A guard that read the same strings back out of
// content/coaches.ts would pass any rename made in that file, which is exactly
// the change it needs to catch: this copy is owner-approved and is not the
// page's to reword, re-order or quietly drop. So this block is the independent
// record of what was approved, and the page is measured against it.
//
// Note the plain hyphens. The copy uses no em or en dash anywhere, and the
// middle dot appears only in the rank line and in the F.I.G.H.T. entry, so a
// stray typographic substitution fails here rather than reaching the site.
const HEAD_COACH_RANK = '8th Degree Grandmaster · Chief Head Instructor';

const HEAD_COACH_BIO = [
  'Training since December 1989. Leading Diaz Martial Arts as owner and Chief Head Instructor for 28 years.',
  "His work has shaped instruction well beyond one school. He served as senior consultant for United Professionals and head instructor of East West Karate in Coral Springs, Florida. In 2001 he joined the corporate headquarters of Black Belt Schools International, helping schools across the country strengthen their programs and contributing to the Instructor's College curriculum. He has produced and been featured in multiple instructional video series for Century Martial Arts.",
  'He holds grandmaster rank in three Filipino martial arts and black belt rank in six more disciplines, earned under some of the most respected names in the industry - and he still trains with them.',
];

const CREDENTIAL_GROUPS = [
  {
    group: 'Filipino martial arts & JKD',
    entries: [
      {
        rank: 'Kali - 8th Degree Black Belt, Grandmaster',
        under: 'under Grandmaster John Bruce Daniels',
      },
      {
        rank: 'Escrido - 8th Degree Black Belt, Grandmaster',
        under: 'under Grandmaster John Bruce Daniels',
      },
      {
        rank: 'Arnis - 8th Degree Black Belt, Grandmaster',
        under: 'under Grandmaster John Bruce Daniels',
      },
      { rank: 'Jeet Kune Do - Full Instructor', under: 'under John Bruce Daniels' },
    ],
  },
  {
    group: 'Traditional',
    entries: [
      // No art is named on this one. The owner's source material gives the
      // degree and the teachers and nothing else, and that gap is with him as
      // an open question - so it is not a typo to be helpfully filled in here.
      {
        rank: '7th Degree Black Belt, Shihan',
        under: 'under Professor Larry Hilton & Hanshi John Geyston',
      },
      { rank: 'Tae Kwon Do - 6th Degree Black Belt', under: 'under Master Ronald Brett Brown' },
    ],
  },
  {
    group: 'Striking',
    entries: [
      {
        rank: 'American Kickboxing - 2nd Degree Black Belt',
        under: 'under Bill "Superfoot" Wallace',
      },
      { rank: 'Muay Thai (Chute Boxe) - Kru', under: 'under Luiz Charneski' },
      { rank: 'Muay Lao Kickboxing - Arjan', under: 'under Arjan John Bruce Daniels' },
    ],
  },
  {
    group: 'Grappling',
    entries: [
      {
        rank: 'Brazilian Jiu-Jitsu - 2nd Degree Black Belt, Instructor Bars',
        under: 'under Frank "King" Webb / Coral Belt Cleber Luciano',
      },
    ],
  },
  {
    group: 'Reality-based self defense',
    entries: [
      { rank: 'HagAnaH - 4th Degree, Master Instructor', under: 'under Mike Lee Kanarek' },
      { rank: 'Blade Artist (HagAnaH) - 2nd Degree Black Belt', under: 'under Mike Lee Kanarek' },
      {
        rank: 'F.I.G.H.T. Instructor · Ground Survival · I.K.T. Instructor',
        under: 'under Mike Lee Kanarek',
      },
      { rank: 'I.P.T.T. Instructor', under: 'under Mike Lee Kanarek & Garret Machine' },
    ],
  },
];

test.describe('Coaches page details', () => {
  test('shows Coach Eddie Diaz and head instructor label', async ({ page }) => {
    await page.goto('/coaches');
    await expect(page.getByText(/Eddie Diaz/i).first()).toBeVisible();
    await expect(page.getByText(/Head Instructor/i).first()).toBeVisible();
  });

  // Compares the profile's whole run of paragraphs in one go rather than
  // asserting each approved one is present somewhere. Presence checks pass an
  // added paragraph nobody approved, and pass a re-ordering of the two body
  // paragraphs, which is the same silent drift the rank list guard below exists
  // to stop. The rank line is the first paragraph in the block, so it is
  // asserted here too.
  //
  // The profile is addressed as a named landmark, labelled by its own <h2>, so
  // the read stays scoped without coupling to a class name or markup position.
  // The exact compare also rests on Placeholder emitting no <p> when it is
  // given a src: that is what makes this run exactly the rank line plus the bio
  // paragraphs, so a caption added to that branch would surface here.
  test('renders the rank line and the bio paragraphs, in order and with nothing extra', async ({
    page,
  }) => {
    await page.goto('/coaches');

    const profile = page.getByRole('region', { name: 'Eddie Diaz' });
    await expect(profile).toBeVisible();

    const paragraphs = (await profile.locator('p').allTextContents()).map((text) => text.trim());

    expect(paragraphs).toEqual([HEAD_COACH_RANK, ...HEAD_COACH_BIO]);
  });

  // The opening line carries the whole claim, so it is set apart from the two
  // paragraphs under it. Assert the relationship rather than the exact type
  // scale, so a restyle stays free but a flattening does not pass unnoticed.
  test('sets the lead paragraph apart from the body paragraphs', async ({ page }) => {
    await page.goto('/coaches');

    const sizeOf = (text: string) =>
      page
        .getByText(text, { exact: true })
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

    const [leadSize, bodySize] = await Promise.all([
      sizeOf(HEAD_COACH_BIO[0]!),
      sizeOf(HEAD_COACH_BIO[1]!),
    ]);

    expect(leadSize).toBeGreaterThan(bodySize);
  });

  test('renders every rank and certification group exactly as approved', async ({ page }) => {
    await page.goto('/coaches');

    const credentials = page.getByRole('region', { name: 'Rank and certification' });
    await expect(credentials).toBeVisible();

    const rendered = await credentials.evaluate((section) =>
      [...section.querySelectorAll('h3')].map((heading) => ({
        group: heading.textContent?.trim() ?? '',
        entries: [...(heading.parentElement?.querySelectorAll('li') ?? [])].map((entry) =>
          [...entry.querySelectorAll('p')].map((line) => line.textContent?.trim() ?? ''),
        ),
      })),
    );

    expect(rendered).toEqual(
      CREDENTIAL_GROUPS.map(({ group, entries }) => ({
        group,
        entries: entries.map((entry) => [entry.rank, entry.under]),
      })),
    );
  });
});

test.describe('Announcements page details', () => {
  test('shows Announcements heading', async ({ page }) => {
    await page.goto('/announcements');
    await expect(page.getByRole('heading', { name: 'Announcements', level: 1 })).toBeVisible();
  });

  /**
   * The h1 is a single word with no break opportunity of its own, so it used
   * to run past the right edge of a phone and take the whole page sideways
   * with it: every width from 300 to 439px, where the word measures 424px
   * against a column of viewport minus 32px, and again from 640 to 658px,
   * where the `sm` step takes it to 635px against viewport minus 48px. The
   * word now carries a soft hyphen; app/announcements/page.tsx explains why
   * that rather than a smaller type step.
   *
   * These are the two boundary widths of each band plus the two just outside
   * it, and they assert a relation - scrollWidth against clientWidth - not a
   * pixel count, so nothing here depends on how this machine shapes text. The
   * widths themselves are only where the failure used to live; move the type
   * scale and the band moves, but a band that reopens still lands on one of
   * them.
   *
   * 300 is deliberately not in that list, and adding it back would assert on
   * the browser rather than on this page. 300px is Chromium's own minimum
   * layout width, not anything this page contains: at viewports of 296 to
   * 299px a walk of every element on the page found none whose right edge
   * passed the viewport, and documentElement.scrollWidth still came back 300.
   * So below 320px the page cannot report overflow whatever the heading does,
   * and a 300px case would clear that floor by nothing at all. 320px is the
   * narrowest width any real device has, and the heading clears it with room
   * to spare: the widest rendered line of the hyphenated word (ANNOUNCE-)
   * measures 263.53px at the 48px step, and with the h1's left edge at 16px
   * its right edge sits at 279.5px, about 40px inside the viewport.
   */
  for (const width of [320, 390, 439, 440, 639, 640, 658, 659]) {
    test(`does not scroll sideways at ${width}px`, async ({ page }, testInfo) => {
      // These set their own viewports, so the configured project viewports are
      // irrelevant and running them under both would do the same work twice -
      // the same reason tests/e2e/header-widths.spec.ts skips that project.
      test.skip(testInfo.project.name === 'Mobile', 'This block sets its own viewports.');
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/announcements');
      const doc = await page.evaluate(async () => {
        // Measuring before the webfont settles would size the heading off
        // fallback metrics, which are not the ones this page renders in.
        await document.fonts.ready;
        const el = document.documentElement;
        return { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
      });
      expect(doc.scrollWidth, `/announcements scrolls sideways at ${width}px`).toBe(
        doc.clientWidth,
      );
    });
  }

  /**
   * The break opportunity itself, which the overflow guard above cannot see:
   * `overflow-wrap: break-word` would satisfy every one of those widths while
   * splitting the word mid-syllable and drawing no hyphen. The soft hyphen is
   * invisible in the rendered page and in the accessible name, so a stray
   * reformat or a copy-paste through an editor that strips control characters
   * would take it out silently. Both halves are pinned: the character is in
   * the text, and the name assistive technology reads is still the plain word.
   */
  test('the h1 carries a soft hyphen and still reads as one word', async ({ page }) => {
    await page.goto('/announcements');
    // Read raw rather than through toHaveText, which normalises U+00AD away
    // and so passes just as happily on the unhyphenated word - it was written
    // that way first and could not fail. Spelled as an escape on purpose too:
    // the character this pins is invisible, and a literal copy of it here
    // would be as easy to lose as the one in the page.
    const h1 = page.getByRole('heading', { name: 'Announcements', level: 1 });
    await expect(h1).toBeVisible();
    expect(await h1.evaluate((el) => el.textContent)).toBe('Announce\u00ADments');
  });

  test('carries no class-schedule flyer and every flyer resolves to a real image', async ({
    page,
    request,
  }) => {
    await page.goto('/announcements');

    // A class timetable reads as current operating hours, so it belongs on
    // /schedule alone and the feed must not carry a competing copy.
    await expect(page.getByRole('heading', { name: /Class Schedule/i })).toHaveCount(0);
    await expect(page.locator('main img[src*="class-schedule"]')).toHaveCount(0);

    const flyers = page.locator('main article img');
    const flyerCount = await flyers.count();
    expect(flyerCount).toBeGreaterThan(0);

    // This deliberately does NOT wait for the browser to decode each flyer.
    //
    // next/image routes every flyer through the on-demand optimizer, which
    // re-encodes it per request in `next dev` and in `next start` alike -
    // `next build` does not pre-generate those variants. Without the optional
    // `sharp` package installed the optimizer falls back to a WebAssembly
    // encoder whose worker pool is `min(cpus - 1, 6)` wide, so on a small CI
    // runner the whole page's variants encode more or less one at a time.
    // Measured cold and serialized over the fourteen variants this page asked
    // for when it carried thirteen flyers: ~12s on an idle developer machine
    // and ~27s with the CPU contended, and the feed is content, so its length
    // moves. A flyer scrolled into view queues behind whatever is already
    // encoding, so any fixed decode deadline is really an assertion about how
    // busy the box is. Two such deadlines were raised here before; a third
    // would not have converged either.
    //
    // So assert what the page is actually responsible for instead: that the
    // featured flyer loads eagerly and the rest lazily, and that every flyer
    // points at a file the site really serves, which really is an image, and
    // whose true size matches the dimensions the page declares. That still
    // fails on a missing, corrupt, or mis-measured flyer - and it fails naming
    // the offending file - without making a third-party encoder's throughput
    // part of the contract.
    await expect(flyers.first()).toHaveAttribute('loading', 'eager');
    for (let i = 1; i < flyerCount; i++) {
      await expect(flyers.nth(i)).toHaveAttribute('loading', 'lazy');
    }

    for (let i = 0; i < flyerCount; i++) {
      const flyer = flyers.nth(i);
      const src = await flyer.getAttribute('src');
      expect(src, `flyer ${i} renders without a src`).toBeTruthy();

      // Recover the underlying public path from the optimizer URL
      // (/_next/image?url=<path>&w=..&q=..), then fetch that path directly.
      const rendered = new URL(src!, 'http://localhost');
      const source = rendered.searchParams.get('url') ?? rendered.pathname;

      const response = await request.get(source);
      expect(response.status(), `${source} is not served`).toBe(200);
      expect(response.headers()['content-type'], `${source} is not served as an image`).toMatch(
        /^image\//,
      );

      const actual = imageSize(await response.body());
      expect(actual, `${source} is not a readable JPEG or PNG`).not.toBeNull();
      expect(
        actual,
        `${source} is ${actual?.width}x${actual?.height} but the page declares it otherwise`,
      ).toEqual({
        width: Number(await flyer.getAttribute('width')),
        height: Number(await flyer.getAttribute('height')),
      });
    }
  });

  test('every flyer card names its control briefly and still announces the offer', async ({
    page,
  }) => {
    await page.goto('/announcements');

    const cards = page.locator('main article');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      const enlarge = card.getByRole('button', { name: /^Enlarge / });
      const title = ((await card.getByRole('heading').first().textContent()) ?? '').trim();
      const alt = await card.locator('img').first().getAttribute('alt');
      expect(alt, `flyer ${i} renders without alt text`).toBeTruthy();

      // These flyers are the announcement - the offer, the price, what it
      // includes, the phone number exist only inside the image - so the alt
      // carries all of it. An aria-label wins the accessible name outright and
      // assistive technology presents a button as one node, so that alt is not
      // announced on the card and the description relationship is the only
      // thing keeping it reachable without opening the lightbox. Read against
      // the browser's own accessibility tree, which is what actually settles
      // whether a visually hidden node still announces.
      await expect(enlarge).toHaveAccessibleName(`Enlarge ${title}`);
      await expect(enlarge).toHaveAccessibleDescription(alt!);
    }
  });

  test('every category filter it offers selects part of the feed', async ({ page }) => {
    // This used to assert every one of four named categories lists something.
    // That held only while the feed happened to span all four, and the feed is
    // whatever the gym is currently running. The row now renders a button only
    // for a category the feed carries, and no row at all below two of them, so
    // what is checked here is that promise: nothing it advertises is a dead end
    // or a no-op, against the real page and the real content. The guarantees
    // that need a feed spanning several categories - that picking one excludes
    // the others, and that an empty selection says so - are pinned in
    // tests/components/announcement-flyer-gallery.test.tsx, where the feed is a
    // fixture rather than whatever is running this month.
    await page.goto('/announcements');

    const articles = page.locator('main article');
    const emptyState = page.getByText(/No announcements in this category/i);

    const allCount = await articles.count();
    expect(allCount).toBeGreaterThan(0);
    await expect(emptyState).toHaveCount(0);

    // The row is server-rendered, so this count is settled before hydration is.
    // It is either absent or All plus at least two categories: a lone category
    // would put up buttons that both select the whole feed.
    const filterButtons = page.locator('main button[aria-pressed]');
    const rowSize = await filterButtons.count();
    expect(rowSize === 0 || rowSize >= 3, `the filter row renders ${rowSize} buttons`).toBe(true);

    if (rowSize === 0) return;

    // The row lists only the categories the feed carries, so walk what is
    // rendered rather than a fixed set of names that need not all be there.
    await expect(filterButtons.first()).toHaveText(/^All$/i);
    const categories = (await filterButtons.allTextContents()).slice(1).map((t) => t.trim());
    expect(categories.length).toBeGreaterThan(0);

    let selected = 0;
    for (const category of categories) {
      const button = page.getByRole('button', { name: new RegExp(`^${category}$`, 'i') });
      await button.click();

      // count() does not retry, so read it only once the click has demonstrably
      // landed. These specs run against `next dev`, where hydration can trail
      // the load event; a click that arrives before it is swallowed, and the
      // unfiltered count read in its place would surface much later as a bogus
      // count mismatch instead of the timing miss it actually was.
      await expect(button).toHaveAttribute('aria-pressed', 'true');

      const count = await articles.count();
      selected += count;

      // The row advertises this category, so it has to lead somewhere, and the
      // empty state has to stay away. Only that direction is observable from
      // this page: no button is rendered for a category with no flyers, so the
      // empty state cannot be reached here at all.
      expect(count, `the "${category}" filter is a dead end`).toBeGreaterThan(0);
      await expect(emptyState).toHaveCount(0);
    }

    // Each flyer carries exactly one category, so the filtered views should
    // partition the feed. The walk covers only the categories currently
    // present, but a row is rendered at all only from two of them up, so
    // reaching here means the sum really is over more than one filtered view
    // and a filter that stopped excluding over-counts and fails.
    expect(selected).toBe(allCount);
  });
});

test.describe('Schedule page details', () => {
  test('renders weekly schedule heading and day tabs', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page.getByRole('heading', { name: /Weekly class schedule/i })).toBeVisible();

    for (const day of [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]) {
      await expect(page.getByRole('tab', { name: `${day} schedule` })).toBeVisible();
    }
  });
});

test.describe('FAQ page details', () => {
  test('renders at least one FAQ question', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByRole('button', { name: /experience to start/i })).toBeVisible();
  });
});
