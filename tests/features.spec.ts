import { test, expect } from '@playwright/test';

import { manageOriginalState, resetStateFile, resetConfigToFixture, restoreOriginalState } from './test-utils';

let originalState: string = '{}';

test.beforeAll(async () => {
  originalState = await manageOriginalState();
});

test.describe('Component Features & UI Resilience', () => {

  test.beforeEach(async ({ page }) => {
    await resetStateFile();
    await resetConfigToFixture();
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
    const recipeChip = page.getByTestId('filter-chip-recipe');
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

  test('FilterBar: reordering chips calls /api/config and order survives reload', async ({
    page,
    request,
  }) => {
    const recipe = page.getByTestId('filter-reorder-recipe');
    const meeting = page.getByTestId('filter-reorder-meeting');
    await expect(recipe).toBeVisible();
    await expect(meeting).toBeVisible();

    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes('/api/config') &&
        res.request().method() === 'POST' &&
        res.status() === 200
    );

    const fromBox = await recipe.boundingBox();
    const toBox = await meeting.boundingBox();
    expect(fromBox).toBeTruthy();
    expect(toBox).toBeTruthy();
    await page.mouse.move(fromBox!.x + fromBox!.width / 2, fromBox!.y + fromBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(toBox!.x + toBox!.width / 2, toBox!.y + toBox!.height / 2, { steps: 12 });
    await page.mouse.up();

    const response = await responsePromise;
    const body = (await response.json()) as { config?: { filterBarOrder?: string[] } };
    const savedOrder = body.config?.filterBarOrder;
    expect(savedOrder?.[0]).toBe('all');
    expect(savedOrder?.[1]).toBe('meeting');
    expect(savedOrder?.[2]).toBe('recipe');

    await page.reload({ waitUntil: 'load' });
    await expect(page.getByTestId('filter-chip-meeting')).toBeVisible();

    const configRes = await request.get('/api/config');
    expect(configRes.ok()).toBeTruthy();
    const persisted = (await configRes.json()) as { filterBarOrder?: string[] };
    expect(persisted.filterBarOrder).toEqual(savedOrder);

    const recipeBox = await page.getByTestId('filter-chip-recipe').boundingBox();
    const meetingBox = await page.getByTestId('filter-chip-meeting').boundingBox();
    expect(recipeBox).toBeTruthy();
    expect(meetingBox).toBeTruthy();
    expect(meetingBox!.x).toBeLessThan(recipeBox!.x);
  });

});
