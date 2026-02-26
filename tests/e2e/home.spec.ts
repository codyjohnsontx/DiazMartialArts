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
    await expect(page.getByText('Brazilian Jiu Jitsu', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Muay Thai', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Karate', { exact: true }).first()).toBeVisible();
  });

  test('hero shows core ctas', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Book a Free Trial/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /View Schedule/i }).first()).toBeVisible();
  });

  test('right-side cta card visible with trial action', async ({ page }) => {
    await expect(page.getByText('Start Today')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Book a Free Trial' }).first()).toBeVisible();
  });

  test('programs section visible', async ({ page }) => {
    await expect(page.getByText('Classes for every stage')).toBeVisible();
  });

  test('cta banner visible', async ({ page }) => {
    await expect(page.getByText('Start This Week')).toBeVisible();
    await expect(page.getByText(/Train with purpose at Diaz Martial Arts/)).toBeVisible();
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
