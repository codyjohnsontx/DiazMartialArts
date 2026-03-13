import { expect, test } from '@playwright/test';

test.describe('Account gate', () => {
  test('/account redirects signed-out visitors to sign-in with account return URL', async ({
    page,
  }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/\/sign-in\?redirect_url=(%2Faccount|\/account)/);
  });
});
