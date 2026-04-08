import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const STATE_FILE_PATH = path.resolve(process.cwd(), 'demo-vault/.metadachi.json');

let originalState: string = '{}';

test.beforeAll(async () => {
  try {
    originalState = await fs.readFile(STATE_FILE_PATH, 'utf-8');
  } catch {
    originalState = '{}';
  }
});

const TEST_STATE = {
  "demo-chocolate-chip-cookies": {
    "favorite": true,
    "pinned": true
  },
  "demo-team-sync": {
    "favorite": true,
    "pinned": false
  },
  "demo-project-ideas": {
    "favorite": false,
    "pinned": true
  }
};

// Helper to set a deterministic state for testing
async function resetStateFile() {
  await fs.writeFile(STATE_FILE_PATH, JSON.stringify(TEST_STATE, null, 2));
}

test.describe('Normal Mode (Chokidar & API)', () => {

  test.beforeEach(async ({ page }) => {
    // Reset state before tests to ensure a clean slate
    await resetStateFile();
    await page.goto('/');
  });

  test.afterAll(async () => {
    // Restore the user's pristine vault state
    await fs.writeFile(STATE_FILE_PATH, originalState);
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

    // Wait for the UI to Auto-Sync
    // The "Project Ideas" card should appear as favored.
    const ideaCard = page.locator('.h-full.cursor-pointer', { hasText: 'Project Ideas' }).first();
    const favButton = ideaCard.locator('button:has(svg.lucide-heart)');
    // It should turn red (fill-current is added)
    await expect(favButton.locator('svg')).toHaveClass(/fill-current/, { timeout: 15000 });
  });

  test('Data Hydration: State loads correctly on refresh', async ({ page }) => {
    // Rewrite state so that demo-project-ideas is initially not pinned
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify({
      ...TEST_STATE,
      "demo-project-ideas": { favorite: false, pinned: false }
    }, null, 2));

    await page.waitForTimeout(200); // Let Chokidar catch up
    await page.reload();
    
    // Now make it pinned manually via file
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify({
      ...TEST_STATE,
      "demo-project-ideas": { favorite: false, pinned: true }
    }, null, 2));

    await page.waitForTimeout(200); // Let Chokidar catch up
    // Refresh page
    await page.reload();

    const ideaCard = page.locator('.h-full.cursor-pointer', { hasText: 'Project Ideas' }).first();
    const pinButton = ideaCard.locator('button:has(svg.lucide-pin)');
    await expect(pinButton.locator('svg')).toHaveClass(/fill-current/);
  });

});
