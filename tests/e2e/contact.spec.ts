import { test, expect } from '@playwright/test';

test.describe('Contact page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('all form labels visible', async ({ page }) => {
    await expect(page.getByLabel('First name')).toBeVisible();
    await expect(page.getByLabel('Last name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Phone')).toBeVisible();
    await expect(page.getByLabel(/What are your goals/i)).toBeVisible();
  });

  test('"Submit request" button visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Submit request/i })).toBeVisible();
  });

  test('fields accept input and values persist', async ({ page }) => {
    await page.getByLabel('First name').fill('Test');
    await page.getByLabel('Last name').fill('User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel(/What are your goals/i).fill('This is a test message.');

    await expect(page.getByLabel('First name')).toHaveValue('Test');
    await expect(page.getByLabel('Last name')).toHaveValue('User');
    await expect(page.getByLabel('Email')).toHaveValue('test@example.com');
    await expect(page.getByLabel(/What are your goals/i)).toHaveValue('This is a test message.');
  });

  test('submitting empty form shows a helpful error state', async ({ page }) => {
    await page.getByRole('button', { name: /Submit request/i }).click();

    // One message is shown depending on whether the Formspree endpoint was set at build time.
    await expect(
      page
        .getByText(/Please correct the highlighted fields/i)
        .or(page.getByText(/Add NEXT_PUBLIC_FORMSPREE_ENDPOINT to enable form submissions/i)),
    ).toBeVisible();
  });

  test('"Visit us" and "San Marcos" visible', async ({ page }) => {
    await expect(page.getByText('Visit us').first()).toBeVisible();
    await expect(page.getByText(/San Marcos/).first()).toBeVisible();
  });
});
