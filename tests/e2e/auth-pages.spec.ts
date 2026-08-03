import { test, expect } from '@playwright/test';

/**
 * Member login lives in the separate Diaz on Demand app. These legacy paths stay
 * behind only as redirects into /ondemand, which is the one place that knows
 * where members actually go.
 */
test.describe('Legacy auth paths', () => {
  for (const path of ['/sign-in', '/sign-up', '/sign-in/factor-one', '/sign-up/verify']) {
    test(`${path} redirects to /ondemand`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });

      expect(response.status()).toBeGreaterThanOrEqual(300);
      expect(response.status()).toBeLessThan(400);
      expect(response.headers().location).toBe('/ondemand');
    });
  }
});
