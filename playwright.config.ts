import { defineConfig, devices } from '@playwright/test';

// By default we use port 3000, but tests can supply BASE_URL to overwrite
const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const port = new URL(baseURL).port || 3000;

/** Which specs to run (avoids repeating file lists in package.json). Set via npm scripts. */
const suite = process.env.PW_SUITE as 'normal' | 'demo' | undefined;
const suiteTestMatch: Record<'normal' | 'demo', string[]> = {
  normal: ['normal-mode.spec.ts', 'features.spec.ts', 'tree-view.spec.ts', 'community.spec.ts'],
  demo: ['demo-mode.spec.ts', 'features.spec.ts', 'tree-view.spec.ts'],
};

export default defineConfig({
  testDir: './tests',
  ...(suite ? { testMatch: suiteTestMatch[suite] } : {}),
  timeout: 45_000,
  // Next.js dev server modifies shared files, so we disable parallel runs to keep environment isolation.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
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
    command: `NEXT_PUBLIC_DEMO_MODE=${process.env.NEXT_PUBLIC_DEMO_MODE || 'false'} VAULT_PATH=${process.env.VAULT_PATH || './demo-vault'} pnpm run dev --port ${port}`,
    url: baseURL,
    // Set PW_REUSE_SERVER=1 locally if you already have a matching dev server (same port + env).
    reuseExistingServer: process.env.PW_REUSE_SERVER === '1',
    timeout: 120 * 1000,
  },
});
