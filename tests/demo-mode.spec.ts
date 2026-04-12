import { test, expect } from '@playwright/test';
import fs from 'fs/promises';

import { STATE_FILE_PATH, manageOriginalState, resetStateFile, restoreOriginalState } from './test-utils';

let originalState: string = '{}';

test.beforeAll(async () => {
  originalState = await manageOriginalState();
});

test.describe('Demo Mode (IndexedDB overlay isolation)', () => {

  test.beforeEach(async () => {
    // Make sure we start strictly clean using deterministic test state. 
    await resetStateFile();
  });

  test.afterAll(async () => {
    // Restore the user's pristine vault state
    await restoreOriginalState(originalState);
  });

  test('Client Write & FS Isolation: Toggling favorite uses browser overlay only, ignores FS', async ({ page }) => {
    await page.goto('/');

    const ideaCard = page.locator('.h-full.cursor-pointer', { hasText: 'Project Ideas' }).first();
    const favButton = ideaCard.locator('button:has(svg.lucide-heart)');
    await favButton.click();

    await expect(favButton).toHaveClass(/text-red-500/);

    const hasIndexedOverlay = await page.evaluate(async () => {
      return new Promise<boolean>(resolve => {
        const req = indexedDB.open('metadachi-demo', 1);
        req.onerror = () => resolve(false);
        req.onsuccess = () => {
          const db = req.result;
          try {
            const tx = db.transaction('kv', 'readonly');
            const getReq = tx.objectStore('kv').get('overlay-v1');
            getReq.onsuccess = () => {
              db.close();
              resolve(getReq.result != null);
            };
            getReq.onerror = () => {
              db.close();
              resolve(false);
            };
          } catch {
            db.close();
            resolve(false);
          }
        };
      });
    });
    expect(hasIndexedOverlay).toBe(true);

    // Read the file and verify it was completely untouched (remains INITIAL_STATE).
    const stateContent = await fs.readFile(STATE_FILE_PATH, 'utf-8');
    const states = JSON.parse(stateContent);
    // Unchanged from initial
    expect(states['demo-project-ideas'].favorite).toBe(false);
  });

  test('Session Persistence on Refresh: State survives page reload in demo mode', async ({ page }) => {
    await page.goto('/');
    // Cards layout exposes the Pinned section; tree mode does not.
    await page.getByTestId('vault-view-cards').click();
    await expect(page.getByTestId('vault-view-cards')).toHaveAttribute('aria-pressed', 'true');

    const teamSyncCard = page.locator('.h-full.cursor-pointer', { hasText: 'Weekly Team Sync' }).first();
    const pinButton = teamSyncCard.locator('button:has(svg.lucide-pin)');
    await pinButton.click();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForResponse(
      res => res.url().includes('/api/vault') && res.request().method() === 'GET' && res.ok(),
      { timeout: 15_000 }
    );

    // Pinned cards render under the Pinned heading (more stable than Lucide SVG class names).
    const pinnedSection = page.locator('section').filter({ has: page.getByRole('heading', { name: /Pinned/i }) });
    await expect(pinnedSection).toContainText('Weekly Team Sync', { timeout: 15_000 });
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
    await expect(pinButtonA).toHaveClass(/text-yellow-500/);

    // Context 2 acts as User B (Incognito / different computer)
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    
    const pinButtonB = await setupPage(pageB);
    
    // User B should NOT see it pinned
    await expect(pinButtonB).not.toHaveClass(/text-yellow-500/);

    await contextA.close();
    await contextB.close();
  });

});
