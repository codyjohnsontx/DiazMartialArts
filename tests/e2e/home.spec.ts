import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('title contains site name', async ({ page }) => {
    await expect(page).toHaveTitle(/Diaz Martial Arts/);
  });

  test('h1 contains "Martial Arts for Real"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Martial Arts for Real');
  });

  test('discipline pills visible', async ({ page }) => {
    // Use first() since "Brazilian Jiu Jitsu" also appears in programs headings
    await expect(page.getByText('Brazilian Jiu Jitsu', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Muay Thai', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Karate', { exact: true }).first()).toBeVisible();
  });

  test('"Why Train Here" and "Structured beginner pathways" visible', async ({ page }) => {
    await expect(page.getByText('Why Train Here')).toBeVisible();
    await expect(page.getByText(/Structured beginner pathways/)).toBeVisible();
  });

  test('stats strip shows "San Marcos, TX"', async ({ page }) => {
    // "San Marcos, TX" appears in both stats strip and footer; first() is enough
    await expect(page.getByText('San Marcos, TX').first()).toBeVisible();
  });

  test('Programs section visible', async ({ page }) => {
    await expect(page.getByText('Classes for every stage')).toBeVisible();
  });

  test('Testimonials section visible', async ({ page }) => {
    await expect(page.getByText('What members say')).toBeVisible();
  });

  test('at least one "Book a Free Trial" link exists', async ({ page }) => {
    const ctaLinks = page.getByRole('link', { name: /Book a Free Trial/i });
    await expect(ctaLinks.first()).toBeVisible();
  });

  test('announcement bar visible with GI promo text', async ({ page }) => {
    await expect(page.getByText(/Two months free with purchase of GI/)).toBeVisible();
  });

  test('footer present with copyright text', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/All rights reserved/)).toBeVisible();
  });
});
