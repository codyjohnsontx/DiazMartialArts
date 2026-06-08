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

  test('discipline ribbon visible', async ({ page }) => {
    await expect(page.getByText('Brazilian Jiu Jitsu', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Muay Thai', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Karate', { exact: true }).first()).toBeVisible();
  });

  test('hero shows core ctas', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Book a Free Trial/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /View Schedule/i }).first()).toBeVisible();
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

  test('announcement bar visible with GI promo text', async ({ page }) => {
    await expect(page.getByText(/Two months free with purchase of GI/i)).toBeVisible();
  });

  test('footer present with copyright text', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/All rights reserved/i)).toBeVisible();
  });
});
