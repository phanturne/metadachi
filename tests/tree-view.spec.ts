import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { manageOriginalState, resetStateFile, restoreOriginalState } from './test-utils';

let originalState: string = '{}';

test.beforeAll(async () => {
  originalState = await manageOriginalState();
});

test.afterAll(async () => {
  await restoreOriginalState(originalState);
});

function cleanupRootNotes() {
  const root = path.join(process.cwd(), 'demo-vault');
  if (!fs.existsSync(root)) return;
  for (const name of fs.readdirSync(root)) {
    if (name.startsWith('note-') && name.endsWith('.md')) {
      fs.unlinkSync(path.join(root, name));
    }
  }
}

test.describe('Tree view', () => {
  test.beforeEach(async () => {
    await resetStateFile();
    cleanupRootNotes();
  });

  test.afterEach(() => {
    cleanupRootNotes();
  });

  test('switch to tree mode and Save is disabled until markdown changes', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('vault-view-tree').click();

    await page.getByTestId('vault-file-item-ProjectIdeas.md').click();
    const save = page.getByRole('button', { name: 'Save' });
    await expect(save).toBeDisabled();

    await page.getByRole('textbox', { name: 'Markdown source' }).fill('# edited\n');
    await expect(save).toBeEnabled();
  });

  test('tree vs cards mode persists across reload (localStorage)', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('vault-view-tree').click();
    await expect(page.getByTestId('vault-view-tree')).toHaveAttribute('aria-pressed', 'true');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForResponse(
      res => res.url().includes('/api/vault') && res.request().method() === 'GET' && res.ok(),
      { timeout: 15_000 }
    );

    await expect(page.getByTestId('vault-view-tree')).toHaveAttribute('aria-pressed', 'true');
    // Tree selection is not persisted; editor chrome appears only after picking a file.
    await expect(page.getByText('Select a file in the tree to edit.')).toBeVisible();
  });

  test('expanding a folder stays expanded after New note', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('vault-view-tree').click();

    await page.getByTestId('vault-file-item-recipes').click();
    const cookieItem = page.getByTestId('vault-file-item-recipes__ChocolateChipCookies.md');
    await expect(cookieItem).toBeVisible();

    await page.getByRole('button', { name: 'New note' }).click();
    await expect(cookieItem).toBeVisible();
  });
});
