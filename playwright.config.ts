import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end checks against the production review build (fixtures and
 * draft services present, quote endpoint live with console delivery).
 * `npm test` builds it first. The dev server is not used: in a
 * non-interactive shell, Astro 7 hands `astro dev` off to a background
 * process, which Playwright reads as the server exiting.
 */
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node ./dist/server/entry.mjs',
    url: 'http://localhost:4321',
    env: { HOST: '127.0.0.1', PORT: '4321' },
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
