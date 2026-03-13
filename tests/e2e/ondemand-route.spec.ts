import { expect, test } from '@playwright/test';

test.describe('Ondemand entry route', () => {
  test('/ondemand redirects signed-out visitors to sign-in with account return URL', async ({
    page,
  }) => {
    await page.goto('/ondemand');
    await expect(page).toHaveURL(/\/sign-in\?redirect_url=(%2Faccount|\/account)/);
  });
});
