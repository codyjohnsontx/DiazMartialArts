import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const useProductionServer = process.env.PLAYWRIGHT_USE_START === '1';
const serverUrl = new URL(baseURL);
const isLocalServer =
  serverUrl.hostname === 'localhost' ||
  serverUrl.hostname === '127.0.0.1' ||
  serverUrl.hostname === '[::1]';
const serverPort =
  serverUrl.port || (isLocalServer ? '3000' : serverUrl.protocol === 'https:' ? '443' : '80');
const serverCommand = `${useProductionServer ? 'npm run start' : 'npm run dev'} -- -p ${serverPort}`;

export default defineConfig({
  testDir: './tests/e2e',
  retries: process.env.CI ? 2 : 0,
  // Limit workers when using next dev to avoid overwhelming the dev server
  workers: process.env.CI ? undefined : 1,
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile',
      use: { viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: serverCommand,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
