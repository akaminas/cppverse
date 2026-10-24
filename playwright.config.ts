import { defineConfig, devices } from '@playwright/test';

// Browser tests run against the production build served by `astro preview`
// under the real base path (/cppverse/).
export default defineConfig({
  testDir: 'e2e',
  timeout: 45_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4399/cppverse/',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npx astro preview --port 4399 --force',
    url: 'http://localhost:4399/cppverse/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
