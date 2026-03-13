import { expect, test } from '@playwright/test';

test.describe('Ondemand entry route', () => {
  test('/ondemand redirects signed-out visitors to sign-in with ondemand return URL', async ({
    page,
  }) => {
    await page.goto('/ondemand');
    await expect(page).toHaveURL(/\/sign-in\?redirect_url=(%2Fondemand|\/ondemand)/);
  });
});
