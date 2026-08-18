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

  test('hero stays light-on-dark over the photo and does not overflow', async ({ page }) => {
    const hero = page.locator('section:has(h1)').first();

    // the copy is only legible over the photo because the section is inverted
    await expect(hero).toHaveCSS('background-color', 'rgb(16, 18, 20)');
    await expect(page.locator('h1')).toHaveCSS('color', 'rgb(247, 243, 237)');
    expect(await hero.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
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
