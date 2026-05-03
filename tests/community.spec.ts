import { test, expect } from '@playwright/test';
import { manageOriginalState, resetStateFile, resetConfigToFixture, restoreOriginalState } from './test-utils';

let originalState: string = '{}';

test.beforeAll(async () => {
  originalState = await manageOriginalState();
});

test.describe('Community Features', () => {

  test.beforeEach(async ({ page }) => {
    await resetStateFile();
    await resetConfigToFixture();
    
    // Mock Supabase Auth and Session Bridge
    await page.route('**/auth/v1/session**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { session: null }, error: null })
      });
    });

    await page.route('**/api/auth/sync-session', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await page.goto('/');
  });

  test.afterAll(async () => {
    await restoreOriginalState(originalState);
  });

  test('Settings: Can update author handle and hub URL', async ({ page }) => {
    const settingsButton = page.locator('button[title="Community Settings"]');
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Community Settings');

    const handleInput = dialog.locator('input#handle');
    const hubUrlInput = dialog.locator('input#hubUrl');
    
    await handleInput.fill('@test_user');
    await hubUrlInput.fill('https://hub.example.com');
    
    // Save changes and wait for the API call
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/config') && res.request().method() === 'POST'),
      page.click('button:has-text("Save Changes")')
    ]);
    
    // Wait for dialog to disappear
    await expect(dialog).not.toBeVisible();
    
    // Reopen to verify persistence
    await settingsButton.click();
    
    // Wait for the dialog to be stable and inputs to have values
    const newDialog = page.getByRole('dialog');
    await expect(newDialog.locator('input#handle')).toHaveValue('@test_user');
    await expect(newDialog.locator('input#hubUrl')).toHaveValue('https://hub.example.com');
  });

  test('Publishing: Toggling the globe icon updates state', async ({ page }) => {
    // Open a card
    await page.locator('.h-full.cursor-pointer', { hasText: 'Chocolate Chip Cookies' }).first().click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    const publishButton = dialog.locator('button[title^="Publish"]');
    await expect(publishButton).toBeVisible();
    
    // Toggle publish
    await publishButton.click();
    
    // Verify visual change
    await expect(publishButton).toHaveClass(/text-blue-500/);
    await expect(publishButton).toHaveAttribute('title', 'Published to Community');
    
    // Toggle off
    await publishButton.click();
    await expect(publishButton).toHaveClass(/text-muted-foreground/);
    await expect(publishButton).toHaveAttribute('title', 'Publish to Community');
  });

  test('Community Search: Switching modes shows mock community results', async ({ page }) => {
    // Mock Supabase search results
    // Supabase JS client uses /rest/v1/cards
    await page.route('**/rest/v1/cards**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'community-card-1',
            title: 'Community Pizza Recipe',
            raw_content: 'Best pizza ever',
            type: 'recipe',
            tags: ['pizza'],
            created_at: new Date().toISOString(),
            slug: 'community-pizza',
            profiles: { handle: 'pizza_chef' }
          }
        ])
      });
    });

    // Toggle to Community Search
    await page.click('button:has-text("Community")');
    
    // Should see "Community Results" heading
    await expect(page.getByText('Community Results')).toBeVisible();
    
    // Should see the mocked result
    await expect(page.locator('div', { hasText: 'Community Pizza Recipe' }).last()).toBeVisible();
  });

  test('Forking: Importing a community card triggers API call', async ({ page }) => {
    await page.route('**/rest/v1/cards**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'community-card-1',
            title: 'Forkable Note',
            raw_content: 'Content to fork',
            type: 'note',
            tags: [],
            created_at: new Date().toISOString(),
            slug: 'forkable-note',
            profiles: { handle: 'sharer' }
          }
        ])
      });
    });

    await page.click('button:has-text("Community")');
    
    const card = page.locator('div.group:has-text("Forkable Note")').first();
    await expect(card).toBeVisible();
    
    // The import button is visible on hover, but we can click it directly with force
    const importButton = card.locator('button[title="Import to Vault"]');
    
    // Trigger import and wait for API call
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('/api/vault/file') && req.method() === 'POST'),
      importButton.click({ force: true })
    ]);
    
    const postData = JSON.parse(request.postData() || '{}');
    expect(postData.raw).toContain('source: community');
    expect(postData.raw).toContain('inbox: true');
  });

  test('Public Profile: Renders user profile and cards', async ({ page }) => {
    // Intercept the API call made by the Hub Mode or the profile page
    // The profile page /u/alex calls Supabase directly on the server, BUT 
    // the page is rendered on the server, so we need to mock the response 
    // for the server-side fetch if possible, or just ensure the mock is global.
    
    await page.route('**/rest/v1/cards**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'user-card-1',
            title: 'Alexs Secret Sauce',
            raw_content: 'Secret content',
            type: 'recipe',
            tags: ['secret'],
            created_at: new Date().toISOString(),
            slug: 'secret-sauce',
            profiles: { handle: 'alex' }
          }
        ])
      });
    });

    // Go to public profile with mock flag for E2E
    await page.goto('/u/alex?mock=true');
    
    // Check header
    await expect(page.getByRole('heading', { name: '@alex' })).toBeVisible();
    
    // Check card
    await expect(page.getByText('Alexs Secret Sauce')).toBeVisible();
  });
});
