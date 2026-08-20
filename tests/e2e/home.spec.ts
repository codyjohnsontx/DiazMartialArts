import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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

  test('hero renders the gym photo through the Next image optimizer', async ({ page }) => {
    const heroImage = page.locator('section:has(h1) img').first();

    await expect(heroImage).toHaveAttribute('src', /\/_next\/image\?url=%2Fbjj\.jpg/);
    // the hero photo is the LCP element, so it is preloaded rather than lazy
    await expect(heroImage).toHaveAttribute('fetchpriority', 'high');
    await expect(heroImage).toHaveJSProperty('complete', true);
    const naturalWidth = await heroImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
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
