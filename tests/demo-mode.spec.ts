import { test, expect } from '@playwright/test';
import fs from 'fs/promises';

import { STATE_FILE_PATH, manageOriginalState, resetStateFile, restoreOriginalState } from './test-utils';

let originalState: string = '{}';

test.beforeAll(async () => {
  originalState = await manageOriginalState();
});

test.describe('Demo Mode (localStorage isolation)', () => {

  test.beforeEach(async () => {
    // Make sure we start strictly clean using deterministic test state. 
    await resetStateFile();
  });

  test.afterAll(async () => {
    // Restore the user's pristine vault state
    await restoreOriginalState(originalState);
  });

  test('Client Write & FS Isolation: Toggling favorite uses localstorage, ignores FS', async ({ page }) => {
    await page.goto('/');

    const ideaCard = page.locator('.h-full.cursor-pointer', { hasText: 'Project Ideas' }).first();
    const favButton = ideaCard.locator('button:has(svg.lucide-heart)');
    await favButton.click();

    // Assert that local storage received the update
    const localStorageDataStr = await page.evaluate(() => localStorage.getItem('metadachi-demo-state'));
    expect(localStorageDataStr).toBeTruthy();
    const localStorageData = JSON.parse(localStorageDataStr!);
    
    // Check local storage explicitly has our toggle
    expect(localStorageData['demo-project-ideas'].favorite).toBe(true);

    // Read the file and verify it was completely untouched (remains INITIAL_STATE).
    const stateContent = await fs.readFile(STATE_FILE_PATH, 'utf-8');
    const states = JSON.parse(stateContent);
    // Unchanged from initial
    expect(states['demo-project-ideas'].favorite).toBe(false);
  });

  test('Session Persistence on Refresh: State survives page reload in demo mode', async ({ page }) => {
    await page.goto('/');
    
    const teamSyncCard = page.locator('.h-full.cursor-pointer', { hasText: 'Weekly Team Sync' }).first();
    const pinButton = teamSyncCard.locator('button:has(svg.lucide-pin)');
    await pinButton.click();

    // Reload the page
    await page.reload();

    // Reattach to element
    const reloadedSyncCard = page.locator('.h-full.cursor-pointer', { hasText: 'Weekly Team Sync' }).first();
    const reloadedPinBtn = reloadedSyncCard.locator('button:has(svg.lucide-pin)');
    
    // It should still be pinned (filled icon) because it rehydrates from localStorage
    await expect(reloadedPinBtn.locator('svg')).toHaveClass(/fill-current/);
  });

  test('Multi-User Context Isolation: Second user does not see first user\'s state', async ({ browser }) => {
    // Context 1 acts as User A
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto('/');

    const setupPage = async (pageContext: any) => {
      await pageContext.goto('/');
      const teamSyncCard = pageContext.locator('.h-full.cursor-pointer', { hasText: 'Weekly Team Sync' }).first();
      return teamSyncCard.locator('button:has(svg.lucide-pin)');
    };

    const pinButtonA = await setupPage(pageA);
    // User A pins it
    await pinButtonA.click();
    await expect(pinButtonA.locator('svg')).toHaveClass(/fill-current/);

    // Context 2 acts as User B (Incognito / different computer)
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    
    const pinButtonB = await setupPage(pageB);
    
    // User B should NOT see it pinned
    await expect(pinButtonB.locator('svg')).not.toHaveClass(/fill-current/);

    await contextA.close();
    await contextB.close();
  });

});
