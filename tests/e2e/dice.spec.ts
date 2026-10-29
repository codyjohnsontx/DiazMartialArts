import { test, expect } from '@playwright/test';

import { waitForHydration, waitForMenuToggleHydration } from '../fixtures/hydration';

// The dice faces the page can show, read from the content file the page reads,
// so a face the roller invents rather than picks would fail here.
import { dice } from '../../content/dice';

const allFaces = new Set(dice.flatMap((die) => die.faces.map((face) => face.label)));
const dieButton = (page: import('@playwright/test').Page, name: string) =>
  page.getByRole('button', { name: new RegExp(`^${name}`) });

async function openDice(page: import('@playwright/test').Page) {
  // The hero photo elsewhere is what makes `load` slow; nothing here needs it.
  await page.goto('/dice', { waitUntil: 'domcontentloaded' });
  // `click()` waits for the button to be actionable but not for React to have
  // attached its handler, which against `next dev` trails the markup. The
  // first button in main is the Position die, rendered by the same client
  // component as the roll button; a plain CSS selector, because the wait runs
  // `document.querySelector`, which knows nothing of Playwright's `:has-text`.
  await waitForHydration(page, 'main button');
}

// The face text is the second line of the die button, between the die's name
// and its prompt; read it off the markup rather than parsing the whole name.
async function shownFace(page: import('@playwright/test').Page, name: string) {
  return dieButton(page, name)
    .locator('span')
    .nth(1)
    .evaluate((el) => el.textContent?.trim() ?? '');
}

test.describe('Jiu jitsu dice', () => {
  test('one tap rolls all three dice to faces from the content file and announces the result', async ({
    page,
  }) => {
    await openDice(page);

    for (const die of dice) {
      await expect(dieButton(page, die.name)).toContainText('Not rolled yet');
    }

    await page.getByRole('button', { name: 'Roll the dice' }).click();
    await expect(page.getByRole('button', { name: 'Roll again' })).toBeEnabled();

    const faces: string[] = [];
    for (const die of dice) {
      const face = await shownFace(page, die.name);
      expect(
        die.faces.map((f) => f.label),
        `${die.name} shows "${face}"`,
      ).toContain(face);
      faces.push(face);
    }
    await expect(page.getByRole('status')).toHaveText(
      dice.map((die, i) => `${die.name}: ${faces[i]}.`).join(' '),
    );
  });

  test('tapping one die re-rolls only that die', async ({ page }) => {
    await openDice(page);
    await page.getByRole('button', { name: 'Roll the dice' }).click();
    await expect(page.getByRole('button', { name: 'Roll again' })).toBeEnabled();
    const before = await Promise.all(dice.map((die) => shownFace(page, die.name)));

    await dieButton(page, 'Submission').click();
    await expect(page.getByRole('button', { name: 'Roll again' })).toBeEnabled();

    expect(await shownFace(page, 'Position')).toBe(before[0]);
    expect(await shownFace(page, 'Sweep or pass')).toBe(before[2]);
    expect(allFaces.has(await shownFace(page, 'Submission'))).toBe(true);
  });

  // A reduced-motion visitor gets the same result with nothing in between: no
  // "Rolling…" window ever opens, so the result is there on the next read.
  test('settles immediately under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openDice(page);

    await page.getByRole('button', { name: 'Roll the dice' }).click();

    await expect(page.getByRole('button', { name: 'Roll again' })).toBeEnabled();
    expect(allFaces.has(await shownFace(page, 'Position'))).toBe(true);
  });

  // The longest faces on the narrowest phones. The roller is a grid of three
  // buttons with their own `min-w-0`, so a long face must wrap inside its card
  // rather than push the page sideways; the home card's note in
  // components/HomeUpcomingClasses.tsx is the mechanism this guards against.
  for (const width of [320, 360]) {
    test(`does not scroll sideways at ${width}px after a roll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openDice(page);
      await page.getByRole('button', { name: 'Roll the dice' }).click();
      await expect(page.getByRole('button', { name: 'Roll again' })).toBeEnabled();

      const doc = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(doc.scrollWidth, `/dice scrolls sideways at ${width}px`).toBe(doc.clientWidth);
    });
  }

  test('is linked from the footer on every page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const link = page.getByRole('contentinfo').getByRole('link', { name: 'Jiu Jitsu Dice' });
    await expect(link).toHaveAttribute('href', '/dice');
    await link.click();
    await expect(page).toHaveURL('/dice');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jiu Jitsu Dice');
  });

  // Every face in the content file carries a video, so a roll shows three
  // stills from YouTube's image host and no player; the player arrives only
  // on tap, on the privacy-enhanced host. The iframe is asserted by its src,
  // not by waiting for YouTube to answer, which this suite does not depend on.
  test('shows each rolled face as its YouTube still, and plays it only when tapped', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openDice(page);
    await expect(page.locator('main img, main iframe')).toHaveCount(0);

    await page.getByRole('button', { name: 'Roll the dice' }).click();
    await expect(page.getByRole('button', { name: 'Roll again' })).toBeEnabled();

    const stills = page.locator('main img');
    await expect(stills).toHaveCount(dice.length);
    for (const src of await stills.evaluateAll((els) => els.map((el) => el.getAttribute('src')))) {
      expect(src).toMatch(/^https:\/\/i\.ytimg\.com\/vi\/[A-Za-z0-9_-]{11}\/hqdefault\.jpg$/);
    }
    await expect(page.locator('main iframe')).toHaveCount(0);

    const face = await shownFace(page, 'Submission');
    await page.getByRole('button', { name: `Watch: ${face}` }).click();

    const player = page.locator('main iframe');
    await expect(player).toHaveCount(1);
    await expect(player).toHaveAttribute(
      'src',
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}\?rel=0&autoplay=1$/,
    );
    await expect(player).toHaveAttribute('title', `${face} video`);
    await expect(stills).toHaveCount(dice.length - 1);
  });

  test('is in the header navigation on every page', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const nav =
      testInfo.project.name === 'Mobile'
        ? page.locator('#mobile-nav')
        : page.getByRole('navigation', { name: 'Primary' });
    if (testInfo.project.name === 'Mobile') {
      // The toggle's handler trails the markup against `next dev`; a click
      // that lands first is swallowed, as tests/fixtures/hydration.ts records.
      await waitForMenuToggleHydration(page);
      await page.getByRole('button', { name: 'Toggle menu' }).click();
    }
    const link = nav.getByRole('link', { name: 'Dice' });
    await expect(link).toHaveAttribute('href', '/dice');
    await link.click();
    await expect(page).toHaveURL('/dice');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jiu Jitsu Dice');
  });
});
