import { test, expect } from '@playwright/test';

test.describe('Contact page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('all form labels visible', async ({ page }) => {
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Phone (optional)')).toBeVisible();
    await expect(page.getByLabel('Message')).toBeVisible();
  });

  test('"Send Message" button visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();
  });

  test('fields accept input and values persist', async ({ page }) => {
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Message').fill('This is a test message.');

    await expect(page.getByLabel('Name')).toHaveValue('Test User');
    await expect(page.getByLabel('Email')).toHaveValue('test@example.com');
    await expect(page.getByLabel('Message')).toHaveValue('This is a test message.');
  });

  test('submitting empty form shows a helpful error state', async ({ page }) => {
    await page.getByRole('button', { name: 'Send Message' }).click();

    if (process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT) {
      await expect(page.getByText(/Please correct the highlighted fields/i)).toBeVisible();
    } else {
      await expect(
        page.getByText(/Add NEXT_PUBLIC_FORMSPREE_ENDPOINT to enable form submissions/i),
      ).toBeVisible();
    }
  });

  test('"Visit the academy" and "San Marcos" visible', async ({ page }) => {
    await expect(page.getByText('Visit the academy')).toBeVisible();
    // "San Marcos" appears in both contact section and footer; first() is enough
    await expect(page.getByText(/San Marcos/).first()).toBeVisible();
  });
});
