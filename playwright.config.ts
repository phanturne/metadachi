import { defineConfig, devices } from '@playwright/test';

// By default we use port 3000, but tests can supply BASE_URL to overwrite
const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const port = new URL(baseURL).port || 3000;

export default defineConfig({
  testDir: './tests',
  // Next.js dev server modifies shared files, so we disable parallel runs to keep environment isolation.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, 
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `cross-env NEXT_PUBLIC_DEMO_MODE=${process.env.NEXT_PUBLIC_DEMO_MODE || 'false'} VAULT_PATH=${process.env.VAULT_PATH || './demo-vault'} pnpm run dev --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
