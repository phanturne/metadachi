import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

import { STATE_FILE_PATH, TEST_STATE, manageOriginalState, resetStateFile, restoreOriginalState } from './test-utils';

let originalState: string = '{}';

test.beforeAll(async () => {
  originalState = await manageOriginalState();
});

test.describe('Normal Mode (Chokidar & API)', () => {

  test.beforeEach(async ({ page }) => {
    // Reset state before tests to ensure a clean slate
    await resetStateFile();
    await page.goto('/');
  });

  test.afterAll(async () => {
    // Restore the user's pristine vault state
    await restoreOriginalState(originalState);
  });

  test('Client-to-FS Write: Toggling favorite updates the filesystem JSON', async ({ page, request }) => {
    // In the baseline state, "demo-project-ideas" is NOT favorited.
    // Let's filter to the card with title "Project Ideas" and favorite it.
    const ideaCard = page.locator('.h-full.cursor-pointer', { hasText: 'Project Ideas' }).first();
    const favButton = ideaCard.locator('button:has(svg.lucide-heart)');
    
    // Toggle favorite ON
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/vault/favorite') && resp.status() === 200),
      favButton.click()
    ]);

    await page.waitForTimeout(500);

    // Read the file and verify it was updated
    const stateContent = await fs.readFile(STATE_FILE_PATH, 'utf-8');
    const states = JSON.parse(stateContent);
    
    // We expect demo-project-ideas to be flipped to true
    expect(states['demo-project-ideas'].favorite).toBe(true);
  });

  test('FS-to-Client Sync: Modifying JSON manually updates UI automatically', async ({ page }) => {
    // Wait for initial load
    await expect(page.locator('.h-full.cursor-pointer').first()).toBeVisible();

    // Because 'demo-project-ideas' is initially NOT favorited, its title should not be under the Favorites header
    // Wait, Favorites section is visible because of other cards.
    // Let's manually write to JSON to favorite 'demo-project-ideas'
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify({
      ...TEST_STATE,
      "demo-project-ideas": { favorite: true, pinned: true }
    }, null, 2));

    // Wait for the UI to auto-sync (SSE → vault refetch). Prefer button chrome over Lucide SVG classes.
    const favorites = page.locator('section').filter({ has: page.getByRole('heading', { name: /Favorites/i }) });
    await expect(favorites).toContainText('Exciting Project Ideas', { timeout: 20_000 });
    const ideaCard = page.locator('.h-full.cursor-pointer', { hasText: 'Project Ideas' }).first();
    const favButton = ideaCard.locator('button:has(svg.lucide-heart)');
    await expect(favButton).toHaveClass(/text-red-500/);
  });

  test('Data Hydration: State loads correctly on refresh', async ({ page }) => {
    // Rewrite state so that demo-project-ideas is initially not pinned
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify({
      ...TEST_STATE,
      "demo-project-ideas": { favorite: false, pinned: false }
    }, null, 2));

    await page.waitForTimeout(500);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForResponse(
      r => r.url().includes('/api/vault') && r.request().method() === 'GET' && r.ok(),
      { timeout: 30_000 }
    );

    // Now make it pinned manually via file
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify({
      ...TEST_STATE,
      "demo-project-ideas": { favorite: false, pinned: true }
    }, null, 2));

    const pinned = page.locator('section').filter({ has: page.getByRole('heading', { name: /Pinned/i }) });
    await expect(pinned).toContainText('Exciting Project Ideas', { timeout: 25_000 });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForResponse(
      r => r.url().includes('/api/vault') && r.request().method() === 'GET' && r.ok(),
      { timeout: 30_000 }
    );

    const ideaCard = page.locator('.h-full.cursor-pointer', { hasText: 'Project Ideas' }).first();
    const pinButton = ideaCard.locator('button:has(svg.lucide-pin)');
    await expect(pinButton).toHaveClass(/text-yellow-500/);
  });

  test('API Resilience: Malformed POST payloads are rejected cleanly', async ({ request }) => {
    // 1. Missing body entirely
    const resp1 = await request.post('/api/vault/favorite', { data: {} });
    expect(resp1.status()).toBe(400);

    // 2. Corrupting explicit payload property types (string boolean)
    const resp2 = await request.post('/api/vault/pin', {
      data: {
        id: 'demo-chocolate-chip-cookies',
        pinned: "NOT_A_BOOLEAN"
      }
    });
    expect(resp2.status()).toBe(400);
  });

});
