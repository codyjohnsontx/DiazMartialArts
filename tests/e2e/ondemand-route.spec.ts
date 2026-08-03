import { expect, test } from '@playwright/test';

import { ONDEMAND_URL } from '../fixtures/site';

test.describe('Ondemand entry route', () => {
  test('/ondemand hands visitors to the member app once it is configured', async ({ page }) => {
    test.skip(!ONDEMAND_URL, 'NEXT_PUBLIC_ONDEMAND_URL is unset or still the placeholder.');

    // The member app is a separate deployment CI cannot reach, so stub it and
    // assert only that the site hands the visitor over.
    await page.route(`${ONDEMAND_URL}**`, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Member app</h1>' }),
    );

    await page.goto('/ondemand');

    await expect(page).toHaveURL(ONDEMAND_URL!);
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
