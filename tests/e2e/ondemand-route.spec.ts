import { expect, test } from '@playwright/test';

import { ONDEMAND_URL } from '../fixtures/site';

test.describe('Ondemand entry route', () => {
  test('/ondemand hands visitors to the member app once it is configured', async ({ request }) => {
    test.skip(!ONDEMAND_URL, 'NEXT_PUBLIC_ONDEMAND_URL is unset or still the placeholder.');

    // Must be a real HTTP redirect, not a client-side one: the root
    // app/loading.tsx makes pages stream, so a page-level redirect() flushes a
    // 200 that crawlers and non-JS clients never follow.
    const response = await request.get('/ondemand', { maxRedirects: 0 });

    expect(response.status()).toBeGreaterThanOrEqual(300);
    expect(response.status()).toBeLessThan(400);
    expect(response.headers().location).toBe(ONDEMAND_URL);
  });

  test('/ondemand shows the coming soon page when no member app is configured', async ({
    page,
  }) => {
    test.skip(Boolean(ONDEMAND_URL), 'NEXT_PUBLIC_ONDEMAND_URL points at a member app.');

    await page.goto('/ondemand');

    await expect(page).toHaveURL(/\/ondemand$/);
    await expect(page.getByRole('heading', { name: /Diaz\s+On Demand/i })).toBeVisible();
  });
});
