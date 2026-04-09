import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

import { STATE_FILE_PATH, manageOriginalState, resetStateFile, restoreOriginalState } from './test-utils';

let originalState: string = '{}';

test.beforeAll(async () => {
  originalState = await manageOriginalState();
});

test.describe('Component Features & UI Resilience', () => {

  test.beforeEach(async ({ page }) => {
    await resetStateFile();
    await page.goto('/');
  });

  test.afterAll(async () => {
    await restoreOriginalState(originalState);
  });

  test('Filtering: Search bar actively mounts and unmounts cards', async ({ page }) => {
    // Both 'Chocolate Chip Cookies' and 'Weekly Team Sync' should initially be functionally visible
    await expect(page.locator('.h-full.cursor-pointer', { hasText: 'Chocolate Chip Cookies' }).first()).toBeVisible();
    await expect(page.locator('.h-full.cursor-pointer', { hasText: 'Weekly Team Sync' }).first()).toBeVisible();

    // Fill the search bar with specific term
    const searchInput = page.getByPlaceholder(/Search/i);
    await searchInput.fill('Cookies');

    // Chocolate Chip Cookies should remain visible...
    await expect(page.locator('.h-full.cursor-pointer', { hasText: 'Chocolate Chip Cookies' }).first()).toBeVisible();
    
    // ...But Weekly Team Sync must instantly disappear from DOM
    await expect(page.locator('.h-full.cursor-pointer', { hasText: 'Weekly Team Sync' }).first()).not.toBeVisible();
  });

  test('Filtering: Clicking tag chips filters vault properly', async ({ page }) => {
    // Click the "Recipes" filter chip
    const recipeChip = page.locator('.cursor-pointer.rounded-full', { hasText: /^Recipes/ });
    await recipeChip.click();

    // Verify it selected successfully (visual style changes to default)
    await expect(recipeChip).toHaveClass(/bg-primary/);

    // Chocolate Chip Cookies (Recipe) should be visible...
    await expect(page.locator('.h-full.cursor-pointer', { hasText: 'Chocolate Chip Cookies' }).first()).toBeVisible();
    
    // ...But Weekly Team Sync (Meeting) must not be rendered
    await expect(page.locator('.h-full.cursor-pointer', { hasText: 'Weekly Team Sync' }).first()).not.toBeVisible();
  });

  test('Modal Interactivity: CardModal mounts, renders content, and closes on escape', async ({ page }) => {
    const card = page.locator('.h-full.cursor-pointer', { hasText: 'Project Ideas' }).first();
    
    // Click the physical hit area to mount the dialog
    await card.click();

    // Assert that Dialog structurally mounted
    const dialogTitle = page.getByRole('heading', { name: 'Project Ideas', exact: false }).first();
    await expect(dialogTitle).toBeVisible();

    // Press Escape to conditionally tear down the dialog
    await page.keyboard.press('Escape');

    // Dialog should unmount cleanly, completely losing visibility
    await expect(dialogTitle).not.toBeVisible();
  });

  test('Status Hierarchy: Favorited cards completely supercede Pinned visually', async ({ page }) => {
    // In our TEST_STATE: "demo-chocolate-chip-cookies" is BOTH favorite:true and pinned:true
    
    // It should exist inside the "Favorites" layout section...
    const favoritesSection = page.locator('section:has(h2:has-text("Favorites"))');
    await expect(favoritesSection.locator('.h-full.cursor-pointer', { hasText: 'Chocolate Chip Cookies' }).first()).toBeVisible();

    // ...But it should absolutely NOT exist independently inside the "Pinned" section hierarchy!
    // If it did, it would create confusing duplicate cards across sections.
    const pinnedSection = page.locator('section:has(h2:has-text("Pinned"))');
    if (await pinnedSection.isVisible()) {
      await expect(pinnedSection.locator('.h-full.cursor-pointer', { hasText: 'Chocolate Chip Cookies' }).first()).not.toBeVisible();
    }
  });

});
